import Link from 'next/link'
import { DataList, type DataColumn } from '@/components/admin/DataList'
import { EmptyState } from '@/components/admin/EmptyState'
import { formatCentimes, formatDateMatch, referenceNote, totalCentimes } from '@/lib/arbitrage'
import type { NoteListe } from './actions'
import { StatutNote } from './StatutNote'

const formatReception = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  day: 'numeric',
  month: 'short',
})

const colonnes: DataColumn<NoteListe>[] = [
  {
    id: 'arbitre',
    header: 'Arbitre',
    phone: 'title',
    cell: (n) => (
      <Link href={`/admin/arbitrage/${n.id}`} className="adm-row-link font-semibold hover:underline">
        {n.prenom} {n.nom}
      </Link>
    ),
  },
  {
    id: 'match',
    header: 'Match',
    cell: (n) => (
      <span>
        {formatDateMatch(n.dateMatch, true)} · {n.categorie}
        <span className="block text-muted-foreground">
          {n.equipeLocale} – {n.equipeVisiteur}
        </span>
      </span>
    ),
  },
  {
    id: 'statut',
    header: 'État',
    phone: 'marks',
    cell: (n) => (
      <StatutNote statut={n.statut} envoiComptableLe={n.envoiComptableLe} envoiComptableErreur={n.envoiComptableErreur} />
    ),
  },
  {
    id: 'recue',
    header: 'Reçue',
    className: 'hidden lg:table-cell',
    cell: (n) => (
      <span>
        {formatReception.format(n.createdAt)}
        <span className="block text-muted-foreground">{referenceNote(n)}</span>
      </span>
    ),
  },
  {
    id: 'total',
    header: 'Total',
    align: 'end',
    cell: (n) => <span className="adm-num-sm">{formatCentimes(totalCentimes(n))}</span>,
  },
]

export function NotesList({ notes, vide }: { notes: NoteListe[]; vide: string }) {
  return (
    <DataList
      caption="Notes d'arbitrage"
      items={notes}
      columns={colonnes}
      getKey={(n) => n.id}
      empty={
        <EmptyState title={vide}>
          <p>
            Les arbitres déposent leurs notes sur la page{' '}
            <a href="/arbitrage" target="_blank" rel="noreferrer" className="adm-link">
              Espace arbitres
            </a>{' '}
            du site. Le lien se copie dans Paramètres.
          </p>
        </EmptyState>
      }
    />
  )
}
