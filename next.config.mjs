// File: E:/projects/sorties/task-management/task-manager-app/next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add this webpack configuration
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("pino-pretty");
    }
    return config;
  },
};

export default nextConfig;
