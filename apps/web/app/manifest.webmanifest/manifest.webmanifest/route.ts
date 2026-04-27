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
    display_override: ["fullscreen", "standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: BRAND_SURFACE_COLOR,
    theme_color: BRAND_THEME_COLOR,
    start_url: "/splash",
    scope: "/",
    lang: "de",
    categories: ["social", "lifestyle", "dating"],
    prefer_related_applications: false,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ],
    shortcuts: [
      {
        name: "Begegnungen",
        short_name: "Begegnung",
        url: "/encounter",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }]
      },
      {
        name: "Chat",
        short_name: "Chat",
        url: "/chat",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }]
      },
      {
        name: "Profil",
        short_name: "Profil",
        url: "/settings",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }]
      }
    ]
  });
}
