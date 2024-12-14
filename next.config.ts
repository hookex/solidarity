import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    typescript: {
        ignoreBuildErrors: true,  // 禁用类型检查
    },
};

export default nextConfig;
