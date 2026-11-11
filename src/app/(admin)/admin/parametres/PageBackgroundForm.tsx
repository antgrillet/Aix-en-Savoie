'use client'

import { BackgroundSetting } from './BackgroundSetting'
import { updatePageBackground, removePageBackground } from './actions'

interface PageBackgroundFormProps {
  page: string
  title: string
  description: string
  initialImage?: string
}

/** Image de fond d'une page du site (partenaires, actus, équipes, contact) */
export function PageBackgroundForm({ page, title, description, initialImage = '' }: PageBackgroundFormProps) {
  return (
    <BackgroundSetting
      id={`fond-${page}`}
      title={title}
      description={description}
      fallback="La page retrouvera le fond sombre par défaut."
      initialImage={initialImage}
      onSave={async (url) => {
        const formData = new FormData()
        formData.set('page', page)
        formData.set('backgroundImage', url)
        await updatePageBackground(formData)
      }}
      onRemove={() => removePageBackground(page)}
    />
  )
}
