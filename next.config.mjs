/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@prisma/client"],
  poweredByHeader: false,
};

export default nextConfig;