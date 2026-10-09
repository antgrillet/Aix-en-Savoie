'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

/** Ligne d'option avec interrupteur, libellé et aide */
function ToggleRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
      <div className="space-y-1">
        <Label htmlFor={id}>{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} name={id} value="true" checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

function Required() {
  return <span aria-hidden className="text-muted-foreground"> *</span>
}

export function MatchForm({ match, equipes, action }: MatchFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [termine, setTermine] = useState(match?.termine ?? false)
  const [domicile, setDomicile] = useState(match?.domicile ?? true)
  const [published, setPublished] = useState(match?.published ?? true)
  const [equipeId, setEquipeId] = useState(match?.equipeId?.toString() || '')

  const equipeNom = equipes.find((equipe) => equipe.id.toString() === equipeId)?.nom

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
    <form onSubmit={handleSubmit}>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Colonne principale */}
        <div className="min-w-0 space-y-6">
          <FormSection title="Rencontre" description="Équipe du club et adversaire.">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="equipeId">
                  Équipe
                  <Required />
                </Label>
                <Select value={equipeId} onValueChange={setEquipeId}>
                  <SelectTrigger id="equipeId" className="h-10">
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
                <Label htmlFor="adversaire">
                  Adversaire
                  <Required />
                </Label>
                <Input
                  id="adversaire"
                  name="adversaire"
                  defaultValue={match?.adversaire}
                  placeholder="Nom de l'équipe adverse"
                  className="h-10"
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
                className="h-10"
              />
            </div>
          </FormSection>

          <FormSection title="Date & lieu" description="Coup d'envoi et salle de la rencontre.">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">
                  Date et heure
                  <Required />
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="datetime-local"
                  defaultValue={match?.date ? formatDateForInput(match.date) : ''}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lieu">
                  Lieu
                  <Required />
                </Label>
                <Input
                  id="lieu"
                  name="lieu"
                  defaultValue={match?.lieu}
                  placeholder="Gymnase des Prés Riants"
                  className="h-10"
                />
              </div>
            </div>

            <ToggleRow
              id="domicile"
              label="Match à domicile"
              description="Désactivez pour un match à l'extérieur."
              checked={domicile}
              onCheckedChange={setDomicile}
            />
          </FormSection>
        </div>

        {/* Colonne latérale */}
        <div className="min-w-0 space-y-6">
          <FormSection title="Score" description="À compléter une fois le match joué.">
            <ToggleRow
              id="termine"
              label="Match terminé"
              description="Affiche le score sur le site."
              checked={termine}
              onCheckedChange={setTermine}
            />

            {termine && (
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-3">
                <div className="min-w-0 space-y-2">
                  <Label htmlFor="scoreEquipe" className="block truncate">
                    {equipeNom ?? 'Équipe'}
                  </Label>
                  <Input
                    id="scoreEquipe"
                    name="scoreEquipe"
                    type="number"
                    min="0"
                    defaultValue={match?.scoreEquipe ?? ''}
                    placeholder="0"
                    className="h-12 text-center font-display text-xl font-bold tabular-nums md:text-xl"
                  />
                </div>
                <span aria-hidden className="pb-3 text-lg font-semibold text-muted-foreground">–</span>
                <div className="min-w-0 space-y-2">
                  <Label htmlFor="scoreAdversaire" className="block truncate">
                    Adversaire
                  </Label>
                  <Input
                    id="scoreAdversaire"
                    name="scoreAdversaire"
                    type="number"
                    min="0"
                    defaultValue={match?.scoreAdversaire ?? ''}
                    placeholder="0"
                    className="h-12 text-center font-display text-xl font-bold tabular-nums md:text-xl"
                  />
                </div>
              </div>
            )}
          </FormSection>

          <FormSection title="Publication">
            <ToggleRow
              id="published"
              label="Publié"
              description="Visible sur le calendrier et la page de l'équipe."
              checked={published}
              onCheckedChange={setPublished}
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
          onClick={() => window.history.back()}
          disabled={isSubmitting}
          className="h-10 flex-1 sm:flex-none"
        >
          Annuler
        </Button>
        <LoadingButton type="submit" isLoading={isSubmitting} className="h-10 flex-1 sm:flex-none">
          {match ? 'Enregistrer' : 'Créer le match'}
        </LoadingButton>
      </div>
    </form>
  )
}
