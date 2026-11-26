import { StatusMark } from '@/components/admin/StatusMark'
import { LIBELLES_STATUT } from '@/lib/arbitrage'
import type { StatutNoteArbitrage } from '@/generated/prisma/client'

/** L'état d'une note, puis celui de son envoi au comptable. */
export function StatutNote({
  statut,
  envoiComptableLe,
  envoiComptableErreur,
}: {
  statut: StatutNoteArbitrage
  envoiComptableLe: Date | null
  envoiComptableErreur: string | null
}) {
  if (statut === 'EN_ATTENTE') return <StatusMark tone="action">{LIBELLES_STATUT.EN_ATTENTE}</StatusMark>
  if (statut === 'REFUSEE') return <StatusMark tone="neutral">{LIBELLES_STATUT.REFUSEE}</StatusMark>
  if (!envoiComptableLe) {
    return <StatusMark tone="bad">{envoiComptableErreur ? 'Envoi au comptable échoué' : 'Pas encore envoyée'}</StatusMark>
  }
  return <StatusMark tone="ok">Validée · envoyée</StatusMark>
}
