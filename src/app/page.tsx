/* eslint-disable react-hooks/static-components */
export const dynamic = "force-dynamic";

import type { CSSProperties } from "react";
import { allSections } from "contentlayer/generated";
import { useMDXComponent } from "next-contentlayer/hooks";

type SectionDoc = (typeof allSections)[number];

const orderedSections = [...allSections].sort((a, b) => a.order - b.order);
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

function SectionBlock({ section }: { section: SectionDoc }) {
  const MDXContent = useMDXComponent(section.body.code);
  return (
    <section className="content-section" id={section.slug} data-section={section.slug}>
      <div className="content-section__inner">
        <header className="content-section__header">
          {section.summary ? <span className="content-section__badge">{section.summary}</span> : null}
          <h2>{section.title}</h2>
        </header>
        <div className="content-section__surface">
          <MDXContent />
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const heroArt = heroImages[Math.floor(Math.random() * heroImages.length)];
  const heroCardStyle = {
    "--hero-art": `url(${heroArt})`,
  } as CSSProperties;

  return (
    <>
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
                  <small className="showcase__brand-slogan">用 AI 探索创意与未来</small>
                </div>
              </div>
              <nav className="showcase__menu">
                <a href="#">Home</a>
                <a href="#about">关于我们</a>
                <a href="#ai-products">AI 产品矩阵</a>
                <a href="#philosophy">理念与文化</a>
                <a href="#ai-education">AI 与教育</a>
                <a href="#journal">实验室纪事</a>
                <a href="#contact">联系我们</a>
              </nav>
            </div>

            <div className="showcase__body">
              <div className="showcase__intro">
                <p className="showcase__eyebrow">Designer · Developer · Innovator</p>
                <h1 className="showcase__title">
                  用 AI 探索<span>创意与未来</span>
                </h1>
                <p className="showcase__lead">
                  希皮实验室（Xipi Labs）专注于构建实用、易用、富有创意的 AI 应用，赋能个人与企业的创造力。
                </p>
                <div className="showcase__actions">
                  <a className="showcase__button showcase__button--primary" href="#ai-products">
                    浏览我们的 AI 产品
                  </a>
                  <a className="showcase__button showcase__button--ghost" href="#philosophy">
                    了解我们的理念
                  </a>
                </div>
              </div>
            </div>

              <div className="showcase__features" id="ai-products">
                <div className="showcase__features-header">
                  <div>
                    <h2>核心产品矩阵</h2>
                    <p>聚焦教育娱乐、开发者工具与图像效率三大方向。</p>
                  </div>
                </div>

                <div className="showcase__feature-grid">
                  <a
                    className="feature-card"
                    href="https://taleweaver.xipilabs.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="feature-card__icon feature-card__icon--one" aria-hidden="true">
                      1
                    </span>
                    <div className="feature-card__content">
                      <h3>TaleWeaver：AI 亲子绘本阅读</h3>
                      <p>
                        释放您和孩子的想象力。仅需一个主题，即可一键生成故事、配图和专业排版的精美绘本，并支持多种声音阅读。
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
                      <h3>XiPi Studio：AI 工坊</h3>
                      <p>
                        面向开发者与创意团队的 AI 原型平台，提供所见即所得的流程编排、调试与导出能力，帮助创意快速落地。
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
                      <h3>PSEver：AI 智能橡皮擦</h3>
                      <p>
                        一键擦除照片中多余元素并智能填充背景，实现像素级无痕修复，帮助摄影、电商团队提效。
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
