/** @type {import('next').NextConfig} */
const nextConfig = {
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

  // typedRoutes: true, // Temporairement désactivé jusqu'à ce que toutes les routes admin soient créées

  // Pour production
  output: 'standalone',

  // Désactiver strict mode en dev (pour éviter double render)
  reactStrictMode: process.env.NODE_ENV === 'production',
}

export default nextConfig
