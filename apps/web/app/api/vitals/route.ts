import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "edge";

type VitalPayload = {
  name: string;
  value: number;
  rating: string;
  path: string;
  userAgent: string;
  timestamp: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as VitalPayload[];

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Log metrics for monitoring (in production, send to analytics service)
    for (const vital of body) {
      if (vital.rating === "poor") {
        console.warn(
          `[WebVital:POOR] ${vital.name}=${vital.value.toFixed(2)} path=${vital.path}`
        );
      }
    }

    // In production, forward to analytics:
    // await fetch("https://analytics.puq.me/vitals", { method: "POST", body: JSON.stringify(body) });

    return NextResponse.json({ ok: true, received: body.length });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
