import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-utils'
import { syncTeamMatches } from '@/lib/sync-matches'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Synchronise les matchs et le classement d'une équipe depuis FFHandball.
 * POST /api/admin/equipes/[id]/sync-matches
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin()

  const { id } = await params
  const equipeId = Number(id)
  if (!Number.isInteger(equipeId) || equipeId <= 0) {
    return NextResponse.json({ error: 'Identifiant d’équipe invalide' }, { status: 400 })
  }

  const equipe = await prisma.equipe.findUnique({
    where: { id: equipeId },
    select: { id: true, nom: true, categorie: true, slug: true, matches: true },
  })

  if (!equipe) {
    return NextResponse.json({ error: 'Équipe non trouvée' }, { status: 404 })
  }

  if (!equipe.matches?.trim()) {
    return NextResponse.json(
      { error: 'Aucun lien de championnat configuré pour cette équipe' },
      { status: 400 }
    )
  }

  const resultat = await syncTeamMatches(equipe.id, equipe.nom, equipe.matches, equipe.categorie)

  if (resultat.status === 'error') {
    return NextResponse.json(
      { error: 'Erreur lors de la synchronisation', message: resultat.message },
      { status: 502 }
    )
  }

  revalidatePath('/')
  revalidatePath('/calendrier')
  revalidatePath('/equipes')
  revalidatePath(`/equipes/${equipe.slug}`)

  return NextResponse.json({
    success: true,
    summary: {
      total: resultat.matchesCreated + resultat.matchesUpdated + resultat.matchesSkipped,
      created: resultat.matchesCreated,
      updated: resultat.matchesUpdated,
      skipped: resultat.matchesSkipped,
      classementUpdated: resultat.classementUpdated,
      orphelins: resultat.orphelins,
    },
    message: `Synchronisation terminée: ${resultat.message}`,
  })
}
