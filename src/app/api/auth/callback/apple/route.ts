export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { createPublicKey } from 'crypto';
import type { JsonWebKey } from 'crypto';
import { prisma } from '@/lib/prisma';
import { consumeOAuthState, DEFAULT_REDIRECT_URL, appendQueryParams, isCustomSchemeUrl } from '@/lib/oauth';
import { users } from '@prisma/client';
import { issueAuthToken, buildCookieOptions } from '@/lib/auth-token';

interface AppleTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    id_token: string;
    refresh_token?: string;
}

interface AppleIdTokenPayload {
    sub: string;
    email?: string;
    email_verified?: string;
}

interface AppleUserPayload {
    name?: {
        firstName?: string;
        lastName?: string;
    };
    email?: string;
}

interface AppleProfile {
    sub: string;
    email?: string;
    name?: string;
}

function getEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}

function normalizePrivateKey(raw: string): string {
    return raw.replace(/\\n/g, '\n');
}

function buildAppleClientSecret(): string {
    const teamId = getEnvVar('APPLE_TEAM_ID');
    const clientId = getEnvVar('APPLE_CLIENT_ID');
    const keyId = getEnvVar('APPLE_KEY_ID');
    const privateKey = normalizePrivateKey(getEnvVar('APPLE_PRIVATE_KEY'));
    const now = Math.floor(Date.now() / 1000);

    return jwt.sign(
        {
            iss: teamId,
            iat: now,
            exp: now + 60 * 60 * 6, // 6 hours validity
            aud: 'https://appleid.apple.com',
            sub: clientId,
        },
        privateKey,
        {
            algorithm: 'ES256',
            keyid: keyId,
        }
    );
}

async function exchangeCodeForTokens(code: string): Promise<AppleTokenResponse> {
    const clientId = getEnvVar('APPLE_CLIENT_ID');
    const redirectUri = getEnvVar('APPLE_REDIRECT_URI');
    const clientSecret = buildAppleClientSecret();

    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
    });

    const response = await fetch('https://appleid.apple.com/auth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[Apple Token Exchange Error]', errorText);
        throw new Error('Failed to exchange code with Apple');
    }

    return (await response.json()) as AppleTokenResponse;
}

async function fetchAppleJwk(kid: string): Promise<JsonWebKey> {
    const response = await fetch('https://appleid.apple.com/auth/keys');
    if (!response.ok) {
        throw new Error('Unable to load Apple public keys');
    }
    const data = await response.json();
    const match = Array.isArray(data.keys) ? data.keys.find((key: { kid: string }) => key.kid === kid) : null;
    if (!match) {
        throw new Error('Apple public key not found');
    }
    return match as JsonWebKey;
}

async function verifyAppleIdToken(idToken: string): Promise<AppleIdTokenPayload> {
    const decoded = jwt.decode(idToken, { complete: true });
    if (!decoded || typeof decoded === 'string') {
        throw new Error('Invalid Apple ID token');
    }

    const kid = decoded.header?.kid;
    if (!kid) {
        throw new Error('Missing Apple key identifier');
    }

    const jwk = await fetchAppleJwk(kid);
    const publicKey = createPublicKey({ key: jwk, format: 'jwk' });
    const pem = publicKey.export({ format: 'pem', type: 'spki' });

    return jwt.verify(idToken, pem, {
        algorithms: ['RS256'],
        audience: getEnvVar('APPLE_CLIENT_ID'),
        issuer: 'https://appleid.apple.com',
    }) as AppleIdTokenPayload;
}

function parseAppleUser(raw: string | null): { name?: string; email?: string } {
    if (!raw) {
        return {};
    }
    try {
        const parsed = JSON.parse(raw) as AppleUserPayload;
        const first = parsed.name?.firstName?.trim() || '';
        const last = parsed.name?.lastName?.trim() || '';
        const name = `${first} ${last}`.trim() || undefined;
        return {
            name,
            email: parsed.email || undefined,
        };
    } catch (err) {
        console.warn('[Apple Callback] Failed to parse user payload', err);
        return {};
    }
}

