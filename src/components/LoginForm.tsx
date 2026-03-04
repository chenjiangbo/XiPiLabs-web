"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const GoogleIcon = () => (
    <svg viewBox="0 0 48 48" width="24" height="24">
        <path
            fill="#FFC107"
            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        ></path>
        <path
            fill="#FF3D00"
            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        ></path>
        <path
            fill="#4CAF50"
            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
        ></path>
        <path
            fill="#1976D2"
            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"
        ></path>
    </svg>
);

const AppleIcon = () => (
    <Image
        src="/apple.svg"
        alt=""
        width={24}
        height={24}
        aria-hidden="true"
        className="login-button__icon-image"
    />
);

const AlipayIcon = () => (
    <Image
        src="/alipay.jpg"
        alt=""
        width={24}
        height={24}
        aria-hidden="true"
        className="login-button__icon-image"
    />
);

function getInitialRedirect(): string {
    if (typeof window === 'undefined') {
        return '/';
    }
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect_url') || '/';
}

export default function LoginForm() {
    const [redirectUrl] = useState(getInitialRedirect);
    const t = useTranslations('LoginForm');

    const googleHref = `/api/auth/google?redirect_url=${encodeURIComponent(redirectUrl)}`;
    const appleHref = `/api/auth/apple?redirect_url=${encodeURIComponent(redirectUrl)}`;
    const alipayHref = `/api/auth/alipay/url?redirect_url=${encodeURIComponent(redirectUrl)}`;

    return (
        <div className="login-container">
            <div className="login-form-area">
                <div className="login-view is-active">
                    <h2 className="login-title">{t('welcome_back')}</h2>
                    <p className="login-subtitle">{t('choose_login_method')}</p>
                    <div className="login-actions">
                        <a href={googleHref} className="login-button login-button--option">
                            <GoogleIcon />
                            <span>{t('login_with_google')}</span>
                        </a>
                        <a href={appleHref} className="login-button login-button--option">
                            <AppleIcon />
                            <span>{t('login_with_apple')}</span>
                        </a>
                        <a
                            href={alipayHref}
                            className="login-button login-button--option"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <AlipayIcon />
                            <span>{t('login_with_alipay')}</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
