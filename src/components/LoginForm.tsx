"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';

const GoogleIcon = () => (
    <svg viewBox="0 0 48 48" width="24" height="24" aria-hidden="true" focusable="false">
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
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
        <path
            fill="currentColor"
            d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
        />
    </svg>
);

const AlipayIcon = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
        <path
            fill="#1677FF"
            d="M19.695 15.07c3.426 1.158 4.203 1.22 4.203 1.22V3.846c0-2.124-1.705-3.845-3.81-3.845H3.914C1.808.001.102 1.722.102 3.846v16.31c0 2.123 1.706 3.845 3.813 3.845h16.173c2.105 0 3.81-1.722 3.81-3.845v-.157s-6.19-2.602-9.315-4.119c-2.096 2.602-4.8 4.181-7.607 4.181-4.75 0-6.361-4.19-4.112-6.949.49-.602 1.324-1.175 2.617-1.497 2.025-.502 5.247.313 8.266 1.317a16.796 16.796 0 0 0 1.341-3.302H5.781v-.952h4.799V6.975H4.77v-.953h5.81V3.591s0-.409.411-.409h2.347v2.84h5.744v.951h-5.744v1.704h4.69a19.453 19.453 0 0 1-1.986 5.06c1.424.52 2.702 1.011 3.654 1.333m-13.81-2.032c-.596.06-1.71.325-2.321.869-1.83 1.608-.735 4.55 2.968 4.55 2.151 0 4.301-1.388 5.99-3.61-2.403-1.182-4.438-2.028-6.637-1.809"
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
                            <span className="login-button__icon"><GoogleIcon /></span>
                            <span>{t('login_with_google')}</span>
                        </a>
                        <a href={appleHref} className="login-button login-button--option">
                            <span className="login-button__icon"><AppleIcon /></span>
                            <span>{t('login_with_apple')}</span>
                        </a>
                        <a
                            href={alipayHref}
                            className="login-button login-button--option"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className="login-button__icon"><AlipayIcon /></span>
                            <span>{t('login_with_alipay')}</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
