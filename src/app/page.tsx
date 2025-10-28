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
                  src="/xipilabs_green.png"
                  alt="Xipi Labs"
                  width={88}
                  height={88}
                  loading="lazy"
                />
                <div className="showcase__brand-text">
                  <span className="showcase__brand-name">Xipi Labs</span>
                  <small>Experience Studio</small>
                </div>
              </div>
              <nav className="showcase__menu">
                <a href="#">Home</a>
                <a href="#about">About</a>
                <a href="#services">Services</a>
                <a href="#portfolio">Portfolio</a>
                <a href="#contact">Contact</a>
              </nav>
            </div>

            <div className="showcase__body">
              <div className="showcase__intro">
                <p className="showcase__eyebrow">
                  Designer · Developer · Innovator
                </p>
                <h1 className="showcase__title">
                  打造下一代
                  <span>沉浸式数字体验</span>
                </h1>
                <p className="showcase__lead">
                  我们是专注体验设计与前沿工程实现的混合团队，擅长把复杂产品转化为触手可及的体验，并在业务目标之间找到最优平衡。
                </p>
                <div className="showcase__actions">
                  <a className="showcase__button showcase__button--primary" href="#contact">
                    联系我们
                  </a>
                  <a className="showcase__button showcase__button--ghost" href="#portfolio">
                    查看案例
                  </a>
                </div>
              </div>
              <div className="showcase__visual">
                <div className="showcase__visual-overlay" />
                <div className="showcase__visual-inner">
                  <h2>数字体验矩阵</h2>
                  <p>
                    以品牌故事为核心，融合交互动画、3D 视觉与工程落地，为企业打造独特的在线形象。
                  </p>
                  <a href="#capabilities" className="showcase__visual-cta">
                    了解服务内容
                  </a>
                </div>
              </div>
            </div>

            <div className="showcase__features" id="services">
              <article className="feature-card">
                <div className="feature-card__badge">01</div>
                <h3>设计系统赋能</h3>
                <p>
                  通过可扩展的设计系统与组件库，确保各触点的一致体验，缩短跨团队协作成本。
                </p>
                <a href="#design">阅读全文</a>
              </article>
              <article className="feature-card">
                <div className="feature-card__badge">02</div>
                <h3>产品工程共创</h3>
                <p>
                  采用双栈研发模式，从概念验证到正式上线，提供贯穿式的产品工程支持。
                </p>
                <a href="#engineering">阅读全文</a>
              </article>
              <article className="feature-card">
                <div className="feature-card__badge">03</div>
                <h3>体验数据回路</h3>
                <p>
                  数据驱动的持续优化机制，帮助业务团队衡量体验效果并快速迭代。
                </p>
                <a href="#insights">阅读全文</a>
              </article>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="content-section" id="learn-more">
          <h2>模块占位标题</h2>
          <p>
            在这里填充你的产品介绍、亮点或案例。背景图已经固定，因此你可以继续往下拓展内容区域，而无需担心滚动时背景重复或断层。
          </p>
          <p>
            日后扩展时，直接复制这个 section 或创造新的组件即可。若页面长度很长，可考虑在底部添加额外渐变覆盖层，使背景逐渐过渡到纯色，提升可读性。
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

