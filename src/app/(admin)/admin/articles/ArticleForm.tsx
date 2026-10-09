'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { LoadingButton } from '@/components/admin/LoadingButton'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import type { Article } from '@/generated/prisma/client'

const CATEGORIES = [
  'ÉVÉNEMENTS',
  'ÉQUIPES',
  'COMPÉTITIONS',
  'CLUB',
  'JEUNES',
  'FORMATION',
  'ACTUALITÉS',
  'PARTENAIRES',
] as const

interface ArticleFormProps {
  action: (formData: FormData) => Promise<void>
  initialData?: Article
}

/** Section de formulaire : carte avec titre et courte description */
function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <div className="border-b px-5 py-4 sm:px-6">
        <h2 className="font-display text-base font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-5 p-5 sm:p-6">{children}</div>
    </Card>
  )
}

function Required() {
  return <span aria-hidden className="text-muted-foreground"> *</span>
}

export function ArticleForm({ action, initialData }: ArticleFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [image, setImage] = useState(initialData?.image || '')
  const [contenu, setContenu] = useState(initialData?.contenu || '')
  const [categorie, setCategorie] = useState(initialData?.categorie || '')
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState('')

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const titre = formData.get('titre') as string
    const date = formData.get('date') as string
    const resume = formData.get('resume') as string

    // Validation avec messages utilisateur
    const errors: string[] = []

    if (!titre?.trim()) {
      errors.push('Le titre est requis')
    }
    if (!categorie) {
      errors.push('La catégorie est requise')
    }
    if (!date) {
      errors.push('La date de publication est requise')
    }
    if (!image) {
      errors.push('L\'image de couverture est requise')
    }
    if (!resume?.trim()) {
      errors.push('Le résumé est requis')
    }
    if (!contenu?.trim()) {
      errors.push('Le contenu de l\'article est requis')
    }

    if (errors.length > 0) {
      toast.error(errors[0])
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.set('image', image)
      formData.set('contenu', contenu)
      formData.set('categorie', categorie)
      formData.set('tags', JSON.stringify(tags))

      await action(formData)
      toast.success(initialData ? 'Article modifié' : 'Article créé')
    } catch (error) {
      console.error(error)
      toast.error('Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Colonne principale : le texte de l'article */}
        <div className="min-w-0 space-y-6">
          <FormSection title="Contenu" description="Le texte affiché sur la page de l'article.">
            <div className="space-y-2">
              <Label htmlFor="titre">
                Titre
                <Required />
              </Label>
              <Input
                id="titre"
                name="titre"
                defaultValue={initialData?.titre}
                placeholder="Titre de l'article"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume">
                Résumé
                <Required />
              </Label>
              <Textarea
                id="resume"
                name="resume"
                defaultValue={initialData?.resume}
                placeholder="Quelques phrases pour donner envie de lire l'article"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Affiché sur les cartes d'actualités et dans les listes.</p>
            </div>

            <div className="space-y-2">
              <Label>
                Texte de l'article
                <Required />
              </Label>
              <RichTextEditor
                content={contenu}
                onChange={setContenu}
                placeholder="Contenu de l'article..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tag-input">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tag-input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  placeholder="Ajouter un tag"
                  className="h-10"
                />
                <Button type="button" onClick={addTag} variant="outline" className="h-10 shrink-0">
                  <Plus />
                  Ajouter
                </Button>
              </div>
              {tags.length > 0 && (
                <ul className="flex flex-wrap gap-2 pt-1">
                  {tags.map((tag) => (
                    <li
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-primary-50 py-0.5 pl-2.5 pr-1 text-xs font-medium text-primary-800 ring-1 ring-inset ring-primary-600/20"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="rounded-full p-0.5 transition-colors hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <X className="size-3" />
                        <span className="sr-only">Retirer le tag {tag}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </FormSection>
        </div>

        {/* Colonne latérale : publication et image */}
        <div className="min-w-0 space-y-6">
          <FormSection title="Publication" description="Classement et visibilité sur le site.">
            <div className="space-y-2">
              <Label htmlFor="categorie">
                Catégorie
                <Required />
              </Label>
              <Select value={categorie} onValueChange={setCategorie}>
                <SelectTrigger id="categorie" className="h-10">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">
                Date de publication
                <Required />
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                className="h-10"
                defaultValue={
                  initialData
                    ? new Date(initialData.date).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0]
                }
              />
            </div>

            <div className="divide-y rounded-lg border">
              <div className="flex items-start justify-between gap-4 p-3">
                <div className="space-y-1">
                  <Label htmlFor="published">Publié</Label>
                  <p className="text-xs text-muted-foreground">Visible par tous sur le site.</p>
                </div>
                <Switch
                  id="published"
                  name="published"
                  value="true"
                  defaultChecked={initialData?.published ?? true}
                />
              </div>
              <div className="flex items-start justify-between gap-4 p-3">
                <div className="space-y-1">
                  <Label htmlFor="vedette">Article en vedette</Label>
                  <p className="text-xs text-muted-foreground">Mis en avant sur la page d'accueil.</p>
                </div>
                <Switch
                  id="vedette"
                  name="vedette"
                  value="true"
                  defaultChecked={initialData?.vedette}
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="Image de couverture" description="Obligatoire. Format paysage conseillé.">
            <ImageUpload
              value={image}
              onChange={setImage}
              onRemove={() => setImage('')}
              disabled={isSubmitting}
              folder="articles"
            />
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
          {initialData ? 'Enregistrer' : "Créer l'article"}
        </LoadingButton>
      </div>
    </form>
  )
}
