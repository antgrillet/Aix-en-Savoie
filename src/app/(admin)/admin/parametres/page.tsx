import { Settings } from 'lucide-react'
import { HeroBackgroundForm } from './HeroBackgroundForm'
import { getHeroBackground } from './actions'

export const metadata = {
  title: 'Paramètres - Admin',
  description: 'Gérer les paramètres du site',
}

export default async function ParametresPage() {
  const heroBackgroundSetting = await getHeroBackground()

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

      <div className="space-y-6">
        <HeroBackgroundForm initialImage={heroBackgroundSetting?.value || ''} />
      </div>
    </div>
  )
}
