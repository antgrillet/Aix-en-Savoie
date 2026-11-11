import { PageHeader, Section } from '@/components/admin/PageHeader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { StatusMark } from '@/components/admin/StatusMark'
import { Tag } from '@/components/admin/Tag'
import type { ContactMessage } from '@/generated/prisma/client'
import { MessageActions } from './MessageActions'

const formatReception = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  dateStyle: 'long',
  timeStyle: 'short',
})

function Coordonnee({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border py-3">
      <dt className="adm-meta">{label}</dt>
      <dd className="mt-0.5 font-medium">{children}</dd>
    </div>
  )
}

/**
 * Page d'un message : le texte à une mesure de lecture, les coordonnées de
 * l'expéditeur à côté. La page (`[id]/page.tsx`) fait la lecture, cette vue ne
 * fait qu'afficher.
 */
export function MessageView({ message }: { message: ContactMessage }) {
  const hasMarks = message.archived || message.experience

  return (
    <div>
      <PageHeader
        title={`Message de ${message.prenom} ${message.nom}`}
        description={`Reçu le ${formatReception.format(new Date(message.createdAt))}`}
        back={{ href: '/admin/messages', label: 'Messages' }}
        actions={
          <MessageActions id={message.id} archived={message.archived} email={message.email} />
        }
      />

      <div className="grid gap-x-16 gap-y-10 xl:grid-cols-[minmax(0,58ch)_minmax(0,20rem)]">
        <article className="min-w-0 max-w-[58ch]">
          {hasMarks && (
            <p className="mb-4 flex flex-wrap items-center gap-1.5">
              {message.experience && <StatusMark tone="fill">Souhaite rejoindre une équipe</StatusMark>}
              {message.archived && <StatusBadge status="archived" />}
            </p>
          )}
          <p className="whitespace-pre-wrap break-words leading-[1.65]">{message.message}</p>
        </article>

        <div className="min-w-0 space-y-10">
          <Section title="Expéditeur">
            <dl>
              <Coordonnee label="Nom">
                {message.prenom} {message.nom}
              </Coordonnee>
              <Coordonnee label="Courriel">
                <a href={`mailto:${message.email}`} className="adm-link break-all">
                  {message.email}
                </a>
              </Coordonnee>
              <Coordonnee label="Téléphone">
                {message.telephone ? (
                  <a href={`tel:${message.telephone}`} className="adm-link">
                    {message.telephone}
                  </a>
                ) : (
                  <span className="font-normal text-muted-foreground">Non renseigné</span>
                )}
              </Coordonnee>
            </dl>
          </Section>

          {message.experience && (
            <Section title="Profil handball">
              <dl>
                <Coordonnee label="Niveau de pratique">
                  {message.niveau ? (
                    <span className="capitalize">{message.niveau}</span>
                  ) : (
                    <span className="font-normal text-muted-foreground">Non renseigné</span>
                  )}
                </Coordonnee>
                <Coordonnee label="Postes">
                  {message.positions && message.positions.length > 0 ? (
                    <span className="mt-1 flex flex-wrap gap-1.5">
                      {message.positions.map((position) => (
                        <Tag key={position}>{position}</Tag>
                      ))}
                    </span>
                  ) : (
                    <span className="font-normal text-muted-foreground">Non renseignés</span>
                  )}
                </Coordonnee>
              </dl>
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}
