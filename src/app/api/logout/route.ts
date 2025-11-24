import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        // Create a response object to handle the redirect and cookie deletion.
        const homeUrl = new URL('/', process.env.NEXT_PUBLIC_BASE_URL || 'https://www.xipilabs.com');
        const response = NextResponse.redirect(homeUrl);

        // 手动附加 Set-Cookie，覆盖所有可能的 domain 变体，避免浏览器属性不匹配导致残留。
        const baseFlags = 'Path=/; HttpOnly; Max-Age=0; SameSite=None';
        const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';

        const variants = [
            '.xipilabs.com',
            'www.xipilabs.com',
            'xipilabs.com',
        ];

        variants.forEach((domain) => {
            response.headers.append(
                'Set-Cookie',
                `auth-token=; Domain=${domain}; ${baseFlags}${secure}`
            );
        });

        return response;

    } catch (error) {
        console.error('[Logout Error]', error);
        // Even if there's an error, try to redirect without cookie modification.
        const homeUrl = new URL('/', process.env.NEXT_PUBLIC_BASE_URL || 'https://www.xipilabs.com');
        return NextResponse.redirect(homeUrl);
    }
}
