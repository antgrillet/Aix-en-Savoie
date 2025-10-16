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
import { updateHeroBackground, removeHeroBackground } from './actions'

interface HeroBackgroundFormProps {
  initialImage?: string
}

export function HeroBackgroundForm({ initialImage = '' }: HeroBackgroundFormProps) {
  const [heroBackgroundImage, setHeroBackgroundImage] = useState(initialImage)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

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
      await removeHeroBackground()
      setHeroBackgroundImage('')
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
        <CardTitle>Image de fond du Hero</CardTitle>
        <CardDescription>
          Gérez l'image de fond affichée sur la section hero de la page d'accueil
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

          {heroBackgroundImage && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Aperçu actuel</label>
                <div className="mt-2 relative w-full h-64 rounded-lg overflow-hidden border border-border">
                  <Image
                    src={heroBackgroundImage}
                    alt="Hero background preview"
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
              Image de fond {!heroBackgroundImage && <span className="text-destructive">*</span>}
            </label>
            <ImageUpload
              value={heroBackgroundImage}
              onChange={setHeroBackgroundImage}
              onRemove={() => setHeroBackgroundImage('')}
              disabled={isSubmitting || isRemoving}
              folder="settings"
            />
          </div>

          <div className="flex gap-3">
            <LoadingButton
              type="submit"
              isLoading={isSubmitting}
              disabled={!heroBackgroundImage || isRemoving}
            >
              Enregistrer
            </LoadingButton>

            {heroBackgroundImage && (
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
