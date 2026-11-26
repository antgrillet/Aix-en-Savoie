import { notFound } from 'next/navigation'
import { FileText, ImageIcon } from 'lucide-react'
import { PageHeader, Section } from '@/components/admin/PageHeader'
import { StatusMark } from '@/components/admin/StatusMark'
import { requireAdmin } from '@/lib/auth-utils'
import { getReglagesArbitrage } from '@/lib/arbitrage-reglages'
import {
  formatBareme,
  formatCentimes,
  formatDateMatch,
  formatTaille,
  formaterIban,
  fraisKilometriques,
  referenceNote,
  totalCentimes,
} from '@/lib/arbitrage'
import { getNote } from '../actions'
import { StatutNote } from '../StatutNote'
import { NoteActions } from './NoteActions'
import { ValidationForm } from './ValidationForm'

export const metadata = { title: 'Note d’arbitrage - Admin' }

/** Marge du corps des panneaux, alignée sur leur en-tête */
const CORPS = 'px-[1.125rem] pb-2'

const formatHorodatage = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  dateStyle: 'long',
  timeStyle: 'short',
})

function Ligne({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-0.5 border-b border-border py-2.5 last:border-b-0 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
      <dt className="adm-meta">{label}</dt>
      <dd className="min-w-0 break-words font-medium">{children}</dd>
    </div>
  )
}

