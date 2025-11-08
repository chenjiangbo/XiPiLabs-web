import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import { users, auth_identities } from '@prisma/client';

/**
 * Finds an existing user by email or creates a new one. Also creates or updates
 * the associated auth_identity with the display name and avatar from Google.
 * @param userInfo - The user profile information from Google.
 * @returns The found or created user from the database.
 */
async function upsertGoogleUser(userInfo: TokenPayload): Promise<users> {
    if (!userInfo.email) {
        throw new Error('Email not found in Google user info');
    }

    const userAndIdentity = await prisma.$transaction(async (tx) => {
        const now = new Date();

        // 1. Find or create the main user record
        let user: users | null = await tx.users.findFirst({
            where: { email: userInfo.email },
        });

        if (user) {
            user = await tx.users.update({
                where: { id: user.id },
                data: { last_login_at: now },
            });
        } else {
            user = await tx.users.create({
                data: {
                    id: uuidv4(),
                    email: userInfo.email,
                    auth_provider: 'google',
                    subscription_status: 'free',
                    last_login_at: now,
                    created_at: now,
                    updated_at: now,
                    membership_tier: 'free',
                    points_balance: 0,
                    lifetime_points_earned: 0,
                    lifetime_points_spent: 0,
                },
            });
        }

        // 2. Find, then update or create the specific auth identity
        const existingIdentity = await tx.auth_identities.findFirst({
            where: {
                user_id: user.id,
                provider: 'google',
            },
        });

        if (existingIdentity) {
            await tx.auth_identities.update({
                where: { id: existingIdentity.id },
                data: {
                    provider_uid: userInfo.sub,
                    display_name: userInfo.name,
                    avatar_url: userInfo.picture,
                    updated_at: now,
                },
            });
        } else {
            await tx.auth_identities.create({
                data: {
                    id: uuidv4(),
                    user_id: user.id,
                    provider: 'google',
                    provider_uid: userInfo.sub,
                    display_name: userInfo.name,
                    avatar_url: userInfo.picture,
                    created_at: now,
                    updated_at: now,
                },
            });
        }

        return user;
    });

    return userAndIdentity;
}


// Helper to get environment variables.
function getEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Missing env var: ${name}`);
    return value;
}

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const redis = new Redis(getEnvVar('REDIS_URL'));

    try {
        // --- 1. Verify State (CSRF Protection) ---
        const storedState = await redis.get(state);
        if (!storedState) {
            throw new Error('Invalid state. CSRF attack suspected.');
        }
        await redis.del(state); // State should only be used once

        // --- 2. Exchange Code for Tokens ---
        const oauth2Client = new OAuth2Client(
            getEnvVar('GOOGLE_CLIENT_ID'),
            getEnvVar('GOOGLE_CLIENT_SECRET'),
            getEnvVar('GOOGLE_REDIRECT_URI')
        );
        const { tokens } = await oauth2Client.getToken(code);
        const idToken = tokens.id_token;

        if (!idToken) {
            throw new Error('ID token not found in Google response');
        }

        // --- 3. Get User Info from ID Token ---
        const ticket = await oauth2Client.verifyIdToken({
            idToken: idToken,
            audience: getEnvVar('GOOGLE_CLIENT_ID'),
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new Error('Invalid user info from Google');
        }

        // --- 4. Find or Create User in DB ---
        const user = await upsertGoogleUser(payload);

        // --- 5. Sign Your Own JWT ---
        const jwtSecret = getEnvVar('JWT_SECRET');
        const authToken = jwt.sign(
            {
                sub: user.id, // Use 'sub' for subject, a standard JWT claim
                email: user.email,
                name: payload.name,
                picture: payload.picture,
                iss: 'xipilabs-auth',
            },
            jwtSecret,
            { expiresIn: '7d' } // Token valid for 7 days
        );

        // --- 6. Create response, set cookie, and redirect ---
        const finalRedirectUrl = 'https://www.xipilabs.com';
        const response = NextResponse.redirect(finalRedirectUrl);

        response.cookies.set('auth-token', authToken, {
            domain: '.xipilabs.com',
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
        });

        return response;

    } catch (error) {
        console.error('[Google Callback Error]', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown authentication error';
        return NextResponse.json(
            { error: 'Authentication failed', details: errorMessage },
            { status: 500 }
        );
    } finally {
        await redis.quit();
    }
}
