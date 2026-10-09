import { ArrowUpRight, Lock, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { HeroBackgroundForm } from './HeroBackgroundForm'
import { PageBackgroundForm } from './PageBackgroundForm'
import { CalendrierPasswordForm } from './CalendrierPasswordForm'
import { getHeroBackground, getPageBackground, getCalendrierPassword } from './actions'

export const metadata = {
  title: 'Paramètres - Admin',
  description: 'Gérer les paramètres du site',
}

/** Carte regroupant un ensemble de réglages */
function SettingsCard({
  icon: Icon,
  title,
  description,
  action,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 border-b px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
            <Icon className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-base font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </Card>
  )
}

export default async function ParametresPage() {
  const heroBackgroundSetting = await getHeroBackground()

  // Récupérer les backgrounds de toutes les pages
  const [partnersBackground, newsBackground, teamsBackground, contactBackground, calendrierPassword] = await Promise.all([
    getPageBackground('partenaires'),
    getPageBackground('actus'),
    getPageBackground('equipes'),
    getPageBackground('contact'),
    getCalendrierPassword(),
  ])

  return (
    <div>
      <AdminPageHeader title="Paramètres" description="Réglages généraux du site" />

      <div className="space-y-6">
        <SettingsCard
          icon={Lock}
          title="Espace bénévoles"
          description="Accès protégé au calendrier interactif où les bénévoles s'inscrivent aux matchs."
          action={
            <Button variant="outline" size="sm" asChild>
              <a href="/calendrier" target="_blank" rel="noopener noreferrer">
                Ouvrir le calendrier
                <ArrowUpRight />
              </a>
            </Button>
          }
        >
          <CalendrierPasswordForm initialPassword={calendrierPassword} />
        </SettingsCard>

        <SettingsCard
          icon={Palette}
          title="Apparence du site"
          description="Images de fond des en-têtes de pages. Privilégiez des photos d'au moins 1920 × 1080 px."
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <HeroBackgroundForm initialImage={heroBackgroundSetting?.value || ''} />

            <PageBackgroundForm
              page="partenaires"
              title="Partenaires"
              description="En-tête de la page Partenaires"
              initialImage={partnersBackground || ''}
            />

            <PageBackgroundForm
              page="actus"
              title="Actualités"
              description="En-tête de la page Actualités"
              initialImage={newsBackground || ''}
            />

            <PageBackgroundForm
              page="equipes"
              title="Équipes"
              description="En-tête de la page Équipes"
              initialImage={teamsBackground || ''}
            />

            <PageBackgroundForm
              page="contact"
              title="Contact"
              description="En-tête de la page Contact"
              initialImage={contactBackground || ''}
            />
          </div>
        </SettingsCard>
      </div>
    </div>
  )
}
