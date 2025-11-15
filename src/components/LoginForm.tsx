"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl'; // Added import

// --- Reusable Icon Components ---
const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" width="24" height="24"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
);

const WechatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8.5a4.5 4.5 0 1 0-9 0" /><path d="M12.5 13a4.5 4.5 0 1 0 0-9" /><path d="M2 12.5a10.5 10.5 0 1 0 21 0" /><path d="M2 12.5a10.5 10.5 0 1 1 21 0" /><path d="M8.5 10.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" /><path d="M15.5 10.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" /></svg>
);

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.4 6.3a2 2 0 0 1 2.3 2.3l-1.5 4.6a2 2 0 0 1-2.3 1.5l-4.6-1.5a2 2 0 0 1-1.5-2.3l1.5-4.6a2 2 0 0 1 2.3-1.5z" /><path d="M8.4 1.6a1 1 0 0 1 1.3 1.3L8.2 7.8a1 1 0 0 1-1.3-1.3L8.4 1.6z" /><path d="M4.2 4.2a1 1 0 0 1 1.4 0L10 8.6a1 1 0 0 1 0 1.4L8.6 10a1 1 0 0 1-1.4 0L4.2 5.6a1 1 0 0 1 0-1.4z" /><path d="M15.4 14a1 1 0 0 1 1.3 1.3l-1.5 4.6a1 1 0 0 1-1.3-1.3l1.5-4.6z" /><path d="M22.4 8.6a1 1 0 0 1 0 1.4l-4.2 4.2a1 1 0 0 1-1.4 0l-1.4-1.4a1 1 0 0 1 0-1.4l4.2-4.2a1 1 0 0 1 1.4 0z" /></svg>
);

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);


// --- Main LoginForm Component ---
export default function LoginForm() {
    const [view, setView] = useState<'select' | 'phone'>('select');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [redirectUrl, setRedirectUrl] = useState('/');
    const t = useTranslations('LoginForm'); // Added useTranslations hook

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const url = params.get('redirect_url');
        if (url) setRedirectUrl(url);
    }, []);

    const handleSendCode = async () => {
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/phone/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || t('send_code_failed'));
            setIsCodeSent(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/phone/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, code }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || t('verify_code_failed'));
            window.location.href = redirectUrl;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetToSelect = () => {
        setView('select');
        setError('');
        setIsCodeSent(false);
    }

    const renderSelectionView = () => (
        <div className={`login-view ${view === 'select' ? 'is-active' : 'is-exiting'}`}>
            <h2 className="login-title">{t('welcome_back')}</h2>
            <p className="login-subtitle">{t('choose_login_method')}</p>
            <div className="login-actions">
                <button className="login-button login-button--option" onClick={() => setView('phone')}>
                    <PhoneIcon />
                    <span>{t('phone_login')}</span>
                </button>
                <a href={`/api/auth/google?redirect_url=${encodeURIComponent(redirectUrl)}`} className="login-button login-button--option">
                    <GoogleIcon />
                    <span>{t('login_with_google')}</span>
                </a>
                <button className="login-button login-button--option login-button--disabled" disabled>
                    <WechatIcon />
                    <span>{t('login_with_wechat_unavailable')}</span>
                </button>
            </div>
        </div>
    );

    const renderPhoneLoginView = () => (
        <div className={`login-view ${view === 'phone' ? 'is-active' : 'is-entering'}`}>
            <button onClick={resetToSelect} className="login-back-button">
                <BackIcon />
                <span>{t('back')}</span>
            </button>
            <h2 className="login-title">{t('phone_login_title')}</h2>
            <p className="login-subtitle">
                {isCodeSent ? t('code_sent_to_phone', { phone }) : t('enter_phone_to_receive_code')}
            </p>
            <div className="login-form-fields">
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('phone_number_placeholder')}
                    className="login-input"
                    disabled={isCodeSent || loading}
                />
                {isCodeSent ? (
                    <>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder={t('code_placeholder')}
                            className="login-input"
                            disabled={loading}
                        />
                        <button onClick={handleVerifyCode} className="login-button login-button--primary" disabled={loading}>
                            {loading ? t('logging_in') : t('login_button')}
                        </button>
                    </>
                ) : (
                    <button onClick={handleSendCode} className="login-button login-button--primary" disabled={loading}>
                        {loading ? t('sending_code') : t('send_code_button')}
                    </button>
                )}
            </div>
            {error && <p className="login-error">{error}</p>}
        </div>
    );

    return (
        <div className="login-container">
            <div className="login-form-area">
                {renderSelectionView()}
                {renderPhoneLoginView()}
            </div>
        </div>
    );
}
