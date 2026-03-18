import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Force all pages to be dynamic
  experimental: {
    // Disable ISR caching
  },
  // Set headers to prevent caching
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
        {
          key: "CDN-Cache-Control",
          value: "no-store",
        },
        {
          key: "Vercel-CDN-Cache-Control",
          value: "no-store",
        },
      ],
    },
  ],
};

export default nextConfig;
