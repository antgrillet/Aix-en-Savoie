import { Settings } from 'lucide-react'
import { HeroBackgroundForm } from './HeroBackgroundForm'
import { PageBackgroundForm } from './PageBackgroundForm'
import { getHeroBackground, getPageBackground } from './actions'
import { Separator } from '@/components/ui/separator'

export const metadata = {
  title: 'Paramètres - Admin',
  description: 'Gérer les paramètres du site',
}

export default async function ParametresPage() {
  const heroBackgroundSetting = await getHeroBackground()

  // Récupérer les backgrounds de toutes les pages
  const [partnersBackground, newsBackground, teamsBackground, contactBackground] = await Promise.all([
    getPageBackground('partenaires'),
    getPageBackground('actus'),
    getPageBackground('equipes'),
    getPageBackground('contact'),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">
            Gérez les paramètres généraux du site
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Images de fond</h2>
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
