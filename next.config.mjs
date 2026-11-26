/** @type {import('next').NextConfig} */
const nextConfig = {
  // Le PDF des notes d'arbitrage lit le logo sur le disque du serveur
  outputFileTracingIncludes: {
    '/admin/arbitrage/**': ['./public/img/home/logo.png'],
    '/api/admin/arbitrage/**': ['./public/img/home/logo.png'],
  },
  images: {
    // Only hosts the site actually serves images from: uploads and opponent logos.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'media-logos-clubs.ffhandball.fr',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    // L'espace bénévoles a été retiré du site (novembre 2026)
    return [{ source: '/calendrier', destination: '/', permanent: false }]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
