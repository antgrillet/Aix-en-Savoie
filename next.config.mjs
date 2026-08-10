/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prisma must stay external + traced: with pnpm the generated client lives
  // under .pnpm/@prisma+client@..., and Turbopack often omits it from lambdas.
  serverExternalPackages: ['@prisma/client', 'prisma'],
  outputFileTracingIncludes: {
    '/*': [
      './node_modules/.prisma/**/*',
      './node_modules/@prisma/client/**/*',
      './node_modules/.pnpm/@prisma+client@*/node_modules/@prisma/client/**/*',
      './node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/**/*',
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
