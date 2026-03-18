import { ImageResponse } from "next/og";
import { BRAND_NAME, BRAND_TAGLINE } from "@puqme/config";
import { LogoMark } from "@puqme/ui";

const size = {
  width: 1200,
  height: 630
};

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "space-between",
          background:
            "radial-gradient(circle at top left, rgba(168,85,247,0.28), transparent 34%), linear-gradient(135deg, #2D1830 0%, #472845 55%, #1A0F22 100%)",
          color: "#F8EEFF",
          padding: "56px 64px",
          fontFamily: "sans-serif"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", maxWidth: "690px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "18px", fontSize: 30, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.82 }}>
            <LogoMark size={44} />
            <span>{BRAND_NAME}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ fontSize: 88, lineHeight: 1, fontWeight: 700 }}>{BRAND_NAME}</div>
            <div style={{ fontSize: 34, lineHeight: 1.25, maxWidth: "620px", color: "rgba(248,238,255,0.84)" }}>
              {BRAND_TAGLINE}
            </div>
          </div>
          <div style={{ fontSize: 24, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(248,238,255,0.68)" }}>
            Swipe. Match. Chat.
          </div>
        </div>

        <div
          style={{
            width: "318px",
            borderRadius: "52px",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 30px 90px rgba(0,0,0,0.28)"
          }}
        >
          <div
            style={{
              width: "232px",
              height: "232px",
              borderRadius: "54px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#472845"
            }}
          >
            <LogoMark size={148} />
          </div>
        </div>
      </div>
    ),
    size
  );
}
