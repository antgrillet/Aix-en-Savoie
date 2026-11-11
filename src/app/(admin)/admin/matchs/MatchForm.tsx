'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/admin/Button'
import { Field, Input, SwitchField } from '@/components/admin/Field'
import { FormSection, SaveBar } from '@/components/admin/FormSection'
import { SimpleSelect } from '@/components/admin/Select'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { StatusMark } from '@/components/admin/StatusMark'

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
  equipe?: Equipe
  updatedAt?: Date
}

interface MatchFormProps {
  match?: Match
  equipes: Equipe[]
  action: (formData: FormData) => Promise<void>
}

const formatModification = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

type ChampMatch = 'equipeId' | 'adversaire' | 'date' | 'lieu' | 'scoreEquipe' | 'scoreAdversaire'

// Ordre d'affichage des champs : la première erreur est celle du haut
const ORDRE_CHAMPS: ChampMatch[] = [
  'equipeId',
  'adversaire',
  'date',
  'lieu',
  'scoreEquipe',
  'scoreAdversaire',
]

// Les chiffres du score sont pris sur la rampe du thème (24 px, tabulaires)
const scoreInputClasses =
  'h-12 w-full text-center font-semibold [font-family:var(--adm-font-condensed,var(--font-sans))] text-[length:var(--adm-num-md)] md:h-12 md:text-[length:var(--adm-num-md)]'

/**
 * Mêmes contraintes que celles du champ (`type="number"`, `min="0"`, pas de 1) :
 * le formulaire n'en ajoute aucune, il les dit sous le champ.
 */
function erreurScore(form: HTMLFormElement, champ: 'scoreEquipe' | 'scoreAdversaire') {
  const input = form.elements.namedItem(champ)
  if (!(input instanceof HTMLInputElement)) return undefined

  const { badInput, rangeUnderflow, stepMismatch } = input.validity
  return badInput || rangeUnderflow || stepMismatch
    ? 'Le score est un nombre entier, 0 ou plus.'
    : undefined
}

