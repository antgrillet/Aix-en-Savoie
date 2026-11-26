import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sessionAdmin } from '@/lib/auth-utils'
import { genererPdfNote } from '@/lib/arbitrage-pdf'
import { referenceNote } from '@/lib/arbitrage'

export const dynamic = 'force-dynamic'

/** Le PDF « bon à payer » d'une note validée, régénéré à la demande. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await sessionAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const id = Number((await params).id)
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'Note introuvable' }, { status: 404 })

  const note = await prisma.noteArbitrage.findUnique({
    where: { id },
    include: { justificatifs: { orderBy: { id: 'asc' }, select: { nom: true, taille: true } } },
  })
  if (!note) return NextResponse.json({ error: 'Note introuvable' }, { status: 404 })
  if (note.statut !== 'VALIDEE') {
    return NextResponse.json({ error: 'Le PDF existe une fois la note validée.' }, { status: 409 })
  }

  const pdf = await genererPdfNote(note)
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="Note-arbitrage-${referenceNote(note)}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
