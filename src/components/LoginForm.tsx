"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

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
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            fill="currentColor"
            d="M16.125 1.5c0 1.45-.595 2.782-1.654 3.86-1.01 1.036-2.694 1.838-4.106 1.726-.202-1.404.616-2.884 1.642-3.912 1.062-1.073 2.83-1.845 4.118-1.674zm5.437 18.07c-.416.96-.607 1.395-1.136 2.364-.732 1.328-1.755 2.965-3.034 2.987-1.226.025-1.549-.968-3.198-.961-1.651.007-2.01.984-3.24.969-1.281-.013-2.259-1.522-2.989-2.85-2.07-3.84-1.323-9.325 1.438-9.364 1.406-.018 2.05.947 3.91.95 1.822.004 2.425-.956 3.923-.974 1.558-.016 2.823 1.03 3.736 2.812-.7.403-2.753 1.54-2.728 3.636.022 2.349 2.233 3.13 2.85 3.185z"
        />
    </svg>
);

const EmailIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            fill="currentColor"
            d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm0 2v.45l8 5.1 8-5.1V8l-8 5.1L4 8z"
        />
    </svg>
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
    const pathname = usePathname();

    const googleHref = `/api/auth/google?redirect_url=${encodeURIComponent(redirectUrl)}`;
    const appleHref = `/api/auth/apple?redirect_url=${encodeURIComponent(redirectUrl)}`;
    const currentPath = pathname ?? '/login';
    const normalizedPath = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath;
    const emailHref = `${normalizedPath}/email?redirect_url=${encodeURIComponent(redirectUrl)}`;

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
                        <a href={emailHref} className="login-button login-button--option">
                            <EmailIcon />
                            <span>{t('login_with_email')}</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
