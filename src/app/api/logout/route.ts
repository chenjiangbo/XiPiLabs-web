import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = cookies();

    try {
        // To delete a cookie, we set its value to empty and maxAge to 0.
        // It's crucial to provide the same domain and path attributes.
        cookieStore.set('auth-token', '', {
            domain: '.xipilabs.com',
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0, // Set maxAge to 0 to expire the cookie immediately
        });

        // Redirect to the homepage after logging out.
        const homeUrl = 'https://www.xipilabs.com';
        return NextResponse.redirect(homeUrl);

    } catch (error) {
        console.error('[Logout Error]', error);
        // Even if there's an error, try to redirect.
        const homeUrl = 'https://www.xipilabs.com';
        return NextResponse.redirect(homeUrl);
    }
}
