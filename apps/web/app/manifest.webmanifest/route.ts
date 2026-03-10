export function GET() {
  return Response.json({
    name: "PuQ.me",
    short_name: "PuQ",
    description: "Mobile-first dating web app.",
    display: "standalone",
    background_color: "#f7f3ea",
    theme_color: "#f7f3ea",
    start_url: "/swipe",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  });
}
