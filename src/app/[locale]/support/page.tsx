import { getTranslations } from "next-intl/server";

const DISCORD_URL = "https://discord.gg/xipilabs";
const SUPPORT_EMAIL = "xipilabs@gmail.com";

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params; // locale is inferred via routing; not directly needed here
  const t = await getTranslations("SupportPage");

  const tips = [
    t("tip_refund"),
    t("tip_account"),
    t("tip_feature"),
  ];

  return (
    <main className="min-h-screen px-6 py-16 sm:py-20">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur md:p-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-white/60">
                XiPi Labs
              </p>
              <h1 className="mt-1 text-3xl font-semibold text-white md:text-4xl">
                {t("title")}
              </h1>
              <p className="mt-3 max-w-2xl text-base text-white/80 md:text-lg">
                {t("subtitle")}
              </p>
            </div>
            <div className="mt-4 flex gap-3 md:mt-0">
              <a
                className="rounded-full bg-white text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                href={`mailto:${SUPPORT_EMAIL}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`Email ${SUPPORT_EMAIL}`}
              >
                <span className="block px-4 py-2">{t("email_cta")}</span>
              </a>
              <a
                className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                href={DISCORD_URL}
                target="_blank"
                rel="noreferrer"
              >
                {t("discord_cta")}
              </a>
            </div>
          </div>
          <p className="mt-5 text-sm text-yellow-100/90">
            {t("also_email")}
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-yellow-200/10 via-white/5 to-white/10 p-6 shadow-xl backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-lg font-semibold text-yellow-200">
                ✉️
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {t("email_card_title")}
                </h2>
                <p className="text-sm text-white/75">{SUPPORT_EMAIL}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/80">
              {t("email_card_desc")}
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-yellow-200 transition hover:translate-x-0.5"
            >
              {t("email_cta")}
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-sky-200/10 via-white/5 to-white/10 p-6 shadow-xl backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-lg font-semibold text-sky-200">
                💬
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {t("discord_card_title")}
                </h2>
                <p className="text-sm text-white/75">
                  {t("discord_card_desc")}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/80">
              {t("discord_more")}
            </p>
            <a
              href={DISCORD_URL}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-100 transition hover:translate-x-0.5"
              target="_blank"
              rel="noreferrer"
            >
              {t("discord_cta")}
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
          <h3 className="text-lg font-semibold text-white">{t("tips_title")}</h3>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            {tips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span aria-hidden="true">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
