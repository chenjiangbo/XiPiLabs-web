import type { CSSProperties } from "react";
import LoginForm from "@/components/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  // Use a static background for the login page for consistency
  const heroCardStyle = {
    "--hero-art": `url(/cover_random/hero4.png)`,
  } as CSSProperties;

  return (
    <div className="site-header">
      <div className="showcase">
        <div className="showcase__glow" />
        <div className="showcase__card" style={heroCardStyle}>
          {/* Simplified nav for login page */}
          <div className="showcase__nav">
            <Link href="/" className="showcase__brand">
              <span className="showcase__brand-logo" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/xipi-logo12.png"
                  alt="Xipi Labs"
                  width={92}
                  height={92}
                  loading="lazy"
                />
              </span>
              <div className="showcase__brand-text">
                <span className="showcase__brand-name">XiPi Labs</span>
                <small className="showcase__brand-slogan">返回主页</small>
              </div>
            </Link>
          </div>

          {/* The main content area is replaced by the LoginForm */}
          <div className="login-page-content">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}