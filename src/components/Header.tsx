"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
    id: string;
    email: string | null;
    phone: string | null;
    displayName: string | null;
    avatarUrl: string | null;
}

const headerStyles: { [key: string]: React.CSSProperties } = {
    header: {
        backgroundColor: '#fff',
        padding: '1rem 2rem',
        borderBottom: '1px solid #eaeaea',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        fontWeight: 'bold',
        fontSize: '1.5rem',
        textDecoration: 'none',
        color: '#000',
    },
    nav: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
    },
    button: {
        padding: '0.5rem 1rem',
        backgroundColor: '#0070f3',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        textDecoration: 'none',
        fontSize: '1rem',
    },
};

export default function Header() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/me')
            .then(res => {
                if (res.ok) {
                    return res.json();
                }
                return null;
            })
            .then(data => {
                setUser(data);
                setLoading(false);
            })
            .catch(() => {
                setUser(null);
                setLoading(false);
            });
    }, []);

    return (
        <header style={headerStyles.header}>
            <Link href="/" style={headerStyles.logo}>
                XipiLabs
            </Link>
            <nav style={headerStyles.nav}>
                {loading ? (
                    <div>Loading...</div>
                ) : user ? (
                    <div style={headerStyles.userInfo}>
                        {user.avatarUrl && <img src={user.avatarUrl} alt="User avatar" style={headerStyles.avatar} />}
                        <span>{user.displayName || user.email}</span>
                        <a href="/api/logout" style={headerStyles.button}>
                            登出
                        </a>
                    </div>
                ) : (
                    <Link href="/login" style={headerStyles.button}>
                        登录
                    </Link>
                )}
            </nav>
        </header>
    );
}
