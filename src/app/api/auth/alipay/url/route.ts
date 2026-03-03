import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { sanitizeRedirectUrl, storeOAuthState } from '@/lib/oauth';
import { buildAlipayAuthorizeUrl, loadAlipayAuthConfig } from '@/lib/alipay-auth';

export async function GET(req: NextRequest) {
    try {
        const redirectUrl = sanitizeRedirectUrl(req.nextUrl.searchParams.get('redirect_url'));
        const state = randomBytes(16).toString('hex');
        const config = loadAlipayAuthConfig();

        await storeOAuthState('alipay', state, { redirectUrl });

        const authorizeUrl = buildAlipayAuthorizeUrl(config, state);
        return NextResponse.redirect(authorizeUrl);
    } catch (error) {
        console.error('[Alipay Auth Start Error]', error);
        return NextResponse.json(
            { error: 'Alipay authentication start failed. Please try again later.' },
            { status: 500 }
        );
    }
}
