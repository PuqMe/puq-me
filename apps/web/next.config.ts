import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  output: "standalone",
  outputFileTracingRoot: path.join(process.cwd(), "../.."),
  transpilePackages: ["@puqme/ui", "@puqme/types", "@puqme/config"],
  experimental: {
    optimizePackageImports: ["clsx"]
  }
};

export default nextConfig;
