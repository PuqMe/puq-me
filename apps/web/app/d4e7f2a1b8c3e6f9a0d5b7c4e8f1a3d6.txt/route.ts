import { NextResponse } from "next/server";

export function GET() {
  return new NextResponse("d4e7f2a1b8c3e6f9a0d5b7c4e8f1a3d6\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
