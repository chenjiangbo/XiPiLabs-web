import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { users } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { issueAuthToken, buildCookieOptions } from '@/lib/auth-token';
import { consumeOAuthState, DEFAULT_REDIRECT_URL, appendQueryParams, isCustomSchemeUrl } from '@/lib/oauth';
import { exchangeAuthCodeForToken, fetchAlipayUserProfile } from '@/lib/alipay-auth';

interface UpsertAlipayUserInput {
    userId: string;
    nickName?: string;
    avatar?: string;
}

async function upsertAlipayUser(profile: UpsertAlipayUserInput): Promise<users> {
    return prisma.$transaction(async (tx) => {
        const now = new Date();
        const existingIdentity = await tx.auth_identities.findFirst({
            where: {
                provider: 'alipay',
                provider_uid: profile.userId,
            },
        });

        if (existingIdentity) {
            await tx.auth_identities.update({
                where: { id: existingIdentity.id },
                data: {
                    display_name: profile.nickName ?? existingIdentity.display_name,
                    avatar_url: profile.avatar ?? existingIdentity.avatar_url,
                    updated_at: now,
                },
            });
            return tx.users.update({
                where: { id: existingIdentity.user_id },
                data: { last_login_at: now, updated_at: now },
            });
        }

        const user = await tx.users.create({
            data: {
                id: uuidv4(),
                email: null,
                auth_provider: 'alipay',
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

        await tx.auth_identities.create({
            data: {
                id: uuidv4(),
                user_id: user.id,
                provider: 'alipay',
                provider_uid: profile.userId,
                display_name: profile.nickName ?? null,
                avatar_url: profile.avatar ?? null,
                created_at: now,
                updated_at: now,
            },
        });

        return user;
    });
}

export async function GET(req: NextRequest) {
    const authCode = req.nextUrl.searchParams.get('auth_code');
    const state = req.nextUrl.searchParams.get('state');
    console.log('[Alipay Callback] incoming', {
        state,
        authCodePresent: Boolean(authCode),
        ua: req.headers.get('user-agent') || '',
        referer: req.headers.get('referer') || '',
    });

    if (!authCode || !state) {
        return NextResponse.json({ error: 'Invalid callback payload' }, { status: 400 });
    }

    const session = await consumeOAuthState('alipay', state);
    if (!session) {
        console.warn('[Alipay Callback] missing oauth state', { state });
        return NextResponse.json({ error: 'Invalid or expired state' }, { status: 400 });
    }

    const redirectUrl = session.redirectUrl || DEFAULT_REDIRECT_URL;
    console.log('[Alipay Callback] resolved redirect', { state, redirectUrl });

    try {
        const tokenResult = await exchangeAuthCodeForToken(authCode);
        const profile = await fetchAlipayUserProfile(tokenResult.accessToken);

        const user = await upsertAlipayUser({
            userId: profile.userId || tokenResult.userId,
            nickName: profile.nickName,
            avatar: profile.avatar,
        });
        const authToken = issueAuthToken(user, profile.nickName);

        let destination = redirectUrl;
        if (isCustomSchemeUrl(redirectUrl)) {
            destination = appendQueryParams(redirectUrl, {
                token: authToken,
                user_id: user.id,
                email: user.email ?? undefined,
            });
        }

        const response = NextResponse.redirect(destination);
        if (!isCustomSchemeUrl(redirectUrl)) {
            response.cookies.set('auth-token', authToken, buildCookieOptions());
        }
        console.log('[Alipay Callback] success', {
            state,
            destination,
            isCustomScheme: isCustomSchemeUrl(redirectUrl),
        });
        return response;
    } catch (error) {
        console.error('[Alipay Callback Error]', error);
        const message = error instanceof Error ? error.message : 'Unknown Alipay callback error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
