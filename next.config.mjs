/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prisma must stay external + traced into serverless functions.
  serverExternalPackages: ['@prisma/client', 'prisma'],
  outputFileTracingIncludes: {
    '/*': [
      './node_modules/.prisma/**/*',
      './node_modules/@prisma/client/**/*',
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
