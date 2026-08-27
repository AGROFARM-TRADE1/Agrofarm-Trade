const isProd = process.env.NODE_ENV === "production";
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] || "agrofarm-trade";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isProd && process.env.GITHUB_ACTIONS ? `/${repo}` : "",
  assetPrefix: isProd && process.env.GITHUB_ACTIONS ? `/${repo}/` : ""
};

export default nextConfig;
