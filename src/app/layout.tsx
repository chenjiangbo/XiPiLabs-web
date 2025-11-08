import type { Metadata } from "next";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
