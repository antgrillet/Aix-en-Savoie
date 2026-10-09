'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { BackgroundTile } from './BackgroundTile'
import { updateHeroBackground, removeHeroBackground } from './actions'

interface HeroBackgroundFormProps {
  initialImage?: string
}

export function HeroBackgroundForm({ initialImage = '' }: HeroBackgroundFormProps) {
  const [heroBackgroundImage, setHeroBackgroundImage] = useState(initialImage)
  const [savedImage, setSavedImage] = useState(initialImage)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!heroBackgroundImage) {
      toast.error('Veuillez ajouter une image de fond')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.set('heroBackgroundImage', heroBackgroundImage)

      await updateHeroBackground(formData)

      setSavedImage(heroBackgroundImage)
      toast.success('Image de fond mise à jour avec succès')
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error('Erreur lors de la mise à jour de l\'image de fond')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Confirmation via la boîte de dialogue de la vignette
  const handleRemove = async () => {
    setIsRemoving(true)

    try {
      await removeHeroBackground()
      setHeroBackgroundImage('')
      setSavedImage('')
      setConfirmOpen(false)
      toast.success('Image de fond supprimée avec succès')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression de l\'image de fond')
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <BackgroundTile
      title="Accueil"
      description="Grande image en haut de la page d'accueil"
      image={heroBackgroundImage}
      savedImage={savedImage}
      onImageChange={setHeroBackgroundImage}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isRemoving={isRemoving}
      confirmOpen={confirmOpen}
      onConfirmOpenChange={setConfirmOpen}
      onConfirmRemove={handleRemove}
    />
  )
}
