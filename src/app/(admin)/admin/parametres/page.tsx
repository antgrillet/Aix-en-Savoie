import { Settings } from 'lucide-react'
import { HeroBackgroundForm } from './HeroBackgroundForm'
import { PageBackgroundForm } from './PageBackgroundForm'
import { CalendrierPasswordForm } from './CalendrierPasswordForm'
import { getHeroBackground, getPageBackground, getCalendrierPassword } from './actions'
import { Separator } from '@/components/ui/separator'

export const metadata = {
  title: 'Paramètres - Admin',
  description: 'Gérer les paramètres du site',
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500">
          <Settings className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
            Paramètres
          </h1>
          <p className="text-muted-foreground">
            Gérez les paramètres généraux du site
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
            Calendrier Interactif
          </h2>
          <p className="text-muted-foreground mb-6">
            Configurez le mot de passe pour accéder au calendrier des matchs
          </p>
          <CalendrierPasswordForm initialPassword={calendrierPassword} />
        </div>

        <Separator />

        <div>
          <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
            Images de fond
          </h2>
          <p className="text-muted-foreground mb-6">
            Gérez les images de fond affichées sur les différentes pages du site
          </p>

          <div className="space-y-6">
            <HeroBackgroundForm initialImage={heroBackgroundSetting?.value || ''} />

            <Separator />

            <PageBackgroundForm
              page="partenaires"
              title="Page Partenaires"
              description="Image de fond affichée sur la page partenaires"
              initialImage={partnersBackground || ''}
            />

            <Separator />

            <PageBackgroundForm
              page="actus"
              title="Page Actualités"
              description="Image de fond affichée sur la page actualités"
              initialImage={newsBackground || ''}
            />

            <Separator />

            <PageBackgroundForm
              page="equipes"
              title="Page Équipes"
              description="Image de fond affichée sur la page équipes"
              initialImage={teamsBackground || ''}
            />

            <Separator />

            <PageBackgroundForm
              page="contact"
              title="Page Contact"
              description="Image de fond affichée sur la page contact"
              initialImage={contactBackground || ''}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
