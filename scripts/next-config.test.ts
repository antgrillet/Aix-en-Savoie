import { describe, expect, test } from 'bun:test'
import nextConfig from '../next.config.mjs'

describe('configuration Next.js', () => {
  const patterns = nextConfig.images?.remotePatterns ?? []
  const hotes = patterns.map(pattern => (pattern instanceof URL ? pattern.hostname : pattern.hostname))

  test("aucun hôte d'image ouvert à tous", () => {
    expect(hotes).not.toContain('**')
    expect(hotes.every(hote => !hote.startsWith('**'))).toBe(true)
  })

  test("les hôtes d'images du club restent autorisés en https", () => {
    expect(hotes).toContain('*.public.blob.vercel-storage.com')
    expect(hotes).toContain('media-logos-clubs.ffhandball.fr')
    for (const pattern of patterns) {
      expect(pattern instanceof URL ? pattern.protocol : pattern.protocol).toMatch(/^https:?$/)
    }
  })

  test('les en-têtes de sécurité couvrent toutes les routes', async () => {
    const regles = (await nextConfig.headers?.()) ?? []
    const toutes = regles.find(regle => regle.source === '/:path*')
    const entetes = Object.fromEntries((toutes?.headers ?? []).map(({ key, value }) => [key, value]))
    expect(entetes).toEqual({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Frame-Options': 'DENY',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    })
  })
})
