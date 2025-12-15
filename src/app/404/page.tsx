"use client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function Custom404() {
  return (
    <main style={{ padding: "48px", textAlign: "center" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "12px" }}>404</h1>
      <p style={{ color: "#666", marginBottom: "16px" }}>
        页面不存在 / Page not found
      </p>
      <a href="/" style={{ color: "#0070f3" }}>返回首页 / Back to Home</a>
    </main>
  );
}
