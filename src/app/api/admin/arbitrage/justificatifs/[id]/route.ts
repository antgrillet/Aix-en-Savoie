import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sessionAdmin } from '@/lib/auth-utils'
import { TYPES_JUSTIFICATIF } from '@/lib/arbitrage'

export const dynamic = 'force-dynamic'

/** Un justificatif, réservé au bureau. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await sessionAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const id = Number((await params).id)
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'Justificatif introuvable' }, { status: 404 })

  const justificatif = await prisma.justificatifArbitrage.findUnique({ where: { id } })
  if (!justificatif) return NextResponse.json({ error: 'Justificatif introuvable' }, { status: 404 })

  // Le type a été vérifié au dépôt ; on ne sert jamais autre chose que ces formats.
  const type = (TYPES_JUSTIFICATIF as readonly string[]).includes(justificatif.type)
    ? justificatif.type
    : 'application/octet-stream'

  return new NextResponse(Buffer.from(justificatif.contenu), {
    headers: {
      'Content-Type': type,
      'Content-Disposition': `inline; filename="${justificatif.nom.replace(/[^A-Za-z0-9._-]/g, '_')}"`,
      // Chrome refuse d'afficher un PDF dans un contexte « sandbox » : la règle ne vaut que pour les images.
      ...(type.startsWith('image/')
        ? { 'Content-Security-Policy': "sandbox; default-src 'none'; img-src 'self'; style-src 'unsafe-inline'" }
        : {}),
      'Cache-Control': 'private, no-store',
    },
  })
}
