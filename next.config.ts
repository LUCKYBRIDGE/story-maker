import type { NextConfig } from "next";

const isExport = process.env.STATIC_EXPORT === "true" || process.env.GITHUB_PAGES === "true";
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH;
const basePath = rawBasePath !== undefined ? rawBasePath : (process.env.GITHUB_PAGES === "true" ? "/story-maker" : "");

const nextConfig: NextConfig = {
  ...(isExport
    ? {
        output: "export",
        ...(basePath ? { basePath, assetPrefix: basePath } : {}),
        images: {
          unoptimized: true,
        },
      }
    : {}),
};

export default nextConfig;
