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
            "radial-gradient(circle at top right, rgba(168,85,247,0.22), transparent 28%), linear-gradient(135deg, #08111B 0%, #11202B 50%, #1F1426 100%)",
          color: "#F7F8FC",
          padding: "56px 64px",
          fontFamily: "sans-serif"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", maxWidth: "720px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "18px", fontSize: 28, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.8 }}>
            <LogoMark size={42} />
            <span>{BRAND_NAME} Admin</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ fontSize: 84, lineHeight: 1, fontWeight: 700 }}>{BRAND_NAME} Admin</div>
            <div style={{ fontSize: 32, lineHeight: 1.28, maxWidth: "640px", color: "rgba(247,248,252,0.82)" }}>
              {BRAND_TAGLINE}
            </div>
          </div>
          <div style={{ fontSize: 24, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(247,248,252,0.62)" }}>
            Trust. Moderation. Operations.
          </div>
        </div>

        <div
          style={{
            width: "318px",
            borderRadius: "52px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.03)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 30px 90px rgba(0,0,0,0.3)"
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
