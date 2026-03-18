import { ImageResponse } from "next/og";
import { LogoMark } from "@puqme/ui";

const size = {
  width: 512,
  height: 512
};

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
          borderRadius: "112px",
          background: "#472845"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%"
          }}
        >
          <LogoMark size={332} />
        </div>
      </div>
    ),
    size
  );
}
