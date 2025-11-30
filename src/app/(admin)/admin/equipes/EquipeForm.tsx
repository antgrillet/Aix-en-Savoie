'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  const [banniere, setBanniere] = useState(initialData?.banniere || '')
  const [published, setPublished] = useState(initialData?.published ?? true)
  const [featured, setFeatured] = useState(initialData?.featured ?? false)
  const [genre, setGenre] = useState(initialData?.genre || 'MASCULIN')
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

    const formData = new FormData(e.currentTarget)
    const nom = formData.get('nom') as string
    const categorie = formData.get('categorie') as string
    const description = formData.get('description') as string
    const entraineur = formData.get('entraineur') as string

    // Validation avec messages utilisateur
    const errors: string[] = []

    if (!nom?.trim()) {
      errors.push('Le nom de l\'équipe est requis')
    }
    if (!categorie?.trim()) {
      errors.push('La catégorie est requise')
    }
    if (!description?.trim()) {
      errors.push('La description est requise')
    }
    if (!entraineur?.trim()) {
      errors.push('Le nom de l\'entraîneur est requis')
    }
    if (!photo) {
      errors.push('La photo de l\'équipe est requise')
    }
    if (entrainements.some(e => !e.jour?.trim() || !e.horaire?.trim())) {
      errors.push('Chaque entraînement doit avoir un jour et un horaire')
    }

    if (errors.length > 0) {
      toast.error(errors[0])
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.set('photo', photo)
      if (banniere) {
        formData.set('banniere', banniere)
      }
      formData.set('published', published.toString())
      formData.set('featured', featured.toString())
      formData.set('genre', genre)
      formData.set('entrainements', JSON.stringify(entrainements))

      await action(formData)
      // Le redirect se fait automatiquement, pas besoin de toast ici
    } catch (error: any) {
      // Next.js redirect lance une erreur NEXT_REDIRECT, ce n'est pas une vraie erreur
      if (error?.digest?.startsWith('NEXT_REDIRECT')) {
        return
      }
      console.error(error)
      toast.error('Une erreur est survenue')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom de l'équipe *</Label>
          <Input
            id="nom"
            name="nom"
            defaultValue={initialData?.nom}
            placeholder="Ex: N2 Féminin"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categorie">Catégorie *</Label>
          <Input
            id="categorie"
            name="categorie"
            defaultValue={initialData?.categorie}
            placeholder="Ex: N2F, Elite, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="genre">Genre *</Label>
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger id="genre">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MASCULIN">Masculin</SelectItem>
              <SelectItem value="FEMININ">Féminin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
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
          <Label>Image de fond (bannière)</Label>
          <ImageUpload
            value={banniere}
            onChange={setBanniere}
            onRemove={() => setBanniere('')}
            disabled={isSubmitting}
            folder="equipes"
          />
          <p className="text-xs text-neutral-500">
            Image de fond pour la page de l'équipe (optionnel)
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          name="description"
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
                />
              </div>
              <div className="col-span-3 space-y-2">
                <Label>Horaire *</Label>
                <Input
                  value={entrainement.horaire}
                  onChange={(e) => updateEntrainement(index, 'horaire', e.target.value)}
                  placeholder="18h00 - 20h00"
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
              checked={published}
              onCheckedChange={setPublished}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="featured">Afficher sur la page d'accueil</Label>
              <p className="text-sm text-muted-foreground">Les matchs de cette équipe seront affichés</p>
            </div>
            <Switch
              id="featured"
              checked={featured}
              onCheckedChange={setFeatured}
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
