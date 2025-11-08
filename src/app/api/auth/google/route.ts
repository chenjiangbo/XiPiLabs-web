import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import Redis from 'ioredis';
import { randomBytes } from 'crypto';

// Helper to get environment variables with a fallback.
function getEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}

export async function GET() {
    try {
        // --- 1. Configuration ---
        // Ensure all required environment variables are set.
        const googleClientId = getEnvVar('GOOGLE_CLIENT_ID');
        const googleClientSecret = getEnvVar('GOOGLE_CLIENT_SECRET');
        const redirectUri = getEnvVar('GOOGLE_REDIRECT_URI');
        const redisUrl = getEnvVar('REDIS_URL');

        // --- 2. Initialize Clients ---
        const oauth2Client = new OAuth2Client(
            googleClientId,
            googleClientSecret,
            redirectUri
        );

        const redis = new Redis(redisUrl);

        // --- 3. Create State for CSRF Protection ---
        const state = randomBytes(16).toString('hex');
        // Store the state in Redis with a 10-minute expiration
        await redis.set(state, 'true', 'EX', 600);
        await redis.quit();

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

        // --- 5. Redirect User ---
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
