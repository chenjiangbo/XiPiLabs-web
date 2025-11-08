import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('JWT_SECRET is not defined');
        return NextResponse.json({ error: 'Internal server configuration error' }, { status: 500 });
    }

    try {
        const payload = jwt.verify(token, jwtSecret) as { userId: string };
        const userId = payload.userId;

        if (!userId) {
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

        const latestIdentity = user.auth_identities[0];

        const userData = {
            id: user.id,
            email: user.email,
            phone: user.phone,
            displayName: latestIdentity?.display_name || user.email, // Fallback to email if display name is not set
            avatarUrl: latestIdentity?.avatar_url,
        };

        return NextResponse.json(userData);

    } catch (error) {
        console.error('[API /me Error]', error);
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
}
