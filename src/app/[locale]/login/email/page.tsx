import type { CSSProperties } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import EmailLoginForm from "@/components/EmailLoginForm";

const heroImages = [
  "/cover_random/hero1.webp",
  "/cover_random/hero2.webp",
  "/cover_random/hero3.webp",
  "/cover_random/hero4.webp",
  "/cover_random/hero5.webp",
  "/cover_random/hero6.webp",
  "/cover_random/hero7.webp",
  "/cover_random/hero8.webp",
  "/cover_random/hero9.webp",
  "/cover_random/hero10.webp",
  "/cover_random/hero11.webp",
  "/cover_random/hero12.webp",
  "/cover_random/hero13.webp",
  "/cover_random/hero14.webp",
] as const;

export default function EmailLoginPage() {
  const t = useTranslations("LoginPage");
  const heroArt = heroImages[0];
  const heroCardStyle = {
    "--hero-art": `url(${heroArt})`,
  } as CSSProperties;

  return (
    <div className="site-header login-page-wrapper">
      <div className="showcase">
        <div className="showcase__glow" />
        <div className="showcase__card" style={heroCardStyle}>
          <div className="showcase__nav">
            <Link href="/" className="showcase__brand">
              <span className="showcase__brand-logo" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/xipi-logo12.webp"
                  alt="Xipi Labs"
                  width={92}
                  height={92}
                  loading="lazy"
                />
              </span>
              <div className="showcase__brand-text">
                <span className="showcase__brand-name">XiPi Labs</span>
                <small className="showcase__brand-slogan">{t("back_to_home")}</small>
              </div>
            </Link>
          </div>
          <div className="showcase__body">
            <div className="showcase__intro">
              <EmailLoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
