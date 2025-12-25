import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "pbxt.replicate.delivery",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize Remotion packages to avoid bundling issues
      config.externals = config.externals || [];
      config.externals.push(
        '@remotion/bundler',
        '@remotion/renderer',
        '@remotion/lambda',
        '@remotion/compositor-win32-x64-msvc',
        '@remotion/compositor-darwin-arm64',
        '@remotion/compositor-darwin-x64',
        '@remotion/compositor-linux-arm64-gnu',
        '@remotion/compositor-linux-arm64-musl',
        '@remotion/compositor-linux-x64-gnu',
        '@remotion/compositor-linux-x64-musl',
        'uglify-js',
        '@swc/core',
      );
    }
    return config;
  },
};

export default nextConfig;
