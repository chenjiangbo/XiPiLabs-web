import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { sanitizeRedirectUrl, storeOAuthState } from '@/lib/oauth';

function getEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}

export async function GET(req: NextRequest) {
    console.log('[Apple Auth Start] - Received request');
    try {
        const redirectUrl = sanitizeRedirectUrl(req.nextUrl.searchParams.get('redirect_url'));
        const clientId = getEnvVar('APPLE_CLIENT_ID');
        const redirectUri = getEnvVar('APPLE_REDIRECT_URI');

        const state = randomBytes(16).toString('hex');
        await storeOAuthState('apple', state, { redirectUrl });
        console.log(`[Apple Auth Start] - Generated state ${state}`);

        const query = new URLSearchParams({
            response_type: 'code',
            client_id: clientId,
            redirect_uri: redirectUri,
            scope: 'name email',
            state,
            response_mode: 'form_post',
        });

        const authorizeUrl = `https://appleid.apple.com/auth/authorize?${query.toString()}`;
        return NextResponse.redirect(authorizeUrl);
    } catch (error) {
        console.error('[Apple Auth Start Error]', error);
        const message = error instanceof Error ? error.message : 'Unknown Apple auth error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
