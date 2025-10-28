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
                  src="/xipi-logo1.png"
                  alt="Xipi Labs"
                  width={96}
                  height={90}
                  loading="lazy"
                />
                <div className="showcase__brand-text">
                  <span className="showcase__brand-name">Xipi Labs</span>
                  <small className="showcase__brand-slogan">用 AI 探索创意与未来</small>
                </div>
              </div>
              <nav className="showcase__menu">
                <a href="#">Home</a>
                <a href="#ai-products">AI 产品矩阵</a>
                <a href="#philosophy">理念与文化</a>
                <a href="#journal">实验室纪事</a>
                <a href="#contact">联系我们</a>
              </nav>
            </div>

            <div className="showcase__body">
              <div className="showcase__intro">
                <p className="showcase__eyebrow">
                  Designer · Developer · Innovator
                </p>
                <h1 className="showcase__title">
                  用 AI 探索
                  <span>创意与未来</span>
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
                  <p>
                    以实验为驱动，串联教育、内容、创意与效率的多元场景，持续迭代业务价值。
                  </p>
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
                  <span className="feature-card__cta feature-card__cta--disabled">
                    敬请期待
                  </span>
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
                  <span className="feature-card__cta feature-card__cta--disabled">
                    敬请期待
                  </span>
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
        <section className="content-section" id="philosophy">
          <h2>理念与文化</h2>
          <p>
            我们以“实验室”思维推动产品迭代：敢于验证前沿想法，也坚持让每一次创新切实服务真实场景。技术与设计在这里共创，数据反馈帮助我们持续优化体验。
          </p>
          <p>
            下一步，我们会把理念拆解为“创意探索”“以人为本”“工程落地”三大支柱，并用真实案例与指标佐证，敬请期待完整内容更新。
          </p>
        </section>
        <section className="content-section" id="journal">
          <h2>实验室纪事</h2>
          <p>
            我们正在整理研发笔记、客户案例以及合作伙伴的真实声音。未来这里将记录希皮实验室的每一次灵感迸发与落地瞬间。
          </p>
        </section>
        <section className="content-section" id="contact">
          <h2>联系 CTA 占位</h2>
          <p>
            这里可以放置联系表单、CTA 按钮或其它交互组件。背景层使用 fixed 定位，不会随着内容滚动而失真。
          </p>
        </section>
      </main>
    </>
  );
}