export default async function NoteArbitragePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  const { id } = await params
  const note = await getNote(Number(id))
  if (!note) notFound()

  const reglages = await getReglagesArbitrage()
  const reference = referenceNote(note)
  const total = totalCentimes(note)
  const arbitre = `${note.prenom} ${note.nom}`
  const sansTicket = note.fraisAnnexesCentimes > 0 && note.justificatifs.length === 0

  return (
    <div>
      <PageHeader
        title={`Note de ${arbitre}`}
        description={`${reference} · déposée le ${formatHorodatage.format(note.createdAt)}`}
        back={{ href: '/admin/arbitrage', label: 'Arbitrage' }}
        actions={
          <NoteActions
            id={note.id}
            statut={note.statut}
            arbitre={arbitre}
            envoiAFaire={note.statut === 'VALIDEE' && !note.envoiComptableLe}
          />
        }
      />

      <p className="mb-5 flex flex-wrap items-center gap-2">
        <StatutNote statut={note.statut} envoiComptableLe={note.envoiComptableLe} envoiComptableErreur={note.envoiComptableErreur} />
        {note.statut === 'VALIDEE' && note.envoiComptableLe && (
          <span className="adm-meta">
            Envoyée le {formatHorodatage.format(note.envoiComptableLe)} à {note.envoiComptableA}
          </span>
        )}
        {note.statut === 'VALIDEE' && !note.envoiComptableLe && note.envoiComptableErreur && (
          <span className="adm-meta">Dernière erreur : {note.envoiComptableErreur}</span>
        )}
      </p>

      <div className="grid gap-x-10 gap-y-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="min-w-0 space-y-8">
          <Section title="Rencontre" bodyClassName={CORPS}>
            <dl>
              <Ligne label="Date">
                {formatDateMatch(note.dateMatch)} à {note.heureMatch.replace(':', 'h')}
              </Ligne>
              <Ligne label="Catégorie">{note.categorie}</Ligne>
              <Ligne label="Match">
                {note.equipeLocale} – {note.equipeVisiteur}
              </Ligne>
              <Ligne label="Gymnase">{note.salle}</Ligne>
            </dl>
          </Section>

          <Section title="Arbitre" bodyClassName={CORPS}>
            <dl>
              <Ligne label="Nom">{arbitre}</Ligne>
              <Ligne label="Licence FFHandball">{note.licence}</Ligne>
              <Ligne label="Adresse">{note.adresse}</Ligne>
              <Ligne label="Téléphone">
                <a href={`tel:${note.telephone.replace(/[^\d+]/g, '')}`} className="adm-link">
                  {note.telephone}
                </a>
              </Ligne>
              <Ligne label="E-mail">
                <a href={`mailto:${note.email}`} className="adm-link break-all">
                  {note.email}
                </a>
              </Ligne>
            </dl>
          </Section>

          <Section title="Coordonnées bancaires" bodyClassName={CORPS}>
            {note.iban ? (
              <dl>
                <Ligne label="Titulaire">{note.titulaireCompte || arbitre}</Ligne>
                <Ligne label="IBAN">
                  <span className="font-mono">{formaterIban(note.iban)}</span>
                </Ligne>
                <Ligne label="BIC">{note.bic ? <span className="font-mono">{note.bic}</span> : 'Non renseigné'}</Ligne>
              </dl>
            ) : (
              <p className="adm-meta py-1">Pas de RIB fourni : l&apos;arbitre indique que le club a déjà le sien.</p>
            )}
          </Section>

          <Section title="Frais" count={note.statut === 'EN_ATTENTE' ? 'demandés par l’arbitre' : 'retenus'} bodyClassName={CORPS}>
            <dl>
              <Ligne label="Indemnité">{formatCentimes(note.indemniteCentimes)}</Ligne>
              <Ligne label="Déplacement">
                {note.kilometres} km × {formatBareme(note.baremeKmCentimes)} = {formatCentimes(fraisKilometriques(note))}
              </Ligne>
              <Ligne label="Péage, parking">{formatCentimes(note.fraisAnnexesCentimes)}</Ligne>
              <Ligne label="Total">
                <span className="adm-num-md">{formatCentimes(total)}</span>
                {total !== note.totalDemandeCentimes && (
                  <span className="adm-meta block font-normal">
                    Demandé par l&apos;arbitre : {formatCentimes(note.totalDemandeCentimes)}
                  </span>
                )}
              </Ligne>
            </dl>
          </Section>

          <Section title="Justificatifs" count={note.justificatifs.length} bodyClassName={CORPS}>
            {note.justificatifs.length === 0 ? (
              <p className="flex flex-wrap items-center gap-2 py-1">
                {sansTicket ? (
                  <StatusMark tone="warn">Aucun ticket pour {formatCentimes(note.fraisAnnexesCentimes)} de péage ou parking</StatusMark>
                ) : (
                  <span className="adm-meta">Aucun justificatif joint.</span>
                )}
              </p>
            ) : (
              <ul className="adm-rows">
                {note.justificatifs.map((j) => (
                  <li key={j.id} className="flex items-center gap-3 py-2.5">
                    {j.type === 'application/pdf' ? (
                      <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    ) : (
                      <ImageIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    )}
                    <a
                      href={`/api/admin/arbitrage/justificatifs/${j.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="adm-link min-w-0 flex-1 truncate"
                    >
                      {j.nom}
                    </a>
                    <span className="adm-meta shrink-0">{formatTaille(j.taille)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <div className="min-w-0">
          {note.statut === 'EN_ATTENTE' && (
            <ValidationForm
              id={note.id}
              emailComptable={reglages.emailComptable}
              validateurParDefaut={session.user.name || ''}
              frais={{
                indemniteCentimes: note.indemniteCentimes,
                kilometres: note.kilometres,
                baremeKmCentimes: note.baremeKmCentimes,
                fraisAnnexesCentimes: note.fraisAnnexesCentimes,
              }}
              totalDemandeCentimes={note.totalDemandeCentimes}
            />
          )}

          {note.statut === 'VALIDEE' && (
            <Section title="Validation du bureau" bodyClassName={CORPS}>
              <dl>
                <Ligne label="Validée par">{note.traiteePar}</Ligne>
                <Ligne label="Le">{note.traiteeLe ? formatHorodatage.format(note.traiteeLe) : '—'}</Ligne>
                {note.commentaire && <Ligne label="Observation">{note.commentaire}</Ligne>}
              </dl>
              {note.signature && (
                // eslint-disable-next-line @next/next/no-img-element -- data URL, rien à optimiser
                <img
                  src={note.signature}
                  alt={`Signature de ${note.traiteePar ?? 'validateur'}`}
                  className="mt-3 aspect-[3/1] w-full max-w-sm rounded-lg border border-border bg-background object-contain"
                />
              )}
            </Section>
          )}

          {note.statut === 'REFUSEE' && (
            <Section title="Refus" bodyClassName={CORPS}>
              <dl>
                <Ligne label="Refusée par">{note.traiteePar}</Ligne>
                <Ligne label="Le">{note.traiteeLe ? formatHorodatage.format(note.traiteeLe) : '—'}</Ligne>
                <Ligne label="Motif">{note.motifRefus}</Ligne>
              </dl>
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}
