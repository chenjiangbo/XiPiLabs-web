const SUPPORT_EMAIL = "xipilabs@gmail.com";

type Locale = "zh" | "en";

const privacyContent: Record<
  Locale,
  {
    title: string;
    subtitle: string;
    updated: string;
    sections: { heading: string; body: string[] }[];
  }
> = {
  zh: {
    title: "隐私政策",
    subtitle: "本政策适用于 XiPi Labs 的产品与服务，包括 TaleWeave iOS 客户端、官网及相关后端。",
    updated: "最近更新：2025-01-17",
    sections: [
      {
        heading: "1. 适用范围",
        body: [
          "使用我们的服务即表示你同意本隐私政策的内容。本政策覆盖 TaleWeave iOS 客户端、xipilabs.com 官网及相关后端服务。",
        ],
      },
      {
        heading: "2. 我们收集的数据",
        body: [
          "账户信息：通过 Apple / Google / Firebase Auth 获取的账户标识、邮箱（如提供）、昵称/头像（如提供）。",
          "订阅与支付：RevenueCat 提供的订阅状态、产品 ID、交易记录元数据（不含完整支付卡信息）。",
          "使用数据：功能使用日志、崩溃/错误信息、基础性能指标。",
          "设备与网络：设备型号、系统版本、应用版本、语言、时区、IP 地址（用于安全与反滥用）。",
        ],
      },
      {
        heading: "3. 我们如何使用",
        body: [
          "身份验证与会话管理。",
          "订阅/充值状态查询与权益发放。",
          "内容生成、功能改进与故障排查。",
          "客服与售后（含退款核对、问题追踪）。",
        ],
      },
      {
        heading: "4. 第三方服务",
        body: [
          "Firebase Auth（账户登录与鉴权）。",
          "RevenueCat（订阅与内购管理）。",
          "TaleWeave 自有后端（内容与账户数据处理）。",
          "如有新增分析/日志服务，将在更新版本中说明。",
        ],
      },
      {
        heading: "5. 数据存储与保留",
        body: [
          "账户与订阅数据在账户存续期间保留；法律或合规要求的最短/最长保留周期将优先适用。",
          "日志与诊断数据通常按业务需要的周期滚动清理。",
        ],
      },
      {
        heading: "6. 安全",
        body: [
          "传输层加密（HTTPS）。",
          "访问控制与最小化权限，仅授权人员在必要范围内访问。",
          "对敏感操作进行审计或监控（如有）。",
        ],
      },
      {
        heading: "7. 你的权利",
        body: [
          "访问、更正、删除你的个人信息。",
          "在法律允许范围内撤回同意（可能影响部分功能）。",
          "请求数据导出或副本。",
          "请通过邮件与我们联系以行使上述权利，我们会在合理时间内回复。",
        ],
      },
      {
        heading: "8. 未成年人",
        body: [
          "若你未满所在司法辖区规定的法定年龄，请在监护人同意和指导下使用，并由监护人代为提交相关请求。",
        ],
      },
      {
        heading: "9. 联系方式",
        body: [`如有隐私相关问题、投诉或权利请求，请发送邮件至：${SUPPORT_EMAIL}。`],
      },
      {
        heading: "10. 更新",
        body: [
          "我们可能根据业务与法规变化更新本政策。更新后会在本页标注生效日期，重要变更可能通过应用内或官网通知。",
        ],
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    subtitle:
      "This policy applies to XiPi Labs products and services, including the TaleWeave iOS app, the website, and related backends.",
    updated: "Last updated: 2025-01-17",
    sections: [
      {
        heading: "1. Scope",
        body: [
          "By using our services you agree to this Privacy Policy. It covers the TaleWeave iOS app, xipilabs.com, and related backend services.",
        ],
      },
      {
        heading: "2. Data We Collect",
        body: [
          "Account: identifiers from Apple / Google / Firebase Auth; email, display name, avatar when provided.",
          "Subscription & Payments: subscription status, product IDs, and transaction metadata from RevenueCat (no full payment card data).",
          "Usage: feature usage logs, crash/error reports, basic performance metrics.",
          "Device & Network: device model, OS version, app version, language, timezone, IP address (for security/abuse prevention).",
        ],
      },
      {
        heading: "3. How We Use It",
        body: [
          "Authentication and session management.",
          "Subscription/top-up verification and entitlement delivery.",
          "Content generation, feature improvement, and troubleshooting.",
          "Customer support and after-sales (including refund verification and issue tracking).",
        ],
      },
      {
        heading: "4. Third-Party Services",
        body: [
          "Firebase Auth (login/authentication).",
          "RevenueCat (subscriptions/in-app purchases).",
          "TaleWeave backend (first-party processing for content and accounts).",
          "Any new analytics/logging services will be disclosed in future updates.",
        ],
      },
      {
        heading: "5. Storage & Retention",
        body: [
          "Account and subscription data are retained while your account remains active; legal/regulatory retention requirements prevail where applicable.",
          "Logs/diagnostics are retained and rotated based on operational needs.",
        ],
      },
      {
        heading: "6. Security",
        body: [
          "Transport encryption (HTTPS).",
          "Access control and least-privilege for internal access.",
          "Sensitive operations may be audited or monitored where applicable.",
        ],
      },
      {
        heading: "7. Your Rights",
        body: [
          "Access, correct, or delete your personal data.",
          "Withdraw consent where allowed (may affect certain features).",
          "Request data export/copies.",
          "Contact us via email to exercise these rights; we will respond within a reasonable timeframe.",
        ],
      },
      {
        heading: "8. Children/Minors",
        body: [
          "If you are below the legal age in your jurisdiction, use the services with guardian consent and have a guardian submit related requests.",
        ],
      },
      {
        heading: "9. Contact",
        body: [`For privacy questions, complaints, or rights requests: ${SUPPORT_EMAIL}.`],
      },
      {
        heading: "10. Changes",
        body: [
          "We may update this policy as our services or laws change. We will note the effective date on this page and may provide in-app or website notices for material changes.",
        ],
      },
    ],
  },
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const content = privacyContent[locale] ?? privacyContent.en;

  return (
    <main className="min-h-screen px-6 py-16 sm:py-20">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur md:p-10">
          <p className="text-sm uppercase tracking-[0.16em] text-white/60">XiPi Labs</p>
          <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">{content.title}</h1>
          <p className="mt-3 text-base text-white/80 md:text-lg">{content.subtitle}</p>
          <p className="mt-2 text-xs text-white/60">{content.updated}</p>
          <p className="mt-4 text-sm text-yellow-100/90">
            {locale === "zh"
              ? `如需联系我们，请发送邮件至 ${SUPPORT_EMAIL}。`
              : `To contact us, email ${SUPPORT_EMAIL}.`}
          </p>
        </header>

        <div className="space-y-5">
          {content.sections.map((section) => (
            <section
              key={section.heading}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur"
            >
              <h2 className="text-lg font-semibold text-white">{section.heading}</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-white/80">
                {section.body.map((paragraph) => (
                  <li key={paragraph} className="flex gap-2">
                    <span aria-hidden="true">•</span>
                    <span>{paragraph}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
