import {
  BRAND_DESCRIPTION,
  BRAND_NAME,
  BRAND_SHORT_NAME,
  BRAND_SURFACE_COLOR,
  BRAND_THEME_COLOR
} from "@puqme/config";

export function GET() {
  return Response.json({
    name: BRAND_NAME,
    short_name: BRAND_SHORT_NAME,
    description: BRAND_DESCRIPTION,
    display: "standalone",
    background_color: BRAND_SURFACE_COLOR,
    theme_color: BRAND_THEME_COLOR,
    start_url: "/swipe",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ]
  });
}
