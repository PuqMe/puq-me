import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "PuQ.me";
  const description = searchParams.get("desc") || "Dating in your city, with presence.";
  const icon = searchParams.get("icon") || "📍";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #07050f 0%, #1a0e2e 40%, #2d1548 70%, #07050f 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorative circles */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(168, 85, 247, 0.15)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: -120, left: -60, width: 400, height: 400, borderRadius: "50%", background: "rgba(168, 85, 247, 0.08)", display: "flex" }} />

        {/* Icon */}
        <div style={{ fontSize: 72, marginBottom: 16, display: "flex" }}>{icon}</div>

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.1,
            maxWidth: "80%",
            display: "flex",
          }}
        >
          {title}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.7)",
            textAlign: "center",
            marginTop: 16,
            maxWidth: "70%",
            display: "flex",
          }}
        >
          {description}
        </div>

        {/* Bottom brand bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: "rgba(168, 85, 247, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#a855f7", display: "flex" }} />
          <div style={{ fontSize: 24, fontWeight: 700, color: "#a855f7", display: "flex" }}>PuQ.me</div>
          <div style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", marginLeft: 8, display: "flex" }}>
            Dating in your city
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
