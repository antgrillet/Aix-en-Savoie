'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
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

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Enregistrement...' : 'Enregistrer'}
    </Button>
  )
}

export function MatchForm({ match, equipes, action }: MatchFormProps) {
  const [termine, setTermine] = useState(match?.termine ?? false)
  const [domicile, setDomicile] = useState(match?.domicile ?? true)
  const [published, setPublished] = useState(match?.published ?? true)

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

  return (
    <form action={action} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="equipeId">Équipe *</Label>
            <Select name="equipeId" defaultValue={match?.equipeId?.toString()} required>
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
              required
              placeholder="Nom de l'équipe adverse"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date et heure *</Label>
              <Input
                id="date"
                name="date"
                type="datetime-local"
                defaultValue={match?.date ? formatDateForInput(match.date) : ''}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lieu">Lieu *</Label>
              <Input
                id="lieu"
                name="lieu"
                defaultValue={match?.lieu}
                required
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
            <div className="grid grid-cols-2 gap-4">
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

      <div className="flex gap-4">
        <SubmitButton />
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
