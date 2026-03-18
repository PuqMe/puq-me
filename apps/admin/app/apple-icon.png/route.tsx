import { ImageResponse } from "next/og";
import { LogoMark } from "@puqme/ui";

const size = {
  width: 180,
  height: 180
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
          background: "#472845",
          borderRadius: "44px"
        }}
      >
        <LogoMark size={116} />
      </div>
    ),
    size
  );
}
