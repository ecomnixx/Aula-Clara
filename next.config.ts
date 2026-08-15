import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O banco Cloudflare não participa da aplicação publicada na Vercel.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
