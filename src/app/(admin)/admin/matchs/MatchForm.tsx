'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingButton } from '@/components/admin/LoadingButton'
import { toast } from 'sonner'

interface Equipe {
  id: number
  nom: string
  categorie: string
}

interface Match {
  id?: number
  equipeId: number
  adversaire: string
  date: Date
  lieu: string
  domicile: boolean
  competition: string | null
  termine: boolean
  scoreEquipe: number | null
  scoreAdversaire: number | null
  published: boolean
}

interface MatchFormProps {
  match?: Match
  equipes: Equipe[]
  action: (formData: FormData) => Promise<void>
}

export function MatchForm({ match, equipes, action }: MatchFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [termine, setTermine] = useState(match?.termine ?? false)
  const [domicile, setDomicile] = useState(match?.domicile ?? true)
  const [published, setPublished] = useState(match?.published ?? true)
  const [equipeId, setEquipeId] = useState(match?.equipeId?.toString() || '')

  // Format date for input[type="datetime-local"]
  const formatDateForInput = (date: Date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const adversaire = formData.get('adversaire') as string
    const date = formData.get('date') as string
    const lieu = formData.get('lieu') as string

    // Validation avec messages utilisateur
    const errors: string[] = []

    if (!equipeId) {
      errors.push('L\'équipe est requise')
    }
    if (!adversaire?.trim()) {
      errors.push('Le nom de l\'adversaire est requis')
    }
    if (!date) {
      errors.push('La date et l\'heure sont requises')
    }
    if (!lieu?.trim()) {
      errors.push('Le lieu est requis')
    }

    if (errors.length > 0) {
      toast.error(errors[0])
      return
    }

    setIsSubmitting(true)

    try {
      formData.set('equipeId', equipeId)
      formData.set('domicile', domicile.toString())
      formData.set('termine', termine.toString())
      formData.set('published', published.toString())

      await action(formData)
    } catch (error: any) {
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
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="equipeId">Équipe *</Label>
            <Select value={equipeId} onValueChange={setEquipeId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une équipe" />
              </SelectTrigger>
              <SelectContent>
                {equipes.map((equipe) => (
                  <SelectItem key={equipe.id} value={equipe.id.toString()}>
                    {equipe.nom} ({equipe.categorie})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adversaire">Adversaire *</Label>
            <Input
              id="adversaire"
              name="adversaire"
              defaultValue={match?.adversaire}
              placeholder="Nom de l'équipe adverse"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date et heure *</Label>
              <Input
                id="date"
                name="date"
                type="datetime-local"
                defaultValue={match?.date ? formatDateForInput(match.date) : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lieu">Lieu *</Label>
              <Input
                id="lieu"
                name="lieu"
                defaultValue={match?.lieu}
                placeholder="Gymnase des Prés Riants"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="competition">Compétition</Label>
            <Input
              id="competition"
              name="competition"
              defaultValue={match?.competition || ''}
              placeholder="Championnat, Coupe..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="domicile"
              name="domicile"
              value="true"
              checked={domicile}
              onCheckedChange={(checked) => setDomicile(checked as boolean)}
            />
            <Label htmlFor="domicile" className="font-normal cursor-pointer">
              Match à domicile
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Résultat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="termine"
              name="termine"
              value="true"
              checked={termine}
              onCheckedChange={(checked) => setTermine(checked as boolean)}
            />
            <Label htmlFor="termine" className="font-normal cursor-pointer">
              Match terminé
            </Label>
          </div>

          {termine && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scoreEquipe">Score équipe</Label>
                <Input
                  id="scoreEquipe"
                  name="scoreEquipe"
                  type="number"
                  min="0"
                  defaultValue={match?.scoreEquipe ?? ''}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scoreAdversaire">Score adversaire</Label>
                <Input
                  id="scoreAdversaire"
                  name="scoreAdversaire"
                  type="number"
                  min="0"
                  defaultValue={match?.scoreAdversaire ?? ''}
                  placeholder="0"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publication</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="published"
              name="published"
              value="true"
              checked={published}
              onCheckedChange={(checked) => setPublished(checked as boolean)}
            />
            <Label htmlFor="published" className="font-normal cursor-pointer">
              Publié
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <LoadingButton type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
          Enregistrer
        </LoadingButton>
        <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={isSubmitting} className="w-full sm:w-auto">
          Annuler
        </Button>
      </div>
    </form>
  )
}
