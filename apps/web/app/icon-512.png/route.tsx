import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512
};

export const contentType = "image/png";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ff6b57, #9fd7c8)",
          color: "#151515",
          fontSize: 180,
          fontWeight: 700
        }}
      >
        P
      </div>
    ),
    size
  );
}
