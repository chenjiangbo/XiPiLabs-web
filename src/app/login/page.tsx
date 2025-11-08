"use client";
import React, { useState, useEffect } from 'react';

// Basic styling for the page and components
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    card: {
        padding: '48px',
        width: '400px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        textAlign: 'center' as 'center',
    },
    title: {
        fontSize: '24px',
        color: '#333',
        marginBottom: '24px',
    },
    googleButton: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 24px',
        backgroundColor: '#4285F4',
        color: 'white',
        fontSize: '16px',
        fontWeight: 500,
        borderRadius: '4px',
        border: 'none',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        width: '100%',
        marginBottom: '24px',
    },
    divider: {
        margin: '24px 0',
        borderBottom: '1px solid #e8e8e8',
        lineHeight: '0.1em',
        textAlign: 'center' as 'center',
    },
    dividerText: {
        background: '#fff',
        padding: '0 10px',
        color: '#8c8c8c',
    },
    input: {
        width: '100%',
        padding: '12px',
        fontSize: '16px',
        borderRadius: '4px',
        border: '1px solid #d9d9d9',
        marginBottom: '16px',
        boxSizing: 'border-box' as 'border-box',
    },
    button: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#1890ff',
        color: 'white',
        fontSize: '16px',
        fontWeight: 500,
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    error: {
        color: 'red',
        marginTop: '16px',
    },
};

export default function LoginPage() {
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [redirectUrl, setRedirectUrl] = useState('/');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const url = params.get('redirect_url');
        if (url) {
            setRedirectUrl(url);
        }
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
            if (!res.ok) {
                throw new Error(data.error || 'Failed to send code');
            }
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
            if (!res.ok) {
                throw new Error(data.error || 'Failed to verify code');
            }
            // On successful login, redirect
            window.location.href = redirectUrl;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>登录 XipiLabs</h1>
                
                <a href={`/api/auth/google?redirect_url=${encodeURIComponent(redirectUrl)}`} style={styles.googleButton}>
                    用 Google 登录
                </a>

                <div style={styles.divider}>
                    <span style={styles.dividerText}>或</span>
                </div>

                <div>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="手机号"
                        style={styles.input}
                        disabled={isCodeSent}
                    />
                    {isCodeSent ? (
                        <>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="验证码"
                                style={styles.input}
                            />
                            <button onClick={handleVerifyCode} style={styles.button} disabled={loading}>
                                {loading ? '登录中...' : '使用手机号登录'}
                            </button>
                        </>
                    ) : (
                        <button onClick={handleSendCode} style={styles.button} disabled={loading}>
                            {loading ? '发送中...' : '发送验证码'}
                        </button>
                    )}
                </div>

                {error && <p style={styles.error}>{error}</p>}
            </div>
        </div>
    );
}
