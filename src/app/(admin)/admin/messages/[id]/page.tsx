import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowLeft, Mail, Phone, Calendar, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getMessage } from '../actions'

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/messages">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Message de contact</h1>
          <p className="text-muted-foreground">
            Reçu le {format(new Date(message.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              {!message.read && <Badge variant="destructive">Non lu</Badge>}
              {message.archived && <Badge variant="secondary">Archivé</Badge>}
              {message.experience && <Badge>Souhaite rejoindre le club</Badge>}
            </div>

            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{message.message}</p>
            </div>

            {message.experience && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold">Informations handball</h3>

                  {message.niveau && (
                    <div>
                      <p className="text-sm text-muted-foreground">Niveau</p>
                      <p className="font-medium capitalize">{message.niveau}</p>
                    </div>
                  )}

                  {message.positions && message.positions.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Positions</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {message.positions.map((pos) => (
                          <Badge key={pos} variant="outline">
                            {pos}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations de contact</CardTitle>
            <CardDescription>Détails de l'expéditeur</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Nom</p>
                <p className="font-medium">
                  {message.prenom} {message.nom}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a
                  href={`mailto:${message.email}`}
                  className="font-medium text-primary hover:underline"
                >
                  {message.email}
                </a>
              </div>
            </div>

            {message.telephone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <a
                    href={`tel:${message.telephone}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {message.telephone}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Date de réception</p>
                <p className="font-medium">
                  {format(new Date(message.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
