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

function looksLikePem(raw: string): boolean {
    return raw.includes('-----BEGIN') && raw.includes('-----END');
}

function toPemBody(raw: string): string {
    return raw.replace(/\s+/g, '');
}

function wrapPem(body: string, begin: string, end: string): string {
    const lines = body.match(/.{1,64}/g) ?? [];
    return [begin, ...lines, end].join('\n');
}

function normalizePrivateKey(raw: string): string {
    const normalized = raw.replace(/\\n/g, '\n').trim();
    if (looksLikePem(normalized)) {
        return normalized;
    }
    return wrapPem(
        toPemBody(normalized),
        '-----BEGIN PRIVATE KEY-----',
        '-----END PRIVATE KEY-----'
    );
}

function normalizePublicKey(raw: string): string {
    const normalized = raw.replace(/\\n/g, '\n').trim();
    if (looksLikePem(normalized)) {
        return normalized;
    }
    return wrapPem(
        toPemBody(normalized),
        '-----BEGIN PUBLIC KEY-----',
        '-----END PUBLIC KEY-----'
    );
}

export function loadAlipayAuthConfig(): AlipayAuthConfig {
    return {
        appId: getEnvVar('ALIPAY_APP_ID'),
        privateKey: normalizePrivateKey(getEnvVar('ALIPAY_PRIVATE_KEY')),
        publicKey: normalizePublicKey(getEnvVar('ALIPAY_PUBLIC_KEY')),
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
            keyType: 'PKCS8',
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

function isImplicitSuccess(result: Record<string, unknown>): boolean {
    const accessToken = readString(result, 'access_token', 'accessToken');
    const userId = readString(result, 'user_id', 'userId', 'alipay_user_id', 'alipayUserId');
    return Boolean(accessToken && userId);
}

function ensureSuccessResult(result: Record<string, unknown>, method: string): void {
    const code = typeof result.code === 'string' ? result.code : '';
    if (code === '10000' || (!code && isImplicitSuccess(result))) {
        return;
    }
    const subCode = readString(result, 'sub_code', 'subCode') ?? 'unknown_sub_code';
    const subMsg = readString(result, 'sub_msg', 'subMsg', 'msg') ?? 'Unknown Alipay error';
    const message = `${method} failed: code=${code || 'unknown_code'}; sub_code=${subCode}; sub_msg=${subMsg}`;
    console.error(`[Alipay API Error] ${message}`, result);
    throw new Error(message);
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
    const userId = readString(result, 'alipay_user_id', 'alipayUserId', 'user_id', 'userId');
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
