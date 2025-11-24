import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        // Create a response object to handle the redirect and cookie deletion.
        const homeUrl = new URL('/', process.env.NEXT_PUBLIC_BASE_URL || 'https://www.xipilabs.com');
        const response = NextResponse.redirect(homeUrl);

        // To delete a cookie, we set its value to empty and maxAge to 0.
        // It's crucial to provide the same domain and path attributes.
        response.cookies.set('auth-token', '', {
            domain: '.xipilabs.com',
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 0, // Set maxAge to 0 to expire the cookie immediately
        });
        // 补充按子域删除，避免浏览器因 domain 匹配策略遗留 Cookie
        response.cookies.set('auth-token', '', {
            domain: 'www.xipilabs.com',
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 0,
        });

        return response;

    } catch (error) {
        console.error('[Logout Error]', error);
        // Even if there's an error, try to redirect without cookie modification.
        const homeUrl = new URL('/', process.env.NEXT_PUBLIC_BASE_URL || 'https://www.xipilabs.com');
        return NextResponse.redirect(homeUrl);
    }
}
