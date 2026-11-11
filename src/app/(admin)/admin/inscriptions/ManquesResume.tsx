import { DataList, type DataColumn } from '@/components/admin/DataList'
import { EmptyState } from '@/components/admin/EmptyState'
import { Section } from '@/components/admin/PageHeader'
import { StatusMark } from '@/components/admin/StatusMark'
import type { getInscriptionsStats } from './actions'
import { formatHeure, formatJour, pluriel } from './format'

type MatchAvecManques = Awaited<ReturnType<typeof getInscriptionsStats>>[number]

export interface WeekendManques {
  cle: string
  /** « Cette semaine », « Week-end du 27 au 29 novembre » */
  titre: string
  /** Dates du week-end, quand le titre ne les donne pas */
  periode?: string
  /** Matchs à domicile auxquels il manque au moins un bénévole */
  matchs: MatchAvecManques[]
  /** Bénévoles déjà inscrits sur ce week-end, tous matchs confondus */
  inscrits: number
}

interface ManquesResumeProps {
  weekends: WeekendManques[]
}

interface PostesProps {
  /** Nom du poste, affiché sur téléphone (l'en-tête de colonne le dit ailleurs) */
  libelle: string
  /** Bénévoles inscrits à ce poste */
  inscrits: string[]
  /** Postes attendus qui restent à pourvoir */
  manque?: number
  /** Poste sans effectif attendu : vide, il ne manque à personne */
  facultatif?: boolean
}

/**
 * Les postes d'un match pour un rôle. Pourvu : trait plein, au nom du
 * bénévole. Libre : pointillé, qui se referme en trait plein à l'inscription.
 */
function Postes({ libelle, inscrits, manque = 0, facultatif }: PostesProps) {
  return (
    <span className="flex w-full items-start gap-3 md:w-auto">
      <span className="adm-meta w-[7.5rem] shrink-0 pt-0.5 md:hidden">{libelle}</span>
      <span className="flex min-w-0 flex-wrap items-center gap-1.5">
        {inscrits.map((nom, index) => (
          <StatusMark key={`${nom}-${index}`} tone="solid">
            {nom}
          </StatusMark>
        ))}
        {manque > 0 && <StatusMark tone="dashed">{manque} à pourvoir</StatusMark>}
        {facultatif && inscrits.length === 0 && <StatusMark tone="dashed">Facultatif</StatusMark>}
      </span>
    </span>
  )
}

const columns: DataColumn<MatchAvecManques>[] = [
  {
    id: 'date',
    header: 'Date',
    className: 'hidden w-24 whitespace-nowrap xl:table-cell',
    phone: 'hidden',
    cell: (match) => (
      <>
        <span className="block text-[0.8125rem] font-semibold">{formatJour(match.date)}</span>
        <span className="adm-meta block">{formatHeure(match.date)}</span>
      </>
    ),
  },
  {
    id: 'match',
    header: 'Match',
    phone: 'title',
    cell: (match) => (
      <>
        <span className="block font-semibold leading-snug">
          {match.equipe.nom} – {match.adversaire}
        </span>
        <span className="adm-meta block font-normal">
          <span className="xl:hidden">
            {formatJour(match.date)} · {formatHeure(match.date)} ·{' '}
          </span>
          {match.equipe.categorie}
        </span>
      </>
    ),
  },
  {
    id: 'table',
    header: 'Table de marque',
    // Même largeur d'une semaine à l'autre : les colonnes restent alignées
    className: 'w-[17%]',
    phone: 'marks',
    cell: (match) => (
      <Postes
        libelle="Table de marque"
        inscrits={match.inscritsParRole.tableDeMarque}
        manque={match.manques.tableDeMarque}
      />
    ),
  },
  {
    id: 'arbitres',
    header: 'Arbitres',
    className: 'w-[17%]',
    phone: 'marks',
    cell: (match) => (
      <Postes
        libelle="Arbitres"
        inscrits={match.inscritsParRole.arbitre}
        manque={match.manques.arbitre}
      />
    ),
  },
  {
    id: 'salle',
    header: 'Responsable de salle',
    className: 'w-[18%]',
    phone: 'marks',
    cell: (match) => (
      <Postes
        libelle="Resp. de salle"
        inscrits={match.inscritsParRole.responsableSalle}
        manque={match.manques.responsableSalle}
      />
    ),
  },
  {
    id: 'buvette',
    header: 'Buvette',
    className: 'w-[13%]',
    phone: 'marks',
    cell: (match) => (
      <Postes libelle="Buvette" inscrits={match.inscritsParRole.buvette} facultatif />
    ),
  },
]

/**
 * Les postes de bénévoles qui restent à pourvoir, semaine par semaine. Le
 * grand chiffre orange est réservé au week-end le plus proche, celui qui
 * presse ; les suivants s'annoncent en noir. Chaque match détaille ses postes.
 */
export function ManquesResume({ weekends }: ManquesResumeProps) {
  if (weekends.length === 0) {
    return (
      <EmptyState title="Aucun poste à pourvoir">
        <p>
          Aucun match à domicile à venir ne manque de bénévoles. Dès qu'un match publié n'a pas ses
          deux personnes à la table de marque, ses deux arbitres et son responsable de salle, il
          apparaît ici.
        </p>
      </EmptyState>
    )
  }

  return (
    <>
      <p className="adm-meta max-w-[75ch]">
        Chaque match à domicile attend deux personnes à la table de marque, deux arbitres et un
        responsable de salle. La buvette est facultative.
      </p>

      {weekends.map((weekend, index) => {
        const postes = weekend.matchs.reduce((somme, match) => somme + match.totalManques, 0)

        return (
          <Section
            key={weekend.cle}
            title={weekend.titre}
            action={weekend.periode && <span className="adm-meta">{weekend.periode}</span>}
            className="mt-8"
          >
            <p className="flex items-center gap-4 py-3 sm:gap-6">
              <span
                className={
                  index === 0
                    ? 'adm-num-lg w-14 shrink-0 text-primary sm:w-16'
                    : 'adm-num-md w-14 shrink-0 sm:w-16'
                }
              >
                {postes}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold leading-snug">
                  {pluriel(postes, 'poste à pourvoir', 'postes à pourvoir')}
                </span>
                <span className="adm-meta block">
                  Sur {weekend.matchs.length}{' '}
                  {pluriel(weekend.matchs.length, 'match', 'matchs')} à domicile.{' '}
                  {weekend.inscrits === 0
                    ? 'Aucun bénévole inscrit pour l’instant.'
                    : `${weekend.inscrits} ${pluriel(weekend.inscrits, 'bénévole déjà inscrit', 'bénévoles déjà inscrits')}.`}
                </span>
              </span>
            </p>

            <DataList
              caption={`Postes à pourvoir, ${weekend.titre.toLowerCase()}`}
              items={weekend.matchs}
              columns={columns}
              getKey={(match) => match.id}
            />
          </Section>
        )
      })}
    </>
  )
}
