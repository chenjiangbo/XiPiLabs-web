import Redis from 'ioredis';

const DEFAULT_REDIRECT_URL = process.env.DEFAULT_REDIRECT_URL || 'https://www.xipilabs.com';
const DEFAULT_REDIRECT = new URL(DEFAULT_REDIRECT_URL);

const STATE_TTL_SECONDS = 600;
const ALLOWED_HOSTS = new Set([
    DEFAULT_REDIRECT.hostname,
    'xipilabs.com',
    'www.xipilabs.com',
    'taleweave.xipilabs.com',
]);
const DEV_HOSTS = new Set(['localhost', '127.0.0.1']);
const CUSTOM_SCHEMES = new Set(['taleweave-app']);

export interface OAuthStatePayload {
    redirectUrl: string;
}

function parseUrl(raw: string): URL | null {
    try {
        return new URL(raw);
    } catch {
        return null;
    }
}

function getRedisUrl(): string {
    const url = process.env.REDIS_URL;
    if (!url) {
        throw new Error('Missing environment variable: REDIS_URL');
    }
    return url;
}

function buildStateKey(provider: string, state: string): string {
    return `oauth:${provider}:${state}`;
}

export function sanitizeRedirectUrl(raw: string | null): string {
    if (!raw) {
        return DEFAULT_REDIRECT_URL;
    }

    if (raw.startsWith('/')) {
        return new URL(raw, DEFAULT_REDIRECT).toString();
    }

    try {
        const parsed = new URL(raw);
        if (parsed.protocol === 'https:' && ALLOWED_HOSTS.has(parsed.hostname)) {
            return parsed.toString();
        }

        if (parsed.protocol === 'http:' && DEV_HOSTS.has(parsed.hostname)) {
            return parsed.toString();
        }

        const scheme = parsed.protocol.replace(':', '');
        if (CUSTOM_SCHEMES.has(scheme)) {
            return raw;
        }
    } catch {
        return DEFAULT_REDIRECT_URL;
    }

    return DEFAULT_REDIRECT_URL;
}

export async function storeOAuthState(provider: string, state: string, payload: OAuthStatePayload): Promise<void> {
    const redis = new Redis(getRedisUrl());
    try {
        await redis.set(buildStateKey(provider, state), JSON.stringify(payload), 'EX', STATE_TTL_SECONDS);
    } finally {
        await redis.quit();
    }
}

export async function consumeOAuthState(provider: string, state: string): Promise<OAuthStatePayload | null> {
    const redis = new Redis(getRedisUrl());
    const key = buildStateKey(provider, state);
    try {
        const data = await redis.get(key);
        if (!data) {
            return null;
        }
        await redis.del(key);
        return JSON.parse(data) as OAuthStatePayload;
    } finally {
        await redis.quit();
    }
}

export { DEFAULT_REDIRECT_URL };

export function isCustomSchemeUrl(raw: string): boolean {
    const parsed = parseUrl(raw);
    if (!parsed) {
        return false;
    }
    const scheme = parsed.protocol.replace(':', '');
    return CUSTOM_SCHEMES.has(scheme);
}

export function appendQueryParams(raw: string, params: Record<string, string | undefined>): string {
    const parsed = parseUrl(raw);
    if (!parsed) {
        return raw;
    }
    const search = new URLSearchParams(parsed.search);
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
            return;
        }
        search.set(key, value);
    });
    parsed.search = search.toString();
    return parsed.toString();
}
