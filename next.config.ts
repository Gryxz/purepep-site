import type { NextConfig } from "next";

const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  typedRoutes: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default config;
