"use client";

import { useState } from 'react';
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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16.365 1.43c0 1.14-.513 2.161-1.321 2.947-.733.712-1.93 1.271-3.088 1.19-.055-1.09.565-2.203 1.346-2.916.8-.719 2.155-1.254 3.063-1.221zm4.04 17.299c-.612 1.379-.918 1.999-1.724 3.228-1.118 1.703-2.685 3.834-4.62 3.848-1.771.017-2.339-1.132-4.353-1.122-2.014.01-2.637 1.134-4.41 1.118-1.934-.014-3.425-1.935-4.543-3.639-3.114-4.741-3.433-10.305-1.516-13.253 1.393-2.123 3.599-3.365 5.68-3.365 2.117 0 3.448 1.137 5.209 1.137 1.72 0 2.753-1.138 5.16-1.138 1.885 0 3.889 1.028 5.28 2.804-4.642 2.541-3.901 9.165.737 11.382z" />
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

    const googleHref = `/api/auth/google?redirect_url=${encodeURIComponent(redirectUrl)}`;
    const appleHref = `/api/auth/apple?redirect_url=${encodeURIComponent(redirectUrl)}`;

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
                    </div>
                </div>
            </div>
        </div>
    );
}
