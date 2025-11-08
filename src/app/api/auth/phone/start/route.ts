
import { NextResponse } from 'next/server';
import { Redis } from 'ioredis';
import crypto from 'crypto';
import DysmsClient, { SendSmsRequest } from '@alicloud/dysmsapi20170525';
import * as $OpenApi from '@alicloud/openapi-client';

// --- 从 TaleWeave 迁移过来的辅助函数 ---

const PHONE_RE = /^\\+?\\d{6,15}$/;

function normalizePhone(phone: string): string {
    let p = phone.replace(/\\s+/g, '');
    if (p.startsWith('00')) {
        p = '+' + p.substring(2);
    }
    if (!p.startsWith('+')) {
        // 默认为中国大陆
        if (p.length === 11) {
            p = '+86' + p;
        } else {
            p = '+' + p;
        }
    }
    return p;
}

function genCode(n: number): string {
    const lo = 10 ** (n - 1);
    const hi = (10 ** n) - 1;
    return Math.floor(lo + Math.random() * (hi - lo + 1)).toString();
}

function hash(code: string): string {
    const secret = process.env.JWT_SECRET || 'otp-secret';
    return crypto.createHmac('sha256', secret).update(code).digest('hex');
}

async function canSend(redis: Redis, phone: string): Promise<boolean> {
    const key = `otp:phone:cool:${phone}`;
    const ttl = await redis.ttl(key);
    return ttl <= 0;
}

async function markSent(redis: Redis, phone: string, cooldown: number): Promise<void> {
    await redis.setex(`otp:phone:cool:${phone}`, cooldown, '1');
}

async function storeCode(redis: Redis, phone: string, code: string, ttl: number): Promise<void> {
    await redis.setex(`otp:phone:code:${phone}`, ttl, hash(code));
    await redis.setex(`otp:phone:attempts:${phone}`, ttl, 0);
}

async function sendSms(phone: string, code: string): Promise<void> {
    const {
        ALIYUN_ACCESS_KEY_ID,
        ALIYUN_ACCESS_KEY_SECRET,
        ALIYUN_SMS_SIGN_NAME,
        ALIYUN_SMS_TEMPLATE_CODE,
        OTP_DEV_MODE,
    } = process.env;

    if (OTP_DEV_MODE === 'true') {
        console.log(`[DEV][OTP] Send to ${phone}: ${code}`);
        return;
    }

    if (!ALIYUN_ACCESS_KEY_ID || !ALIYUN_ACCESS_KEY_SECRET || !ALIYUN_SMS_SIGN_NAME || !ALIYUN_SMS_TEMPLATE_CODE) {
        console.error("Aliyun SMS service is not configured. Please set environment variables.");
        throw new Error("SMS provider not configured");
    }

    let phoneNumberForAliyun = phone.startsWith('+') ? phone.substring(1) : phone;
    if (phoneNumberForAliyun.startsWith('86') && phoneNumberForAliyun.length === 13) {
        phoneNumberForAliyun = phoneNumberForAliyun.substring(2);
    }

    const config = new $OpenApi.Config({
        accessKeyId: ALIYUN_ACCESS_KEY_ID,
        accessKeySecret: ALIYUN_ACCESS_KEY_SECRET,
        regionId: "ap-northeast-1", // 根据TaleWeave部署位置，默认为东京
    });
    
    const client = new DysmsClient(config);
    const templateParam = JSON.stringify({ code });

    const sendSmsRequest = new SendSmsRequest({
        phoneNumbers: phoneNumberForAliyun,
        signName: ALIYUN_SMS_SIGN_NAME,
        templateCode: ALIYUN_SMS_TEMPLATE_CODE,
        templateParam,
    });

    try {
        console.log(`Sending SMS to ${phoneNumberForAliyun} with code (hidden)`);
        const response = await client.sendSms(sendSmsRequest);

        if (!response.body) {
            throw new Error("SMS sending failed: No response body from Aliyun.");
        }

        console.log(`Aliyun SMS response: Code=${response.body.code}, Message=${response.body.message}`);
        if (response.body.code !== 'OK') {
            throw new Error(`SMS sending failed: ${response.body.message}`);
        }
    } catch (error) {
        console.error(`An error occurred while sending SMS via Aliyun: ${error}`);
        throw error;
    }
}


// --- API 路由处理 ---

export async function POST(request: Request) {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
        return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);
    if (!PHONE_RE.test(normalizedPhone)) {
        return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    try {
        if (!(await canSend(redis, normalizedPhone))) {
            return NextResponse.json({ error: 'Please wait before sending another code' }, { status: 429 });
        }

        const otpCode = genCode(parseInt(process.env.OTP_CODE_LEN || '6', 10));
        const otpTtl = parseInt(process.env.OTP_TTL_SECONDS || '300', 10);
        const otpCooldown = parseInt(process.env.OTP_SEND_COOLDOWN_SECONDS || '60', 10);

        await storeCode(redis, normalizedPhone, otpCode, otpTtl);
        await markSent(redis, normalizedPhone, otpCooldown);
        
        // 异步发送短信，不阻塞响应
        sendSms(normalizedPhone, otpCode).catch(console.error);

        const responsePayload: { sent: boolean; ttl: number; dev_code?: string } = {
            sent: true,
            ttl: otpTtl,
        };

        if (process.env.OTP_DEV_MODE === 'true') {
            responsePayload.dev_code = otpCode;
        }

        return NextResponse.json(responsePayload);

    } catch (error) {
        console.error('Error in /api/auth/phone/start:', error);
        return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
    } finally {
        redis.quit();
    }
}
