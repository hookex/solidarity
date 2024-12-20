/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // 在生产构建时忽略类型错误，但在开发时仍然显示错误
    ignoreBuildErrors: true,
  },
  eslint: {
    // 在生产构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // 添加对 markdown 的支持
    config.resolve.fallback = { fs: false };
    return config;
  }
};

module.exports = nextConfig; 