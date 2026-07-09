import type { NextConfig } from "next";

// M14: restrict the image optimizer to known CDN/upload hosts so it isn't an open image
// proxy (SSRF-lite + bandwidth cost). Set NEXT_PUBLIC_IMAGE_HOSTNAMES (comma-separated)
// to your CDN host(s) in prod; defaults to the R2 public CDN.
const imageHostnames = (process.env.NEXT_PUBLIC_IMAGE_HOSTNAMES ?? "cdn.sovarest.com,pub-181901bfac0342f0b9a4d3476d6c8df0.r2.dev,loremflickr.com")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: imageHostnames.map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
  },
};

export default nextConfig;
