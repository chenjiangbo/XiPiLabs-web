import type { Metadata } from "next";
import Header from "@/components/Header"; // Import the Header component
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
        <Header />
        {children}
      </body>
    </html>
  );
}
