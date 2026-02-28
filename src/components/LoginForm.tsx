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
            d="M16.449 2.048c0 1.21-.495 2.322-1.377 3.223-.838.86-2.22 1.524-3.379 1.43-.166-1.168.506-2.401 1.35-3.256.874-.883 2.326-1.52 3.406-1.397zM20.92 17.077c-.347.804-.505 1.168-.946 1.98-.61 1.112-1.463 2.482-2.53 2.501-1.022.02-1.29-.81-2.663-.804-1.375.006-1.675.822-2.699.81-1.068-.01-1.883-1.273-2.492-2.384-1.726-3.201-1.103-7.772 1.198-7.804 1.172-.015 1.709.79 3.26.793 1.518.003 2.022-.797 3.269-.812 1.298-.013 2.352.859 3.112 2.343-.583.336-2.293 1.283-2.272 3.027.018 1.955 1.859 2.605 2.372 2.65z"
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
    const normalizedPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
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
                            <span>{t('login_with_email')}</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
