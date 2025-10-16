'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { LoadingButton } from '@/components/admin/LoadingButton'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import type { Article } from '@prisma/client'

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

    if (!image) {
      toast.error('Veuillez ajouter une image')
      return
    }

    if (!contenu) {
      toast.error('Veuillez ajouter du contenu')
      return
    }

    if (!categorie) {
      toast.error('Veuillez sélectionner une catégorie')
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="titre">Titre *</Label>
          <Input
            id="titre"
            name="titre"
            required
            defaultValue={initialData?.titre}
            placeholder="Titre de l'article"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categorie">Catégorie *</Label>
          <Select value={categorie} onValueChange={setCategorie} required>
            <SelectTrigger>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date de publication *</Label>
        <Input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={
            initialData
              ? new Date(initialData.date).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0]
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Image de couverture *</Label>
        <ImageUpload
          value={image}
          onChange={setImage}
          onRemove={() => setImage('')}
          disabled={isSubmitting}
          folder="articles"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="resume">Résumé *</Label>
        <Textarea
          id="resume"
          name="resume"
          required
          defaultValue={initialData?.resume}
          placeholder="Résumé de l'article (affiché dans les listes)"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Contenu *</Label>
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
          />
          <Button type="button" onClick={addTag} variant="outline">
            Ajouter
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="vedette">Article en vedette</Label>
          <Switch
            id="vedette"
            name="vedette"
            defaultChecked={initialData?.vedette}
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
