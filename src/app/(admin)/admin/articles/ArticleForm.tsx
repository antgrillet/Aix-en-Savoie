'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/admin/Button'
import { Field, Input, SwitchField, Textarea } from '@/components/admin/Field'
import { FormSection, SaveBar } from '@/components/admin/FormSection'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { SimpleSelect } from '@/components/admin/Select'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Tag } from '@/components/admin/Tag'
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

const CATEGORY_OPTIONS = CATEGORIES.map((cat) => ({ value: cat, label: cat }))

// Mêmes bornes que `articleSchema` : l'erreur est dite ici, avant l'envoi
const TITRE_MAX = 200
const RESUME_MIN = 10
const CONTENU_MIN = 50

const formatModification = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

type ChampArticle = 'titre' | 'resume' | 'contenu' | 'image' | 'categorie' | 'date'

// Ordre d'affichage des champs : la première erreur est celle du haut
const ORDRE_CHAMPS: ChampArticle[] = ['titre', 'resume', 'contenu', 'image', 'categorie', 'date']

interface ArticleFormProps {
  action: (formData: FormData) => Promise<void>
  initialData?: Article
}

export function ArticleForm({ action, initialData }: ArticleFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [titre, setTitre] = useState(initialData?.titre || '')
  const [image, setImage] = useState(initialData?.image || '')
  const [contenu, setContenu] = useState(initialData?.contenu || '')
  const [categorie, setCategorie] = useState(initialData?.categorie || '')
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [published, setPublished] = useState(initialData?.published ?? true)
  const [vedette, setVedette] = useState(initialData?.vedette ?? false)
  const [errors, setErrors] = useState<Partial<Record<ChampArticle, string>>>({})

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const clearError = (champ: ChampArticle) => {
    if (errors[champ]) setErrors({ ...errors, [champ]: undefined })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const date = formData.get('date') as string
    const resume = formData.get('resume') as string

    // Validation avec messages utilisateur
    const found: Partial<Record<ChampArticle, string>> = {}

    if (!titre.trim()) {
      found.titre = 'Donnez un titre à l\'article.'
    } else if (titre.length > TITRE_MAX) {
      found.titre = `Le titre dépasse ${TITRE_MAX} caractères : raccourcissez-le.`
    }
    if (!resume?.trim()) {
      found.resume = 'Écrivez un résumé : il présente l\'article dans les listes.'
    } else if (resume.length < RESUME_MIN) {
      found.resume = `Le résumé est trop court : ${RESUME_MIN} caractères au moins.`
    }
    if (!contenu?.trim()) {
      found.contenu = 'Écrivez le contenu de l\'article.'
    } else if (contenu.length < CONTENU_MIN) {
      found.contenu = 'Le contenu est trop court : ajoutez quelques phrases.'
    }
    if (!image) {
      found.image = 'Ajoutez une image de couverture.'
    }
    if (!categorie) {
      found.categorie = 'Choisissez une catégorie.'
    }
    if (!date) {
      found.date = 'Indiquez la date de publication.'
    }

    setErrors(found)

    const premierChamp = ORDRE_CHAMPS.find((champ) => found[champ])
    if (premierChamp) {
      toast.error(found[premierChamp])
      document.getElementById(premierChamp)?.focus()
      return
    }

    setIsSubmitting(true)

    try {
      formData.set('titre', titre)
      formData.set('image', image)
      formData.set('contenu', contenu)
      formData.set('categorie', categorie)
      formData.set('tags', JSON.stringify(tags))
      formData.set('published', published.toString())
      formData.set('vedette', vedette.toString())

      await action(formData)
      toast.success(initialData ? 'Article modifié' : 'Article créé')
    } catch (error) {
      // L'action se termine par un retour à la liste : `redirect()` rejette la
      // promesse côté client, ce n'est pas un échec
      if (
        typeof error === 'object' &&
        error !== null &&
        'digest' in error &&
        typeof error.digest === 'string' &&
        error.digest.startsWith('NEXT_REDIRECT')
      ) {
        toast.success(initialData ? 'Article modifié' : 'Article créé')
        return
      }
      console.error(error)
      toast.error("L'article n'a pas pu être enregistré.", {
        description: 'Si un autre article porte déjà ce titre, changez-le, puis réessayez.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitLabel = initialData
    ? 'Enregistrer'
    : published
      ? "Publier l'article"
      : 'Enregistrer le brouillon'

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSection title="Texte" description="Ce que les visiteurs lisent sur la page de l'article.">
        <Field
          id="titre"
          label="Titre"
          required
          error={errors.titre}
          counter={{ value: titre.length, max: TITRE_MAX }}
        >
          <Input
            name="titre"
            value={titre}
            onChange={(e) => {
              setTitre(e.target.value)
              clearError('titre')
            }}
            placeholder="Victoire des seniors à domicile"
          />
        </Field>

        <Field
          id="resume"
          label="Résumé"
          required
          error={errors.resume}
          hint="Deux ou trois phrases, affichées sous le titre dans les listes d'actualités."
        >
          <Textarea
            name="resume"
            defaultValue={initialData?.resume}
            onChange={() => clearError('resume')}
            rows={3}
          />
        </Field>

        <Field id="contenu" label="Contenu" required error={errors.contenu}>
          <RichTextEditor
            content={contenu}
            onChange={(value) => {
              setContenu(value)
              clearError('contenu')
            }}
            placeholder="Racontez le match, l'événement, la vie du club…"
            label="Contenu de l'article"
          />
        </Field>
      </FormSection>

      <FormSection
        title="Image de couverture"
        description="Affichée en tête de l'article et dans les listes d'actualités."
      >
        <Field id="image" label="Image" required error={errors.image}>
          <ImageUpload
            value={image}
            onChange={(url) => {
              setImage(url)
              clearError('image')
            }}
            onRemove={() => setImage('')}
            disabled={isSubmitting}
            folder="articles"
            previewAlt="Aperçu de l'image de couverture"
          />
        </Field>
      </FormSection>

      <FormSection title="Classement" description="Pour retrouver l'article parmi les actualités.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="categorie" label="Catégorie" required error={errors.categorie}>
            <SimpleSelect
              value={categorie}
              onValueChange={(value) => {
                setCategorie(value)
                clearError('categorie')
              }}
              options={CATEGORY_OPTIONS}
              placeholder="Choisir une catégorie"
            />
          </Field>

          <Field id="date" label="Date de publication" required error={errors.date}>
            <Input
              name="date"
              type="date"
              onChange={() => clearError('date')}
              defaultValue={
                initialData
                  ? new Date(initialData.date).toISOString().split('T')[0]
                  : new Date().toISOString().split('T')[0]
              }
            />
          </Field>
        </div>

        <Field
          id="tag-input"
          label="Tags"
          optional
          hint="Un mot-clé à la fois, puis Entrée ou « Ajouter »."
        >
          <div className="flex gap-2">
            <Input
              id="tag-input"
              aria-describedby="tag-input-aide"
              className="min-w-0 flex-1"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
              placeholder="Coupe de France"
            />
            <Button type="button" onClick={addTag} variant="outline">
              Ajouter
            </Button>
          </div>
        </Field>
        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Tags de l'article">
            {tags.map((tag) => (
              <li key={tag}>
                <Tag onRemove={() => removeTag(tag)} removeLabel={`Retirer le tag ${tag}`}>
                  {tag}
                </Tag>
              </li>
            ))}
          </ul>
        )}
      </FormSection>

      <FormSection title="Publication" description="Ce que le site montre de cet article.">
        <div className="border-t border-border">
          <SwitchField
            id="published"
            label="Publié"
            description={
              published
                ? 'Visible sur le site dès l\'enregistrement.'
                : 'Gardé en brouillon : invisible sur le site.'
            }
            checked={published}
            onCheckedChange={setPublished}
            aside={<StatusBadge status={published ? 'published' : 'draft'} />}
          />
          <SwitchField
            id="vedette"
            label="Article en vedette"
            checked={vedette}
            onCheckedChange={setVedette}
          />
        </div>
      </FormSection>

      <SaveBar
        status={
          initialData &&
          `Dernière modification le ${formatModification.format(new Date(initialData.updatedAt))}`
        }
      >
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </SaveBar>
    </form>
  )
}
