import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repoName = 'Issue_Tracker_Web'; // Matches the repository name

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',
  images: {
    unoptimized: true,
  },
  // Ensure trailing slashes are handled correctly for static export routing
  trailingSlash: true,
};

export default nextConfig;
