"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Hisaab global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          backgroundColor: "#f8f9fa",
          color: "#1a1a2e",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: "24rem" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: "rgba(220, 38, 38, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              fontSize: 28,
            }}
          >
            !
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
            An unexpected error occurred. Your data is safe in your browser.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "8px 20px",
              fontSize: 14,
              fontWeight: 500,
              borderRadius: 8,
              border: "1px solid #d1d5db",
              backgroundColor: "#fff",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
