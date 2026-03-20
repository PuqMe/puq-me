import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: ["@puqme/ui", "@puqme/types", "@puqme/config"],
  experimental: {
    optimizePackageImports: ["clsx"]
  }
};

export default nextConfig;
