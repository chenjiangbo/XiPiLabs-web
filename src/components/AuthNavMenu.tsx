"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Define the user type based on expected API response
interface User {
  name: string;
  avatar: string;
}

// A simple, generic icon for logout
const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="logout-icon"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);


export default function AuthNavMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
      <a href="#">Home</a>
      <a href="#about">关于我们</a>
      <a href="#ai-products">AI 产品矩阵</a>
      <a href="#ai-education">AI 与教育</a>
      
      <div className="showcase__auth-links">
        {loading ? (
          <span className="auth-link-placeholder">...</span>
        ) : user ? (
          <>
            <span className="auth-user-info">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.avatar || '/xipi_log_notext.png'} alt={user.name} className="auth-user-avatar" />
              <span className="auth-user-name">{user.name}</span>
            </span>
            <button onClick={handleLogout} className="auth-logout-button" aria-label="Logout">
              <LogoutIcon />
            </button>
          </>
        ) : (
          <Link href="/login" className="auth-login-link">
            登录
          </Link>
        )}
      </div>
    </nav>
  );
}
