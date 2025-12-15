"use client";

import Link from "next/link";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function NotFound() {
  return (
    <main style={{ padding: "48px", textAlign: "center" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "12px" }}>页面不存在 / Page not found</h1>
      <p style={{ color: "#666", marginBottom: "16px" }}>
        你访问的页面不存在，请返回首页。
      </p>
      <Link href="/" style={{ color: "#0070f3" }}>
        返回首页 / Back to Home
      </Link>
    </main>
  );
}
