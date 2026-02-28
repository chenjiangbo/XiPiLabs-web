import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { users } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { issueAuthToken, buildCookieOptions } from '@/lib/auth-token';
import { appendQueryParams, isCustomSchemeUrl } from '@/lib/oauth';
import {
    clearEmailCode,
    getEmailCode,
    isValidEmail,
    loadEmailAuthConfig,
    normalizeEmail,
    updateEmailCode,
} from '@/lib/email-auth';

interface VerifyCodeRequestBody {
    email?: string;
    code?: string;
}

async function upsertEmailUser(email: string): Promise<users> {
    return prisma.$transaction(async (tx) => {
        const now = new Date();
        let user = await tx.users.findFirst({ where: { email } });

        if (user) {
            user = await tx.users.update({
                where: { id: user.id },
                data: { last_login_at: now, updated_at: now },
            });
        } else {
            user = await tx.users.create({
                data: {
                    id: uuidv4(),
                    email,
                    auth_provider: 'email',
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

        const existingIdentity = await tx.auth_identities.findFirst({
            where: {
                user_id: user.id,
                provider: 'email',
            },
        });

        const displayName = email.split('@')[0];

        if (existingIdentity) {
            await tx.auth_identities.update({
                where: { id: existingIdentity.id },
                data: {
                    provider_uid: email,
                    display_name: displayName,
                    updated_at: now,
                },
            });
        } else {
            await tx.auth_identities.create({
                data: {
                    id: uuidv4(),
                    user_id: user.id,
                    provider: 'email',
                    provider_uid: email,
                    display_name: displayName,
                    created_at: now,
                    updated_at: now,
                },
            });
        }

        return user;
    });
}

export async function POST(req: NextRequest) {
    let body: VerifyCodeRequestBody;
    try {
        body = (await req.json()) as VerifyCodeRequestBody;
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const rawEmail = body.email;
    const code = body.code?.trim();

    if (!rawEmail || typeof rawEmail !== 'string') {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!code) {
        return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
    }
    if (!/^\d{6}$/.test(code)) {
        return NextResponse.json({ error: 'Invalid verification code format' }, { status: 400 });
    }

    const email = normalizeEmail(rawEmail);
    if (!isValidEmail(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const config = loadEmailAuthConfig();
    const { record, ttlSeconds } = await getEmailCode(email);
    if (!record || ttlSeconds <= 0) {
        return NextResponse.json({ error: 'Verification code expired or missing' }, { status: 400 });
    }

    if (record.code !== code) {
        const nextAttempts = record.attempts + 1;
        if (nextAttempts >= config.maxAttempts) {
            await clearEmailCode(email);
            return NextResponse.json(
                { error: 'Too many failed attempts, please request a new code' },
                { status: 400 }
            );
        }
        await updateEmailCode(
            email,
            {
                ...record,
                attempts: nextAttempts,
            },
            ttlSeconds
        );
        return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    await clearEmailCode(email);

    try {
        const user = await upsertEmailUser(email);
        const authToken = issueAuthToken(user, email.split('@')[0]);

        let destination = record.redirectUrl;
        if (isCustomSchemeUrl(destination)) {
            destination = appendQueryParams(destination, {
                token: authToken,
                user_id: user.id,
                email: user.email ?? undefined,
            });
        }

        const response = NextResponse.json({ success: true, redirect_to: destination });
        response.cookies.set('auth-token', authToken, buildCookieOptions());
        return response;
    } catch (error) {
        console.error('[Email Verify Code Error]', error);
        return NextResponse.json({ error: 'Failed to complete login' }, { status: 500 });
    }
}
