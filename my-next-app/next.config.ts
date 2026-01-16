// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // บอกให้ Vercel ข้ามการเช็ค Error ของ TypeScript ตอน Build
    ignoreBuildErrors: true,
  },
  eslint: {
    // บอกให้ข้ามการเช็ค ESLint ตอน Build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;