import Redis from 'ioredis';
import nodemailer from 'nodemailer';
import { randomInt } from 'crypto';

const CODE_KEY_PREFIX = 'email-login:code';
const COOLDOWN_KEY_PREFIX = 'email-login:cooldown';

export interface EmailLoginCodeRecord {
    code: string;
    redirectUrl: string;
    attempts: number;
    createdAt: number;
}

export interface EmailAuthConfig {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    fromAddress: string;
    codeTtlSeconds: number;
    cooldownSeconds: number;
    maxAttempts: number;
}

function getEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}

function getPositiveIntEnv(name: string): number {
    const raw = getEnvVar(name);
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error(`Invalid environment variable: ${name}=${raw}`);
    }
    return parsed;
}

function getRedisUrl(): string {
    return getEnvVar('REDIS_URL');
}

export function loadEmailAuthConfig(): EmailAuthConfig {
    return {
        smtpHost: getEnvVar('EMAIL_SMTP_HOST'),
        smtpPort: getPositiveIntEnv('EMAIL_SMTP_PORT'),
        smtpUser: getEnvVar('EMAIL_SMTP_USER'),
        smtpPass: getEnvVar('EMAIL_SMTP_PASS'),
        fromAddress: getEnvVar('EMAIL_FROM'),
        codeTtlSeconds: getPositiveIntEnv('EMAIL_CODE_TTL_SECONDS'),
        cooldownSeconds: getPositiveIntEnv('EMAIL_CODE_COOLDOWN_SECONDS'),
        maxAttempts: getPositiveIntEnv('EMAIL_CODE_MAX_ATTEMPTS'),
    };
}

function buildCodeKey(email: string): string {
    return `${CODE_KEY_PREFIX}:${email}`;
}

function buildCooldownKey(email: string): string {
    return `${COOLDOWN_KEY_PREFIX}:${email}`;
}

export function normalizeEmail(raw: string): string {
    return raw.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function generateNumericCode(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export async function storeEmailCode(
    email: string,
    record: EmailLoginCodeRecord,
    ttlSeconds: number
): Promise<void> {
    const redis = new Redis(getRedisUrl());
    try {
        await redis.set(buildCodeKey(email), JSON.stringify(record), 'EX', ttlSeconds);
    } finally {
        await redis.quit();
    }
}

export async function getEmailCode(
    email: string
): Promise<{ record: EmailLoginCodeRecord | null; ttlSeconds: number }> {
    const redis = new Redis(getRedisUrl());
    try {
        const key = buildCodeKey(email);
        const [raw, ttl] = await Promise.all([redis.get(key), redis.ttl(key)]);
        if (!raw) {
            return { record: null, ttlSeconds: -1 };
        }
        return { record: JSON.parse(raw) as EmailLoginCodeRecord, ttlSeconds: ttl };
    } finally {
        await redis.quit();
    }
}

export async function updateEmailCode(
    email: string,
    record: EmailLoginCodeRecord,
    ttlSeconds: number
): Promise<void> {
    if (ttlSeconds <= 0) {
        throw new Error('Email code has expired');
    }
    const redis = new Redis(getRedisUrl());
    try {
        await redis.set(buildCodeKey(email), JSON.stringify(record), 'EX', ttlSeconds);
    } finally {
        await redis.quit();
    }
}

export async function clearEmailCode(email: string): Promise<void> {
    const redis = new Redis(getRedisUrl());
    try {
        await redis.del(buildCodeKey(email));
    } finally {
        await redis.quit();
    }
}

export async function isEmailCooldownActive(email: string): Promise<boolean> {
    const redis = new Redis(getRedisUrl());
    try {
        const ttl = await redis.ttl(buildCooldownKey(email));
        return ttl > 0;
    } finally {
        await redis.quit();
    }
}

export async function setEmailCooldown(email: string, ttlSeconds: number): Promise<void> {
    const redis = new Redis(getRedisUrl());
    try {
        await redis.set(buildCooldownKey(email), '1', 'EX', ttlSeconds);
    } finally {
        await redis.quit();
    }
}

export async function clearEmailCooldown(email: string): Promise<void> {
    const redis = new Redis(getRedisUrl());
    try {
        await redis.del(buildCooldownKey(email));
    } finally {
        await redis.quit();
    }
}

export async function sendLoginCodeEmail(params: {
    config: EmailAuthConfig;
    to: string;
    code: string;
}): Promise<void> {
    const { config, to, code } = params;
    const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpPort === 465,
        auth: {
            user: config.smtpUser,
            pass: config.smtpPass,
        },
    });

    await transporter.sendMail({
        from: config.fromAddress,
        to,
        subject: 'Your XipiLabs login verification code',
        text: `Your verification code is ${code}. It will expire in ${config.codeTtlSeconds} seconds.`,
    });
}
