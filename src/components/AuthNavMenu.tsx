"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import LanguageSwitcher from "./LanguageSwitcher"; // Added import

// Define the user type based on expected API response
interface User {
  displayName: string;
  avatarUrl: string | null;
}

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="user-icon"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

// A simple, generic icon for logout
const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="logout-icon"
  >
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
    <line x1="12" y1="2" x2="12" y2="12"></line>
  </svg>
);


export default function AuthNavMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('AuthNavMenu'); // Added useTranslations hook

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout");
      setUser(null);
      // Optionally, redirect to home or refresh
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="showcase__menu">
      <a href="#">{t('home')}</a>
      <a href="#about">{t('about_us')}</a>
      <a href="#ai-products">{t('ai_products_matrix')}</a>
      <a href="#ai-education">{t('ai_and_education')}</a>
      
      <div className="showcase__auth-links">
        {loading ? (
          <span className="auth-link-placeholder">{t('loading')}</span>
        ) : user ? (
          <>
            <span className="auth-user-info">
              <span className="auth-icon-button">
                <UserIcon />
              </span>
              <span className="auth-user-name">{user.displayName}</span>
            </span>
            <button onClick={handleLogout} className="auth-icon-button" aria-label={t('logout')}>
              <LogoutIcon />
            </button>
          </>
        ) : (
          <Link href="/login" className="auth-login-link">
            {t('join_us')}
          </Link>
        )}
      </div>
    </nav>
  );
}
