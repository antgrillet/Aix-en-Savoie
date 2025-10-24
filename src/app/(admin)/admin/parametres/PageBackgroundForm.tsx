'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { LoadingButton } from '@/components/admin/LoadingButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info, Trash2 } from 'lucide-react'
import { updatePageBackground, removePageBackground } from './actions'

interface PageBackgroundFormProps {
  page: string
  title: string
  description: string
  initialImage?: string
}

export function PageBackgroundForm({ page, title, description, initialImage = '' }: PageBackgroundFormProps) {
  const [backgroundImage, setBackgroundImage] = useState(initialImage)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

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

      toast.success('Image de fond mise à jour avec succès')
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error('Erreur lors de la mise à jour de l\'image de fond')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemove = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer l\'image de fond ?')) {
      return
    }

    setIsRemoving(true)

    try {
      await removePageBackground(page)
      setBackgroundImage('')
      toast.success('Image de fond supprimée avec succès')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression de l\'image de fond')
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Recommandation : Utilisez une image de haute qualité (minimum 1920x1080px)
              pour un rendu optimal sur tous les écrans.
            </AlertDescription>
          </Alert>

          {backgroundImage && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Aperçu actuel</label>
                <div className="mt-2 relative w-full h-64 rounded-lg overflow-hidden border border-border">
                  <Image
                    src={backgroundImage}
                    alt="Background preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60 flex items-center justify-center">
                    <p className="text-white text-lg font-semibold">Aperçu avec overlay</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Image de fond {!backgroundImage && <span className="text-destructive">*</span>}
            </label>
            <ImageUpload
              value={backgroundImage}
              onChange={setBackgroundImage}
              onRemove={() => setBackgroundImage('')}
              disabled={isSubmitting || isRemoving}
              folder="settings"
            />
          </div>

          <div className="flex gap-3">
            <LoadingButton
              type="submit"
              isLoading={isSubmitting}
              disabled={!backgroundImage || isRemoving}
            >
              Enregistrer
            </LoadingButton>

            {backgroundImage && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemove}
                disabled={isSubmitting || isRemoving}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer l'image
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
