import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

// Analyzes the production bundle to show 
// what JavaScript is shipped and its size
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // temporarily just to calculate real renders
  // reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.dummyjson.com" },
      { protocol: "https", hostname: "img.icons8.com" },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
