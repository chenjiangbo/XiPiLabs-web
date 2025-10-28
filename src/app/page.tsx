/* eslint-disable react-hooks/static-components */
import { allSections } from "contentlayer/generated";
import { useMDXComponent } from "next-contentlayer/hooks";

type SectionDoc = (typeof allSections)[number];

const orderedSections = [...allSections].sort((a, b) => a.order - b.order);

function SectionBlock({ section }: { section: SectionDoc }) {
  const MDXContent = useMDXComponent(section.body.code);
  return (
    <section className="content-section" id={section.slug}>
      <h2>{section.title}</h2>
      <div className="content-section__body">
        <MDXContent />
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <header className="site-header">
        <div className="showcase">
          <div className="showcase__glow" />
          <div className="showcase__card">
            <div className="showcase__nav">
              <div className="showcase__brand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/xipi_log_notext.png"
                  alt="Xipi Labs"
                  width={88}
                  height={88}
                  loading="lazy"
                />
                <div className="showcase__brand-text">
                  <span className="showcase__brand-name">Xipi Labs</span>
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
              <div className="showcase__visual">
                <div className="showcase__visual-overlay" />
                <div className="showcase__visual-inner">
                  <h2>AI 赋能矩阵</h2>
                  <p>以实验为驱动，串联教育、内容、创意与效率的多元场景，持续迭代业务价值。</p>
                  <a href="#ai-products" className="showcase__visual-cta">
                    查看服务概览
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
                <a className="showcase__features-link" href="#journal">
                  查看实验进展
                </a>
              </div>

              <div className="showcase__feature-grid">
                <article className="feature-card">
                  <div className="feature-card__badge">01</div>
                  <div className="feature-card__tags" aria-label="产品标签">
                    <span>教育娱乐</span>
                    <span>AIGC</span>
                  </div>
                  <h3>TaleWeaver：AI 儿童绘本生成</h3>
                  <p>
                    释放您和孩子的想象力。仅需一个主题，即可一键生成故事、配图和专业排版的精美绘本，并支持多种声音阅读。
                  </p>
                  <a
                    className="feature-card__cta"
                    href="https://taleweaver.xipilabs.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    了解更多 &gt;
                  </a>
                </article>
                <article className="feature-card feature-card--planned">
                  <div className="feature-card__badge">02</div>
                  <div className="feature-card__tags" aria-label="产品标签">
                    <span>开发者工具</span>
                    <span>AIGC</span>
                    <span>原型构建</span>
                  </div>
                  <h3>XiPi Studio：AI 工坊</h3>
                  <p>
                    （规划中）面向开发者与创意团队的 AI 原型平台，提供可视化工作流、调试与导出能力，帮助创意快速落地。
                  </p>
                  <span className="feature-card__cta feature-card__cta--disabled">敬请期待</span>
                </article>
                <article className="feature-card feature-card--planned">
                  <div className="feature-card__badge">03</div>
                  <div className="feature-card__tags" aria-label="产品标签">
                    <span>图像工具</span>
                    <span>AIGC</span>
                    <span>效率神器</span>
                  </div>
                  <h3>PSEver：AI 智能橡皮擦</h3>
                  <p>
                    （规划中）一键擦除照片中多余元素并智能填充背景，实现像素级无痕修复，告别复杂的后期处理。
                  </p>
                  <span className="feature-card__cta feature-card__cta--disabled">敬请期待</span>
                </article>
              </div>

              <div className="showcase__scroll-hint">
                <span aria-hidden="true">⌄</span>
                <p>向下滚动，解锁更多实验计划</p>
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
