import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { randomBytes } from 'crypto';
import { sanitizeRedirectUrl, storeOAuthState } from '@/lib/oauth';

// Helper to get environment variables with a fallback.
function getEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}

export async function GET(req: NextRequest) {
    console.log('[Google Auth Start] - Received request');
    try {
        const redirectUrl = sanitizeRedirectUrl(req.nextUrl.searchParams.get('redirect_url'));
        // --- 1. Configuration ---
        console.log('[Google Auth Start] - Loading environment variables...');
        const googleClientId = getEnvVar('GOOGLE_CLIENT_ID');
        console.log(`[Google Auth Start] - GOOGLE_CLIENT_ID: ${googleClientId ? 'Loaded' : 'MISSING'}`);
        
        const googleClientSecret = getEnvVar('GOOGLE_CLIENT_SECRET');
        console.log(`[Google Auth Start] - GOOGLE_CLIENT_SECRET: ${googleClientSecret ? 'Loaded' : 'MISSING'}`);

        const redirectUri = getEnvVar('GOOGLE_REDIRECT_URI');
        console.log(`[Google Auth Start] - GOOGLE_REDIRECT_URI: ${redirectUri ? 'Loaded' : 'MISSING'}`);

        console.log('[Google Auth Start] - All environment variables loaded.');

        // --- 2. Initialize Clients ---
        const oauth2Client = new OAuth2Client(
            googleClientId,
            googleClientSecret,
            redirectUri
        );

        // --- 3. Create State for CSRF Protection ---
        const state = randomBytes(16).toString('hex');
        console.log(`[Google Auth Start] - Generated state for CSRF: ${state}`);
        await storeOAuthState('google', state, { redirectUrl });
        console.log('[Google Auth Start] - Stored state in Redis.');

        // --- 4. Generate Google Auth URL ---
        const authorizeUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
            ],
            prompt: 'consent', // Force consent screen for refresh token
            state: state, // Pass the state for verification on callback
        });
        console.log(`[Google Auth Start] - Generated Google Auth URL: ${authorizeUrl}`);

        // --- 5. Redirect User ---
        console.log('[Google Auth Start] - Redirecting user to Google.');
        return NextResponse.redirect(authorizeUrl);

    } catch (error) {
        console.error('[Google Auth Start Error]', error);
        // Redirect to an error page or show a generic error message
        return NextResponse.json(
            { error: 'Authentication failed. Please try again later.' },
            { status: 500 }
        );
    }
}
