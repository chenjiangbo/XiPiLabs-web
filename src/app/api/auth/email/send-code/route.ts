import { NextRequest, NextResponse } from 'next/server';
import { sanitizeRedirectUrl } from '@/lib/oauth';
import {
    clearEmailCode,
    clearEmailCooldown,
    generateNumericCode,
    isEmailCooldownActive,
    isValidEmail,
    loadEmailAuthConfig,
    normalizeEmail,
    sendLoginCodeEmail,
    setEmailCooldown,
    storeEmailCode,
} from '@/lib/email-auth';

interface SendCodeRequestBody {
    email?: string;
    redirect_url?: string | null;
}

export async function POST(req: NextRequest) {
    let body: SendCodeRequestBody;
    try {
        body = (await req.json()) as SendCodeRequestBody;
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const rawEmail = body.email;
    if (!rawEmail || typeof rawEmail !== 'string') {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const email = normalizeEmail(rawEmail);
    if (!isValidEmail(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const redirectUrl = sanitizeRedirectUrl(body.redirect_url ?? null);
    const config = loadEmailAuthConfig();

    if (await isEmailCooldownActive(email)) {
        return NextResponse.json(
            { error: 'Please wait before requesting another code' },
            { status: 429 }
        );
    }

    const code = generateNumericCode();
    try {
        await storeEmailCode(
            email,
            {
                code,
                redirectUrl,
                attempts: 0,
                createdAt: Date.now(),
            },
            config.codeTtlSeconds
        );
        await setEmailCooldown(email, config.cooldownSeconds);
        await sendLoginCodeEmail({
            config,
            to: email,
            code,
        });
    } catch (error) {
        await clearEmailCode(email);
        await clearEmailCooldown(email);
        console.error('[Email Send Code Error]', error);
        return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        expires_in: config.codeTtlSeconds,
        cooldown_seconds: config.cooldownSeconds,
    });
}
