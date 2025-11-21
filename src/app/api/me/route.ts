import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthTokenFromRequest, verifyAuthToken, resolveLatestIdentity } from '@/lib/auth-token';

export async function GET(req: NextRequest) {
    const token = getAuthTokenFromRequest(req);

    if (!token) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const payload = verifyAuthToken(token);
        const userId = payload.sub;

        if (!userId || typeof userId !== 'string') {
            return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
        }

        // Fetch user and their identities
        const user = await prisma.users.findUnique({
            where: { id: userId },
            include: {
                auth_identities: {
                    orderBy: {
                        updated_at: 'desc',
                    },
                    take: 1,
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const latestIdentity = resolveLatestIdentity(user.auth_identities);

        const userData = {
            id: user.id,
            email: user.email,
            phone: user.phone,
            displayName: latestIdentity.displayName || user.email,
            avatarUrl: latestIdentity.avatarUrl,
        };

        return NextResponse.json(userData);

    } catch (error) {
        console.error('[API /me Error]', error);
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
}
