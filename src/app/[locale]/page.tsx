/* eslint-disable react-hooks/static-components */
export const dynamic = "force-dynamic";

import type { CSSProperties } from "react";
import { allSections } from "contentlayer/generated";
import AuthNavMenu from "@/components/AuthNavMenu";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getTranslations } from 'next-intl/server';
import SectionBlock from '@/components/SectionBlock';

type SectionDoc = (typeof allSections)[number];

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

export default async function Home({ params }: { params: Promise<{locale:string}> }) {
  const { locale } = await params;
  const t = await getTranslations('HomePage');

  const orderedSections = allSections
    .filter((section) => section.locale === locale)
    .sort((a, b) => a.order - b.order);

  const heroArt = heroImages[Math.floor(Math.random() * heroImages.length)];
  const heroCardStyle = {
    "--hero-art": `url(${heroArt})`,
  } as CSSProperties;

  return (
    <>
      <div className="language-switcher-container">
        <LanguageSwitcher />
      </div>
      <header className="site-header">
        <div className="showcase">
          <div className="showcase__glow" />
          <div className="showcase__card" style={heroCardStyle}>
            <div className="showcase__nav">
              <div className="showcase__brand">
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
                  <small className="showcase__brand-slogan">{t('brand_slogan')}</small>
                </div>
              </div>
              <AuthNavMenu />
            </div>

            <div className="showcase__body">
              <div className="showcase__intro">
                <p className="showcase__eyebrow">Designer · Developer · Innovator</p>
                <h1 className="showcase__title">
                  {t.rich('slogan', {
                    span: (chunks) => <span>{chunks}</span>,
                    br: () => <br />
                  })}
                </h1>
                <p className="showcase__lead">
                  {t('lead')}
                </p>
                <div className="showcase__actions">
                  <a className="showcase__button showcase__button--primary" href="#ai-products">
                    {t('browse_products')}
                  </a>
                  <a className="showcase__button showcase__button--ghost" href="#philosophy">
                    {t('learn_philosophy')}
                  </a>
                </div>
              </div>
            </div>

              <div className="showcase__features" id="ai-products">
                <div className="showcase__features-header">
                  <div>
                    <h2>{t('core_products_title')}</h2>
                    <p>{t('core_products_subtitle')}</p>
                  </div>
                </div>

                <div className="showcase__feature-grid">
                  <a
                    className="feature-card"
                    href="https://taleweave.xipilabs.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="feature-card__icon feature-card__icon--one" aria-hidden="true">
                      1
                    </span>
                    <div className="feature-card__content">
                      <h3>{t('product1_title')}</h3>
                      <p>
                        {t('product1_description')}
                      </p>
                    </div>
                  </a>
                  <a
                    className="feature-card feature-card--planned"
                    href="https://stock.xipilabs.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="feature-card__icon feature-card__icon--two" aria-hidden="true">
                      2
                    </span>
                    <div className="feature-card__content">
                      <h3>{t('product2_title')}</h3>
                      <p>
                        {t('product2_description')}
                      </p>
                    </div>
                  </a>
                  <a
                    className="feature-card feature-card--planned"
                    href="https://psever.xipilabs.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="feature-card__icon feature-card__icon--three" aria-hidden="true">
                      3
                    </span>
                    <div className="feature-card__content">
                      <h3>{t('product3_title')}</h3>
                      <p>
                        {t('product3_description')}
                      </p>
                    </div>
                  </a>
                </div>

              </div>
          </div>
        </div>
      </header>

      <main>
        {orderedSections.map((section) => (
          <SectionBlock key={section._id} section={section} />
        ))}
      </main>
    </>
  );
}
