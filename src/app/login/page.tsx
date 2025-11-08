import type { CSSProperties } from "react";
import LoginForm from "@/components/LoginForm";
import Link from "next/link";

// Replicate the hero images array from the main page
const heroImages = [
  "/cover_random/hero1.png",
  "/cover_random/hero2.png",
  "/cover_random/hero3.png",
  "/cover_random/hero4.png",
  "/cover_random/hero5.png",
  "/cover_random/hero6.png",
  "/cover_random/hero7.png",
  "/cover_random/hero8.png",
  "/cover_random/hero9.png",
  "/cover_random/hero10.png",
  "/cover_random/hero11.png",
  "/cover_random/hero12.png",
  "/cover_random/hero13.png",
  "/cover_random/hero14.png",
] as const;

export default function LoginPage() {
  // Randomly select a hero image for the right-side container
  const heroArt = heroImages[Math.floor(Math.random() * heroImages.length)];
  const imageContainerStyle = {
    backgroundImage: `url(${heroArt})`,
  } as CSSProperties;

  return (
    <div className="site-header">
      <div className="showcase">
        <div className="showcase__glow" />
        {/* The main card no longer needs the pseudo-element style */}
        <div className="showcase__card">
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

          {/* The main content area now uses an explicit flex layout */}
          <div className="login-page-content">
            <div className="login-form-wrapper">
              <LoginForm />
            </div>
            <div className="login-image-wrapper" style={imageContainerStyle}></div>
          </div>
        </div>
      </div>
    </div>
  );
}