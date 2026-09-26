import type { NextConfig } from "next";

// Uploaded media is served from Supabase Storage's public buckets; allow
// next/image to optimise those (and only those) remote images.
const supabaseHost = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : undefined;

const nextConfig: NextConfig = {
  // Share images read these at request time. On Vercel, functions only get
  // files the build traced, and /public is served by the CDN rather than
  // bundled, so include them explicitly.
  outputFileTracingIncludes: {
    "/archive/**": ["./public/images/**/*", "./assets/fonts/**/*"],
  },
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
};

export default nextConfig;
