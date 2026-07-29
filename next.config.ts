import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

module.exports = {
  allowedDevOrigins: ['suspect-tabloid-compel.ngrok-free.dev'],
}

export default nextConfig;
