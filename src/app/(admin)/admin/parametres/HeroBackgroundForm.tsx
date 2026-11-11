'use client'

import { BackgroundSetting } from './BackgroundSetting'
import { updateHeroBackground, removeHeroBackground } from './actions'

interface HeroBackgroundFormProps {
  initialImage?: string
}

/** Image de fond du haut de la page d'accueil */
export function HeroBackgroundForm({ initialImage = '' }: HeroBackgroundFormProps) {
  return (
    <BackgroundSetting
      id="fond-accueil"
      title="Fond de l'accueil"
      description="La grande photo derrière le haut de la page d'accueil. Sans image, le site montre la photo d'équipe par défaut."
      fallback="L'accueil retrouvera la photo d'équipe par défaut."
      initialImage={initialImage}
      onSave={async (url) => {
        const formData = new FormData()
        formData.set('heroBackgroundImage', url)
        await updateHeroBackground(formData)
      }}
      onRemove={() => removeHeroBackground()}
    />
  )
}
