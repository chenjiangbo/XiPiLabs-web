import type { Metadata } from "next";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export const metadata: Metadata = {
  title: "Xipi Labs · Digital Hero",
  description:
    "Xipi Labs 官方展示页，聚焦沉浸式数字体验与产品工程共创。",
  icons: {
    icon: "/xipi-logo12.png",
    shortcut: "/xipi-logo12.png",
    apple: "/xipi-logo12.png",
  },
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
