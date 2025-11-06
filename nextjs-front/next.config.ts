import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Image optimization
  images: {
    domains: ['localhost', 'carforum.onrender.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Output configuration for production
  output: 'standalone',

  // Disable source maps in production for smaller bundle
  productionBrowserSourceMaps: false,

  // Enable compression
  compress: true,

  // Optimize for production
  poweredByHeader: false,

  // Environment variables available to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
};

export default nextConfig;
