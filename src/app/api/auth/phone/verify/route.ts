
import { NextResponse } from 'next/server';
import { Redis } from 'ioredis';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// --- 辅助函数 ---

const PHONE_RE = /^\\+?\\d{6,15}$/;

function normalizePhone(phone: string): string {
    let p = phone.replace(/\\s+/g, '');
    if (p.startsWith('00')) {
        p = '+' + p.substring(2);
    }
    if (!p.startsWith('+')) {
        if (p.length === 11) {
            p = '+86' + p;
        } else {
            p = '+' + p;
        }
    }
    return p;
}

function hash(code: string): string {
    const secret = process.env.JWT_SECRET || 'otp-secret';
    return crypto.createHmac('sha256', secret).update(code).digest('hex');
}

async function verifyCode(redis: Redis, phone: string, code: string): Promise<[boolean, string | null]> {
    const key = `otp:phone:code:${phone}`;
    const h = await redis.get(key);
    if (!h) {
        return [false, "expired"];
    }

    const attKey = `otp:phone:attempts:${phone}`;
    const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10);
    const attempts = await redis.incr(attKey);

    if (attempts > maxAttempts) {
        return [false, "too_many_attempts"];
    }

    const isMatch = h === hash(code);
    if (isMatch) {
        await redis.del(key, attKey);
    }

    return [isMatch, isMatch ? null : "mismatch"];
}

// --- API 路由处理 ---

export async function POST(request: Request) {
    const body = await request.json();
    const { phone, code } = body;

    if (!phone || !code) {
        return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);
    if (!PHONE_RE.test(normalizedPhone)) {
        return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

    try {
        const [isValid, reason] = await verifyCode(redis, normalizedPhone, code.trim());
        if (!isValid) {
            return NextResponse.json({ error: `OTP validation failed: ${reason}` }, { status: 400 });
        }

        // 验证码正确，处理用户数据库逻辑
        const now = new Date();
        let user = await prisma.users.findFirst({
            where: { phone_number: normalizedPhone },
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
                    phone_number: normalizedPhone,
                    auth_provider: 'phone',
                    // 根据 TaleWeave schema 设置默认值
                    subscription_status: 'free',
                    last_login_at: now,
                    created_at: now,
                    updated_at: now,
                    membership_tier: 'free',
                    points_balance: 0, // 或者调用积分服务给予初始积分
                    lifetime_points_earned: 0,
                    lifetime_points_spent: 0,
                },
            });
        }

        // 签发 JWT
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }

        const tokenPayload = {
            sub: user.id,
            phone: user.phone_number,
            provider: 'phone',
        };

        const token = jwt.sign(tokenPayload, jwtSecret, {
            expiresIn: '7d',
            issuer: 'www.xipilabs.com',
            audience: 'xipilabs-products',
        });

        // 设置跨域 Cookie 并返回响应
        const response = NextResponse.json({ success: true, userId: user.id });
        
        response.cookies.set('auth-token', token, {
            domain: '.xipilabs.com',
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;

    } catch (error) {
        console.error('Error in /api/auth/phone/verify:', error);
        const errorMessage = error instanceof Error ? error.message : 'An internal error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    } finally {
        redis.quit();
    }
}
