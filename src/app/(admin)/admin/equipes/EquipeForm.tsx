'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { LoadingButton } from '@/components/admin/LoadingButton'
import { toast } from 'sonner'
import type { Equipe, Entrainement } from '@/generated/prisma/client'

interface EquipeFormProps {
  action: (formData: FormData) => Promise<void>
  initialData?: Equipe & { entrainements: Entrainement[] }
  /** Bloc affiché dans la section « Synchronisation FFHB » (bouton d'import en édition) */
  syncPanel?: React.ReactNode
}

/** Section de formulaire : carte avec titre, courte description et action éventuelle */
function FormSection({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      <div className="space-y-5 p-5 sm:p-6">{children}</div>
    </Card>
  )
}

function Required() {
  return <span aria-hidden className="text-muted-foreground"> *</span>
}

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const GYMNASES = ['Gymnase des Prés-Riants', 'G4 Marlioz', 'G2 Marlioz']

export function EquipeForm({ action, initialData, syncPanel }: EquipeFormProps) {
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

  // Lieux proposés : gymnases habituels + lieux déjà enregistrés (sinon la valeur actuelle s'afficherait vide)
  const gymnases = Array.from(
    new Set([...GYMNASES, ...(initialData?.entrainements.map((e) => e.lieu).filter((lieu): lieu is string => !!lieu) ?? [])])
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
    <form onSubmit={handleSubmit}>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Colonne principale */}
        <div className="min-w-0 space-y-6">
          <FormSection title="Informations" description="Présentation de l'équipe sur sa page publique.">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nom">
                  Nom de l'équipe
                  <Required />
                </Label>
                <Input
                  id="nom"
                  name="nom"
                  defaultValue={initialData?.nom}
                  placeholder="Ex : Seniors Filles N2"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categorie">
                  Catégorie
                  <Required />
                </Label>
                <Input
                  id="categorie"
                  name="categorie"
                  defaultValue={initialData?.categorie}
                  placeholder="Ex : Seniors, Jeunes, Loisirs"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">
                  Genre
                  <Required />
                </Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger id="genre" className="h-10">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MASCULIN">Masculin</SelectItem>
                    <SelectItem value="FEMININ">Féminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entraineur">
                  Entraîneur
                  <Required />
                </Label>
                <Input
                  id="entraineur"
                  name="entraineur"
                  defaultValue={initialData?.entraineur}
                  placeholder="Nom de l'entraîneur"
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description
                <Required />
              </Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={initialData?.description}
                placeholder="Quelques lignes sur l'équipe, son niveau, ses objectifs…"
                rows={4}
              />
            </div>
          </FormSection>

          <FormSection title="Photos" description="Images affichées sur la liste des équipes et la page de l'équipe.">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Photo de l'équipe
                  <Required />
                </Label>
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
                <p className="text-xs text-muted-foreground">
                  Optionnelle : fond de l'en-tête de la page de l'équipe.
                </p>
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Entraînements"
            description="Créneaux affichés sur la page de l'équipe."
            action={
              <Button type="button" onClick={addEntrainement} variant="outline" size="sm" className="shrink-0">
                <Plus />
                Ajouter
              </Button>
            }
          >
            <ul className="space-y-3">
              {entrainements.map((entrainement, index) => (
                <li
                  key={index}
                  className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)_auto] sm:items-end"
                >
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`entrainement-${index}-jour`} className="text-xs">
                      Jour
                      <Required />
                    </Label>
                    <Select
                      value={entrainement.jour}
                      onValueChange={(value) => updateEntrainement(index, 'jour', value)}
                    >
                      <SelectTrigger id={`entrainement-${index}-jour`} className="h-10 bg-card">
                        <SelectValue placeholder="Jour" />
                      </SelectTrigger>
                      <SelectContent>
                        {JOURS.map((jour) => (
                          <SelectItem key={jour} value={jour}>{jour}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`entrainement-${index}-horaire`} className="text-xs">
                      Horaire
                      <Required />
                    </Label>
                    <Input
                      id={`entrainement-${index}-horaire`}
                      value={entrainement.horaire}
                      onChange={(e) => updateEntrainement(index, 'horaire', e.target.value)}
                      placeholder="18h00 - 20h00"
                      className="h-10 bg-card"
                    />
                  </div>
                  <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
                    <Label htmlFor={`entrainement-${index}-lieu`} className="text-xs">Lieu</Label>
                    <Select
                      value={entrainement.lieu || ''}
                      onValueChange={(value) => updateEntrainement(index, 'lieu', value)}
                    >
                      <SelectTrigger id={`entrainement-${index}-lieu`} className="h-10 bg-card">
                        <SelectValue placeholder="Sélectionner un gymnase" />
                      </SelectTrigger>
                      <SelectContent>
                        {gymnases.map((gymnase) => (
                          <SelectItem key={gymnase} value={gymnase}>{gymnase}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeEntrainement(index)}
                    disabled={entrainements.length === 1}
                    className="col-span-2 h-10 justify-self-end text-muted-foreground hover:bg-destructive/10 hover:text-destructive sm:col-span-1 sm:w-10 sm:px-0"
                    title="Retirer ce créneau"
                  >
                    <Trash2 />
                    <span className="sm:sr-only">Retirer ce créneau</span>
                  </Button>
                </li>
              ))}
            </ul>
          </FormSection>
        </div>

        {/* Colonne latérale */}
        <div className="min-w-0 space-y-6">
          <FormSection title="Publication" description="Visibilité et position sur le site.">
            <div className="divide-y rounded-lg border">
              <div className="flex items-start justify-between gap-4 p-3">
                <div className="space-y-1">
                  <Label htmlFor="published">Publiée</Label>
                  <p className="text-xs text-muted-foreground">Visible sur la page Équipes.</p>
                </div>
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={setPublished}
                />
              </div>
              <div className="flex items-start justify-between gap-4 p-3">
                <div className="space-y-1">
                  <Label htmlFor="featured">Afficher sur la page d'accueil</Label>
                  <p className="text-xs text-muted-foreground">Les matchs de cette équipe seront affichés.</p>
                </div>
                <Switch
                  id="featured"
                  checked={featured}
                  onCheckedChange={setFeatured}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ordre">Ordre d'affichage</Label>
              <Input
                id="ordre"
                name="ordre"
                type="number"
                min="0"
                defaultValue={initialData?.ordre || 0}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Les plus petits nombres apparaissent en premier. Modifiable aussi par glisser-déposer dans la liste.
              </p>
            </div>
          </FormSection>

          <FormSection title="Synchronisation FFHB" description="Import automatique des matchs depuis FFHANDBALL.">
            <div className="space-y-2">
              <Label htmlFor="matches">Lien du championnat</Label>
              <Input
                id="matches"
                name="matches"
                type="url"
                defaultValue={initialData?.matches || ''}
                placeholder="https://www.ffhandball.fr/…"
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Page de la compétition sur ffhandball.fr. Nécessaire pour importer les matchs.
              </p>
            </div>

            {syncPanel}
          </FormSection>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="sticky bottom-3 z-20 mt-6 flex items-center gap-3 rounded-xl border bg-card/95 p-3 shadow-md backdrop-blur sm:bottom-4 sm:px-4">
        <p className="hidden flex-1 text-xs text-muted-foreground sm:block">
          Les champs marqués d'un * sont obligatoires.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="h-10 flex-1 sm:flex-none"
        >
          Annuler
        </Button>
        <LoadingButton type="submit" isLoading={isSubmitting} className="h-10 flex-1 sm:flex-none">
          {initialData ? 'Enregistrer' : "Créer l'équipe"}
        </LoadingButton>
      </div>
    </form>
  )
}
