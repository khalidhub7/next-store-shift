import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // temporarily just to calcul real renders
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.dummyjson.com",
      },
      {
        protocol: "https",
        hostname: "img.icons8.com",
      },
    ],
  },
};

export default nextConfig;
