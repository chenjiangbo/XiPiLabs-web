"use client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function ErrorPage() {
  return (
    <main style={{ padding: "48px", textAlign: "center" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "12px" }}>500</h1>
      <p style={{ color: "#666", marginBottom: "16px" }}>
        服务器错误 / Server error
      </p>
      <a href="/" style={{ color: "#0070f3" }}>返回首页 / Back to Home</a>
    </main>
  );
}
