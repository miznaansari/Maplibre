/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,



  // ✅ ALLOW CLOUDFLARE R2 IMAGES
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-91cf5238058940aaa133997410eae1d2.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
