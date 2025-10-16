'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { LoadingButton } from '@/components/admin/LoadingButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import type { Equipe, Entrainement } from '@prisma/client'

interface EquipeFormProps {
  action: (formData: FormData) => Promise<void>
  initialData?: Equipe & { entrainements: Entrainement[] }
}

export function EquipeForm({ action, initialData }: EquipeFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photo, setPhoto] = useState(initialData?.photo || '')
  const [entrainements, setEntrainements] = useState<Array<{
    jour: string
    horaire: string
    lieu: string
  }>>(
    initialData?.entrainements.map(e => ({ ...e, lieu: e.lieu || '' })) || [{ jour: '', horaire: '', lieu: '' }]
  )

  const addEntrainement = () => {
    setEntrainements([...entrainements, { jour: '', horaire: '', lieu: '' }])
  }

  const removeEntrainement = (index: number) => {
    setEntrainements(entrainements.filter((_, i) => i !== index))
  }

  const updateEntrainement = (
    index: number,
    field: 'jour' | 'horaire' | 'lieu',
    value: string
  ) => {
    const updated = [...entrainements]
    updated[index][field] = value
    setEntrainements(updated)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!photo) {
      toast.error('Veuillez ajouter une photo')
      return
    }

    if (entrainements.some(e => !e.jour || !e.horaire)) {
      toast.error('Tous les entraînements doivent avoir un jour et un horaire')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.set('photo', photo)
      formData.set('entrainements', JSON.stringify(entrainements))

      await action(formData)
      toast.success(initialData ? 'Équipe modifiée' : 'Équipe créée')
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
          <Label htmlFor="nom">Nom de l'équipe *</Label>
          <Input
            id="nom"
            name="nom"
            required
            defaultValue={initialData?.nom}
            placeholder="Ex: N2 Féminin"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categorie">Catégorie *</Label>
          <Input
            id="categorie"
            name="categorie"
            required
            defaultValue={initialData?.categorie}
            placeholder="Ex: N2F, Elite, etc."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Photo de l'équipe *</Label>
        <ImageUpload
          value={photo}
          onChange={setPhoto}
          onRemove={() => setPhoto('')}
          disabled={isSubmitting}
          folder="equipes"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          name="description"
          required
          defaultValue={initialData?.description}
          placeholder="Description de l'équipe"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="entraineur">Entraîneur *</Label>
          <Input
            id="entraineur"
            name="entraineur"
            required
            defaultValue={initialData?.entraineur}
            placeholder="Nom de l'entraîneur"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="matches">Lien calendrier matches</Label>
          <Input
            id="matches"
            name="matches"
            type="url"
            defaultValue={initialData?.matches || ''}
            placeholder="https://..."
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Entraînements</CardTitle>
              <CardDescription>
                Ajoutez les horaires d'entraînement
              </CardDescription>
            </div>
            <Button
              type="button"
              onClick={addEntrainement}
              size="sm"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {entrainements.map((entrainement, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-end">
              <div className="col-span-3 space-y-2">
                <Label>Jour *</Label>
                <Input
                  value={entrainement.jour}
                  onChange={(e) => updateEntrainement(index, 'jour', e.target.value)}
                  placeholder="Lundi"
                  required
                />
              </div>
              <div className="col-span-3 space-y-2">
                <Label>Horaire *</Label>
                <Input
                  value={entrainement.horaire}
                  onChange={(e) => updateEntrainement(index, 'horaire', e.target.value)}
                  placeholder="18h00 - 20h00"
                  required
                />
              </div>
              <div className="col-span-5 space-y-2">
                <Label>Lieu</Label>
                <Input
                  value={entrainement.lieu}
                  onChange={(e) => updateEntrainement(index, 'lieu', e.target.value)}
                  placeholder="Gymnase municipal"
                />
              </div>
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEntrainement(index)}
                  disabled={entrainements.length === 1}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="ordre">Ordre d'affichage</Label>
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
        <LoadingButton type="submit" isLoading={isSubmitting}>
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
