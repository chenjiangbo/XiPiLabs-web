import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { users, auth_identities } from '@prisma/client';

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface DecodedAuthToken extends jwt.JwtPayload {
    sub: string;
    email?: string;
    name?: string;
}

function requireJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }
    return secret;
}

export function issueAuthToken(user: users, displayName?: string): string {
    const jwtSecret = requireJwtSecret();
    return jwt.sign(
        {
            sub: user.id,
            email: user.email || undefined,
            name: displayName || user.email || undefined,
            iss: 'xipilabs-auth',
            aud: 'xipilabs-products',
        },
        jwtSecret,
        { expiresIn: TOKEN_TTL_SECONDS }
    );
}

export function verifyAuthToken(token: string): DecodedAuthToken {
    const jwtSecret = requireJwtSecret();
    return jwt.verify(token, jwtSecret) as DecodedAuthToken;
}

export function getAuthTokenFromRequest(req: NextRequest): string | null {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7).trim() || null;
    }
    return req.cookies.get('auth-token')?.value ?? null;
}

export function buildCookieOptions() {
    return {
        domain: '.xipilabs.com',
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none' as const,
        maxAge: TOKEN_TTL_SECONDS,
    };
}

export interface UserIdentitySummary {
    displayName?: string | null;
    avatarUrl?: string | null;
}

export function resolveLatestIdentity(
    identities: auth_identities[] | null | undefined
): UserIdentitySummary {
    if (!identities || identities.length === 0) {
        return {};
    }
    const sorted = [...identities].sort((a, b) => {
        const aTime = a.updated_at?.getTime() ?? 0;
        const bTime = b.updated_at?.getTime() ?? 0;
        return bTime - aTime;
    });
    const latest = sorted[0];
    return { displayName: latest?.display_name, avatarUrl: latest?.avatar_url };
}