async function upsertAppleUser(profile: AppleProfile): Promise<users> {
    const now = new Date();
    const displayName = profile.name || (profile.email ? profile.email.split('@')[0] : undefined);

    const existingIdentity = await prisma.auth_identities.findFirst({
        where: {
            provider: 'apple',
            provider_uid: profile.sub,
        },
    });

    if (existingIdentity) {
        await prisma.auth_identities.update({
            where: { id: existingIdentity.id },
            data: {
                display_name: displayName,
                updated_at: now,
            },
        });
        return prisma.users.update({
            where: { id: existingIdentity.user_id },
            data: { last_login_at: now },
        });
    }

    if (!profile.email) {
        throw new Error('Apple did not provide an email address for this account');
    }

    let user = await prisma.users.findFirst({
        where: { email: profile.email },
    });

    if (user) {
        user = await prisma.users.update({
            where: { id: user.id },
            data: { last_login_at: now },
        });
    } else {
        user = await prisma.users.create({
            data: {
                id: uuidv4(),
                email: profile.email,
                auth_provider: 'apple',
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

    await prisma.auth_identities.create({
        data: {
            id: uuidv4(),
            user_id: user.id,
            provider: 'apple',
            provider_uid: profile.sub,
            display_name: displayName,
            created_at: now,
            updated_at: now,
        },
    });

    return user;
}

async function handleCallback(params: URLSearchParams) {
    const code = params.get('code');
    const state = params.get('state');
    const rawUser = params.get('user');

    console.log('[Apple Callback] incoming params', {
        codePresent: Boolean(code),
        state,
        rawUserPresent: Boolean(rawUser),
    });

    if (!code || !state) {
        console.warn('[Apple Callback] missing code/state', { codePresent: Boolean(code), state });
        return NextResponse.json({ error: 'Invalid Apple callback payload' }, { status: 400 });
    }

    const session = await consumeOAuthState('apple', state);
    if (!session) {
        console.warn('[Apple Callback] state not found or expired', { state });
        return NextResponse.json({ error: 'Invalid or expired state' }, { status: 400 });
    }
    const redirectUrl = session.redirectUrl || DEFAULT_REDIRECT_URL;

    try {
        const tokenResponse = await exchangeCodeForTokens(code);
        if (!tokenResponse.id_token) {
            throw new Error('Apple did not return an id_token');
        }

        const payload = await verifyAppleIdToken(tokenResponse.id_token);
        const parsedUser = parseAppleUser(rawUser);

        const profile: AppleProfile = {
            sub: payload.sub,
            email: payload.email || parsedUser.email,
            name: parsedUser.name,
        };

        const user = await upsertAppleUser(profile);

        const authToken = issueAuthToken(user, profile.name);

        let destination = redirectUrl;
        if (isCustomSchemeUrl(redirectUrl)) {
            destination = appendQueryParams(redirectUrl, {
                token: authToken,
                user_id: user.id,
                email: user.email ?? undefined,
            });
        }

        const response = new NextResponse(null, {
            status: 303,
            headers: {
                Location: destination,
            },
        });
        response.cookies.set('auth-token', authToken, buildCookieOptions());
        console.log('[Apple Callback] success', { userId: user.id, destination });
        return response;
    } catch (error) {
        console.error('[Apple Callback Error]', error);
        const message = error instanceof Error ? error.message : 'Unknown Apple callback error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    console.log('[Apple Callback] request headers', {
        origin: req.headers.get('origin'),
        xForwardedHost: req.headers.get('x-forwarded-host'),
        contentType: req.headers.get('content-type'),
    });
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
        const body = await req.text();
        const params = new URLSearchParams(body);
        return handleCallback(params);
    }

    if (contentType.includes('application/json')) {
        const json = await req.json();
        const params = new URLSearchParams(json);
        return handleCallback(params);
    }

    const formData = await req.formData();
    const params = new URLSearchParams();
    formData.forEach((value, key) => {
        params.append(key, String(value));
    });
    return handleCallback(params);
}

export async function GET(req: NextRequest) {
    console.log('[Apple Callback] request headers', {
        origin: req.headers.get('origin'),
        xForwardedHost: req.headers.get('x-forwarded-host'),
    });
    return handleCallback(req.nextUrl.searchParams);
}
