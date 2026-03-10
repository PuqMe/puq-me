import { ImageResponse } from "next/og";

export const size = {
  width: 192,
  height: 192
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
          background: "linear-gradient(135deg, #ff6b57, #f4b740)",
          color: "#151515",
          fontSize: 72,
          fontWeight: 700
        }}
      >
        P
      </div>
    ),
    size
  );
}
