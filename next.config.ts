import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.pexels.com" }],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async redirects() {
    return [
      { source: "/dashboard/leagues", destination: "/dashboard/pools", permanent: true },
      { source: "/dashboard/leagues/:path*", destination: "/dashboard/pools/:path*", permanent: true },
      { source: "/admin/leagues", destination: "/admin/pools", permanent: true },
    ];
  },
};


export default nextConfig;