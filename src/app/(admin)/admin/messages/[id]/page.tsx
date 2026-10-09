import { notFound } from 'next/navigation'
import { Calendar, Mail, Phone, Reply, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { formatParis } from '@/lib/match-format'
import { getMessage } from '../actions'

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-3.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="break-words text-sm font-medium">{children}</div>
      </div>
    </div>
  )
}

export default async function MessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const message = await getMessage(parseInt(id))

  if (!message) {
    notFound()
  }

  const nomComplet = `${message.prenom} ${message.nom}`
  const recuLe = formatParis(message.createdAt, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div>
      <AdminPageHeader
        title={nomComplet}
        description={`Message reçu le ${recuLe}`}
        backHref="/admin/messages"
        backLabel="Messages"
        actions={
          <>
            {message.telephone && (
              <Button variant="outline" asChild>
                <a href={`tel:${message.telephone}`}>
                  <Phone />
                  Appeler
                </a>
              </Button>
            )}
            <Button asChild>
              <a href={`mailto:${message.email}`}>
                <Reply />
                Répondre
              </a>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <Card className="overflow-hidden lg:col-span-2">
          {/* En-tête du message */}
          <div className="flex items-start gap-3 border-b px-5 py-4 sm:px-6">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-50 font-display text-sm font-bold uppercase text-primary-800">
              {message.prenom.charAt(0)}
              {message.nom.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{nomComplet}</p>
              <p className="truncate text-sm text-muted-foreground">{message.email}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <time dateTime={new Date(message.createdAt).toISOString()} className="text-xs text-muted-foreground">
                {formatParis(message.createdAt, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </time>
              <div className="flex flex-wrap justify-end gap-1.5">
                {!message.read && <StatusBadge status="unread" />}
                {message.archived && <StatusBadge status="archived" />}
              </div>
            </div>
          </div>

          {/* Corps du message */}
          <div className="px-5 py-6 sm:px-8 sm:py-8">
            {message.experience && (
              <p className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-800 ring-1 ring-inset ring-primary-600/25">
                <span aria-hidden className="size-1.5 rounded-full bg-primary-500" />
                Souhaite rejoindre le club
              </p>
            )}
            <p className="max-w-prose whitespace-pre-wrap break-words text-[0.95rem] leading-7 text-foreground">
              {message.message}
            </p>
          </div>

          {message.experience && (
            <div className="border-t bg-muted/30 px-5 py-5 sm:px-8">
              <h2 className="font-display text-sm font-semibold">Informations handball</h2>
              <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                {message.niveau && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Niveau</dt>
                    <dd className="mt-0.5 text-sm font-medium capitalize">{message.niveau}</dd>
                  </div>
                )}

                {message.positions && message.positions.length > 0 && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Postes</dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">
                      {message.positions.map((pos) => (
                        <span
                          key={pos}
                          className="rounded-full bg-card px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-border"
                        >
                          {pos}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </Card>

        <Card className="h-fit overflow-hidden">
          <div className="border-b px-5 py-4">
            <h2 className="font-display text-base font-semibold">Expéditeur</h2>
          </div>
          <div className="divide-y">
            <InfoRow icon={User} label="Nom">
              {nomComplet}
            </InfoRow>
            <InfoRow icon={Mail} label="Email">
              <a
                href={`mailto:${message.email}`}
                className="rounded-sm text-primary-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {message.email}
              </a>
            </InfoRow>
            {message.telephone && (
              <InfoRow icon={Phone} label="Téléphone">
                <a
                  href={`tel:${message.telephone}`}
                  className="rounded-sm text-primary-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {message.telephone}
                </a>
              </InfoRow>
            )}
            <InfoRow icon={Calendar} label="Date de réception">
              {formatParis(message.createdAt, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </InfoRow>
          </div>
        </Card>
      </div>
    </div>
  )
}
