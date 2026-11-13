import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

/**
 * Session de l'espace bénévoles : un cookie httpOnly signé, posé quand le mot de
 * passe partagé est bon. Les routes `/api/calendrier/*` le vérifient ; sans lui,
 * elles répondent 401.
 */
export const BENEVOLE_COOKIE = 'hbca_benevole'
const DUREE_SECONDES = 60 * 60 * 12

function secret(): string | null {
  return process.env.BETTER_AUTH_SECRET || null
}

function signer(expiration: number, cle: string): string {
  return createHmac('sha256', cle)
    .update(`calendrier-benevoles:${expiration}`)
    .digest('base64url')
}

export function creerJetonBenevole(): string {
  const cle = secret()
  if (!cle) throw new Error('BETTER_AUTH_SECRET manquant')
  const expiration = Math.floor(Date.now() / 1000) + DUREE_SECONDES
  return `${expiration}.${signer(expiration, cle)}`
}

export function jetonBenevoleValide(jeton: string | undefined): boolean {
  const cle = secret()
  if (!cle || !jeton) return false

  const [expirationTexte, signature] = jeton.split('.')
  const expiration = Number(expirationTexte)
  if (!signature || !Number.isInteger(expiration)) return false
  if (expiration < Math.floor(Date.now() / 1000)) return false

  const attendue = Buffer.from(signer(expiration, cle))
  const recue = Buffer.from(signature)
  return attendue.length === recue.length && timingSafeEqual(attendue, recue)
}

export async function sessionBenevoleActive(): Promise<boolean> {
  const cookieStore = await cookies()
  return jetonBenevoleValide(cookieStore.get(BENEVOLE_COOKIE)?.value)
}

export async function ouvrirSessionBenevole(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(BENEVOLE_COOKIE, creerJetonBenevole(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: DUREE_SECONDES,
  })
}

export async function fermerSessionBenevole(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(BENEVOLE_COOKIE)
}
