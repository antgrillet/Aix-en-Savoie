'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { BackgroundTile } from './BackgroundTile'
import { updatePageBackground, removePageBackground } from './actions'

interface PageBackgroundFormProps {
  page: string
  title: string
  description: string
  initialImage?: string
}

export function PageBackgroundForm({ page, title, description, initialImage = '' }: PageBackgroundFormProps) {
  const [backgroundImage, setBackgroundImage] = useState(initialImage)
  const [savedImage, setSavedImage] = useState(initialImage)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!backgroundImage) {
      toast.error('Veuillez ajouter une image de fond')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.set('page', page)
      formData.set('backgroundImage', backgroundImage)

      await updatePageBackground(formData)

      setSavedImage(backgroundImage)
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
      await removePageBackground(page)
      setBackgroundImage('')
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
      title={title}
      description={description}
      image={backgroundImage}
      savedImage={savedImage}
      onImageChange={setBackgroundImage}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isRemoving={isRemoving}
      confirmOpen={confirmOpen}
      onConfirmOpenChange={setConfirmOpen}
      onConfirmRemove={handleRemove}
    />
  )
}