export function MatchForm({ match, equipes, action }: MatchFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [termine, setTermine] = useState(match?.termine ?? false)
  const [domicile, setDomicile] = useState(match?.domicile ?? true)
  const [published, setPublished] = useState(match?.published ?? true)
  const [equipeId, setEquipeId] = useState(match?.equipeId?.toString() || '')
  const [errors, setErrors] = useState<Partial<Record<ChampMatch, string>>>({})

  // La liste ne propose que les équipes publiées. Si le match appartient à une
  // équipe qui ne l'est pas, elle reste affichée : la valeur envoyée ne change pas.
  const equipeHorsListe =
    match?.equipe && !equipes.some((equipe) => equipe.id === match.equipe?.id)
      ? match.equipe
      : undefined

  const equipeOptions = useMemo(
    () =>
      [...equipes, ...(equipeHorsListe ? [equipeHorsListe] : [])].map((equipe) => ({
        value: equipe.id.toString(),
        label: `${equipe.nom} (${equipe.categorie.trim()})`,
      })),
    [equipes, equipeHorsListe]
  )

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

  const clearError = (champ: ChampMatch) => {
    if (errors[champ]) setErrors({ ...errors, [champ]: undefined })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = e.currentTarget
    const formData = new FormData(form)
    const adversaire = formData.get('adversaire') as string
    const date = formData.get('date') as string
    const lieu = formData.get('lieu') as string

    // Validation avec messages utilisateur
    const found: Partial<Record<ChampMatch, string>> = {}

    if (!equipeId) {
      found.equipeId = 'Choisissez l\'équipe du club qui joue ce match.'
    }
    if (!adversaire?.trim()) {
      found.adversaire = 'Indiquez le nom de l\'équipe adverse.'
    }
    if (!date) {
      found.date = 'Indiquez la date et l\'heure du coup d\'envoi.'
    }
    if (!lieu?.trim()) {
      found.lieu = 'Indiquez la salle où le match se joue.'
    }
    if (termine) {
      found.scoreEquipe = erreurScore(form, 'scoreEquipe')
      found.scoreAdversaire = erreurScore(form, 'scoreAdversaire')
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
      formData.set('equipeId', equipeId)
      formData.set('domicile', domicile.toString())
      formData.set('termine', termine.toString())
      formData.set('published', published.toString())

      await action(formData)
    } catch (error) {
      const digest = (error as { digest?: unknown } | null)?.digest
      if (typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')) {
        return
      }
      console.error(error)
      toast.error("Le match n'a pas pu être enregistré.", {
        description: 'Vérifiez votre connexion, puis réessayez.',
      })
      setIsSubmitting(false)
    }
  }

  const submitLabel = match
    ? 'Enregistrer'
    : published
      ? 'Publier le match'
      : 'Enregistrer le brouillon'

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSection title="Rencontre" description="Qui joue, quand et dans quelle salle.">
        <Field
          id="equipeId"
          label="Équipe"
          required
          error={errors.equipeId}
          hint={
            equipeHorsListe && equipeId === equipeHorsListe.id.toString()
              ? 'Cette équipe n\'est pas publiée sur le site.'
              : undefined
          }
        >
          <SimpleSelect
            value={equipeId}
            onValueChange={(value) => {
              setEquipeId(value)
              clearError('equipeId')
            }}
            options={equipeOptions}
            placeholder="Choisir une équipe"
          />
        </Field>

        <Field id="adversaire" label="Adversaire" required error={errors.adversaire}>
          <Input
            name="adversaire"
            defaultValue={match?.adversaire}
            onChange={() => clearError('adversaire')}
            placeholder="Nom de l'équipe adverse"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="date" label="Date et heure" required error={errors.date}>
            <Input
              name="date"
              type="datetime-local"
              defaultValue={match?.date ? formatDateForInput(match.date) : ''}
              onChange={() => clearError('date')}
            />
          </Field>

          <Field id="lieu" label="Lieu" required error={errors.lieu}>
            <Input
              name="lieu"
              defaultValue={match?.lieu}
              onChange={() => clearError('lieu')}
              placeholder="Gymnase des Prés Riants"
            />
          </Field>
        </div>

        <Field id="competition" label="Compétition" optional>
          <Input
            name="competition"
            defaultValue={match?.competition || ''}
            placeholder="Championnat, Coupe de France…"
          />
        </Field>

        <div className="border-t border-border">
          <SwitchField
            id="domicile"
            label="Match à domicile"
            description={
              domicile ? 'Le club reçoit.' : 'Le club se déplace chez l\'adversaire.'
            }
            checked={domicile}
            onCheckedChange={setDomicile}
            aside={
              <StatusMark tone={domicile ? 'fill' : 'solid'}>
                {domicile ? 'Domicile' : 'Extérieur'}
              </StatusMark>
            }
          />
        </div>
      </FormSection>

      <FormSection title="Résultat" description="À remplir une fois le match joué.">
        <div className="border-t border-border">
          <SwitchField
            id="termine"
            label="Match terminé"
            description={
              termine
                ? 'Le match est joué : son score se saisit ci-dessous.'
                : 'Activez une fois le match joué pour saisir le score.'
            }
            checked={termine}
            onCheckedChange={setTermine}
            aside={
              <StatusMark tone={termine ? 'solid' : 'dashed'}>
                {termine ? 'Terminé' : 'À venir'}
              </StatusMark>
            }
          />
        </div>

        {termine && (
          <>
            <div className="grid max-w-80 grid-cols-2 gap-5">
              <Field id="scoreEquipe" label="Score du club" error={errors.scoreEquipe}>
                <Input
                  name="scoreEquipe"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  defaultValue={match?.scoreEquipe ?? ''}
                  onChange={() => clearError('scoreEquipe')}
                  placeholder="0"
                  className={scoreInputClasses}
                />
              </Field>

              <Field id="scoreAdversaire" label="Score adverse" error={errors.scoreAdversaire}>
                <Input
                  name="scoreAdversaire"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  defaultValue={match?.scoreAdversaire ?? ''}
                  onChange={() => clearError('scoreAdversaire')}
                  placeholder="0"
                  className={scoreInputClasses}
                />
              </Field>
            </div>
            <p className="adm-meta">
              Laissez les deux champs vides si le score n'est pas connu : le match reste marqué
              comme joué, sans score.
            </p>
          </>
        )}
      </FormSection>

      <FormSection title="Publication" description="Ce que le site montre de ce match.">
        <div className="border-t border-border">
          <SwitchField
            id="published"
            label="Publié"
            description={
              published
                ? 'Visible sur le calendrier du site dès l\'enregistrement.'
                : 'Gardé en brouillon : invisible sur le site.'
            }
            checked={published}
            onCheckedChange={setPublished}
            aside={<StatusBadge status={published ? 'published' : 'draft'} />}
          />
        </div>
      </FormSection>

      <SaveBar
        status={
          match?.updatedAt &&
          `Dernière modification le ${formatModification.format(new Date(match.updatedAt))}`
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
