import { AlipaySdk } from 'alipay-sdk';

export interface AlipayAuthConfig {
    appId: string;
    privateKey: string;
    publicKey: string;
    callbackUrl: string;
    gateway: string;
}

export interface AlipayOAuthToken {
    accessToken: string;
    userId: string;
}

export interface AlipayUserProfile {
    userId: string;
    nickName?: string;
    avatar?: string;
}

function getEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}

function normalizePemKey(raw: string): string {
    return raw.replace(/\\n/g, '\n');
}

export function loadAlipayAuthConfig(): AlipayAuthConfig {
    return {
        appId: getEnvVar('ALIPAY_APP_ID'),
        privateKey: normalizePemKey(getEnvVar('ALIPAY_PRIVATE_KEY')),
        publicKey: normalizePemKey(getEnvVar('ALIPAY_PUBLIC_KEY')),
        callbackUrl: getEnvVar('ALIPAY_CALLBACK_URL'),
        gateway: getEnvVar('ALIPAY_GATEWAY'),
    };
}

let cachedClient: AlipaySdk | null = null;
let cachedSignature: string | null = null;

function buildSignature(config: AlipayAuthConfig): string {
    return [
        config.appId,
        config.privateKey,
        config.publicKey,
        config.callbackUrl,
        config.gateway,
    ].join('::');
}

export function getAlipayClient(config: AlipayAuthConfig): AlipaySdk {
    const nextSignature = buildSignature(config);
    if (!cachedClient || cachedSignature !== nextSignature) {
        cachedClient = new AlipaySdk({
            appId: config.appId,
            privateKey: config.privateKey,
            alipayPublicKey: config.publicKey,
            gateway: config.gateway,
        });
        cachedSignature = nextSignature;
    }
    return cachedClient;
}

export function buildAlipayAuthorizeUrl(config: AlipayAuthConfig, state: string): string {
    const query = new URLSearchParams({
        app_id: config.appId,
        scope: 'auth_user',
        redirect_uri: config.callbackUrl,
        state,
    });
    return `https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?${query.toString()}`;
}

function resolveResult<T>(result: Record<string, unknown>): T {
    return result as T;
}

function ensureSuccessResult(result: Record<string, unknown>, method: string): void {
    const code = typeof result.code === 'string' ? result.code : '';
    if (code === '10000') {
        return;
    }
    const subCode = typeof result.sub_code === 'string' ? result.sub_code : 'unknown_sub_code';
    const subMsg = typeof result.sub_msg === 'string' ? result.sub_msg : 'Unknown Alipay error';
    throw new Error(`${method} failed: ${subCode} - ${subMsg}`);
}

function readString(result: Record<string, unknown>, ...keys: string[]): string | undefined {
    for (const key of keys) {
        const value = result[key];
        if (typeof value === 'string' && value) {
            return value;
        }
    }
    return undefined;
}

export async function exchangeAuthCodeForToken(authCode: string): Promise<AlipayOAuthToken> {
    const config = loadAlipayAuthConfig();
    const client = getAlipayClient(config);
    const result = resolveResult<Record<string, unknown>>(
        await client.exec('alipay.system.oauth.token', {
            grant_type: 'authorization_code',
            code: authCode,
        })
    );

    ensureSuccessResult(result, 'alipay.system.oauth.token');

    const accessToken = readString(result, 'access_token', 'accessToken');
    const userId = readString(result, 'user_id', 'userId');
    if (!accessToken || !userId) {
        throw new Error('alipay.system.oauth.token missing access token or user id');
    }

    return { accessToken, userId };
}

export async function fetchAlipayUserProfile(accessToken: string): Promise<AlipayUserProfile> {
    const config = loadAlipayAuthConfig();
    const client = getAlipayClient(config);
    const result = resolveResult<Record<string, unknown>>(
        await client.exec('alipay.user.info.share', {
            auth_token: accessToken,
        })
    );

    ensureSuccessResult(result, 'alipay.user.info.share');

    const userId = readString(result, 'user_id', 'userId');
    if (!userId) {
        throw new Error('alipay.user.info.share missing user id');
    }

    return {
        userId,
        nickName: readString(result, 'nick_name', 'nickName'),
        avatar: readString(result, 'avatar'),
    };
}
