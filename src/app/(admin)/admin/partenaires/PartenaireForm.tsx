'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { LoadingButton } from '@/components/admin/LoadingButton'
import { toast } from 'sonner'
import type { Partenaire } from '@prisma/client'

interface PartenaireFormProps {
  action: (formData: FormData) => Promise<void>
  initialData?: Partenaire
}

export function PartenaireForm({ action, initialData }: PartenaireFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logo, setLogo] = useState(initialData?.logo || '')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!logo) {
      toast.error('Veuillez ajouter un logo')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.set('logo', logo)

      await action(formData)
      toast.success(initialData ? 'Partenaire modifié' : 'Partenaire créé')
    } catch (error) {
      console.error(error)
      toast.error('Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom *</Label>
          <Input
            id="nom"
            name="nom"
            required
            defaultValue={initialData?.nom}
            placeholder="Nom du partenaire"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categorie">Catégorie *</Label>
          <Input
            id="categorie"
            name="categorie"
            required
            defaultValue={initialData?.categorie}
            placeholder="Ex: Équipementier, Institution, etc."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Logo *</Label>
        <ImageUpload
          value={logo}
          onChange={setLogo}
          onRemove={() => setLogo('')}
          disabled={isSubmitting}
          folder="partenaires"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          name="description"
          required
          defaultValue={initialData?.description}
          placeholder="Description du partenaire"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="site">Site web</Label>
        <Input
          id="site"
          name="site"
          type="url"
          defaultValue={initialData?.site || ''}
          placeholder="https://example.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="ordre">Ordre</Label>
          <Input
            id="ordre"
            name="ordre"
            type="number"
            min="0"
            defaultValue={initialData?.ordre || 0}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="partenaire_majeur">Partenaire majeur</Label>
            <Switch
              id="partenaire_majeur"
              name="partenaire_majeur"
              defaultChecked={initialData?.partenaire_majeur}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="published">Publié</Label>
            <Switch
              id="published"
              name="published"
              defaultChecked={initialData?.published ?? true}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <LoadingButton
          type="submit"
          isLoading={isSubmitting}
        >
          {initialData ? 'Modifier' : 'Créer'}
        </LoadingButton>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}
