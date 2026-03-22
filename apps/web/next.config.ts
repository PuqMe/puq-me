import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: ["@puqme/ui", "@puqme/types", "@puqme/config"],
  experimental: {
    optimizePackageImports: ["clsx"]
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
  async redirects() {
    return [
      {
        source: "/datenschutz",
        destination: "/privacy",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
