"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

function getInitialRedirect(): string {
    if (typeof window === 'undefined') {
        return '/';
    }
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect_url') || '/';
}

export default function EmailLoginForm() {
    const [redirectUrl] = useState(getInitialRedirect);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [emailStep, setEmailStep] = useState<'idle' | 'code'>('idle');
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const pathname = usePathname();
    const t = useTranslations('LoginForm');

    const methodsPath = pathname.replace(/\/email\/?$/, '');
    const methodsHref = `${methodsPath}?redirect_url=${encodeURIComponent(redirectUrl)}`;

    async function requestEmailCode() {
        setSubmitting(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
            const response = await fetch('/api/auth/email/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    redirect_url: redirectUrl,
                }),
            });
            const data = (await response.json()) as { error?: string };
            if (!response.ok) {
                throw new Error(data.error || t('email_send_failed'));
            }
            setEmailStep('code');
            setSuccessMessage(t('email_code_sent'));
        } catch (error) {
            const message = error instanceof Error ? error.message : t('email_send_failed');
            setErrorMessage(message);
        } finally {
            setSubmitting(false);
        }
    }

    async function verifyEmailCode() {
        setSubmitting(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
            const response = await fetch('/api/auth/email/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    code,
                }),
            });
            const data = (await response.json()) as { error?: string; redirect_to?: string };
            if (!response.ok) {
                throw new Error(data.error || t('email_verify_failed'));
            }
            if (!data.redirect_to) {
                throw new Error(t('email_verify_failed'));
            }
            window.location.href = data.redirect_to;
        } catch (error) {
            const message = error instanceof Error ? error.message : t('email_verify_failed');
            setErrorMessage(message);
        } finally {
            setSubmitting(false);
        }
    }

    function resetEmailFlow() {
        setEmailStep('idle');
        setCode('');
        setErrorMessage(null);
        setSuccessMessage(null);
    }

    return (
        <div className="login-container">
            <div className="login-form-area">
                <div className="login-view is-active">
                    <h2 className="login-title">{t('email_login_title')}</h2>
                    <p className="login-subtitle">{t('email_login_subtitle')}</p>
                    <div className="login-form-fields">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="login-input"
                            placeholder={t('email_placeholder')}
                            autoComplete="email"
                            disabled={submitting || emailStep === 'code'}
                        />
                        {emailStep === 'code' && (
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="login-input"
                                placeholder={t('email_code_placeholder')}
                                inputMode="numeric"
                                maxLength={6}
                                disabled={submitting}
                            />
                        )}
                        {errorMessage && <p className="login-error">{errorMessage}</p>}
                        {successMessage && <p className="login-subtitle">{successMessage}</p>}
                        {emailStep === 'idle' ? (
                            <button
                                type="button"
                                onClick={requestEmailCode}
                                className="login-button login-button--primary"
                                disabled={submitting || !email.trim()}
                            >
                                {submitting ? t('email_sending') : t('email_send_code')}
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={verifyEmailCode}
                                    className="login-button login-button--primary"
                                    disabled={submitting || code.trim().length !== 6}
                                >
                                    {submitting ? t('email_verifying') : t('email_verify_and_login')}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetEmailFlow}
                                    className="login-back-button"
                                    disabled={submitting}
                                >
                                    {t('email_change_address')}
                                </button>
                            </>
                        )}
                        <Link href={methodsHref} className="login-back-button">
                            {t('back_to_login_methods')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
