import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
    buildCookieOptions,
    getAuthTokenFromRequest,
    issueAuthToken,
    resolveLatestIdentity,
    verifyAuthToken,
} from '@/lib/auth-token';

export async function POST(req: NextRequest) {
    const token = getAuthTokenFromRequest(req);

    if (!token) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const decoded = verifyAuthToken(token);
        if (!decoded.sub) {
            return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
        }

        const user = await prisma.users.findUnique({
            where: { id: decoded.sub },
            include: { auth_identities: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const identity = resolveLatestIdentity(user.auth_identities);
        const refreshedToken = issueAuthToken(user, identity.displayName || undefined);

        const responsePayload = {
            token: refreshedToken,
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                displayName: identity.displayName || user.email,
                avatarUrl: identity.avatarUrl,
            },
        };

        const response = NextResponse.json(responsePayload);
        response.cookies.set('auth-token', refreshedToken, buildCookieOptions());
        return response;
    } catch (error) {
        console.error('[Mobile Refresh Error]', error);
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
}
