'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { siteButton } from '@/components/site/styles'
import { cn } from '@/lib/utils'
import {
  Send,
  CheckCircle2,
  CircleAlert,
  Handshake,
  Loader2,
  MessageCircleQuestion,
  Shirt,
  UserPlus,
  type LucideIcon,
} from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

type Sujet = 'inscription' | 'jouer' | 'question' | 'partenariat'

const SUJETS: Array<{ value: Sujet; label: string; description: string }> = [
  {
    value: 'inscription',
    label: 'Inscrire un enfant',
    description:
      "Vous souhaitez inscrire votre enfant : indiquez son prénom, son âge et la catégorie envisagée, nous vous guidons pour la suite.",
  },
  {
    value: 'jouer',
    label: 'Je veux jouer',
    description:
      'Vous êtes joueur ou joueuse et souhaitez rejoindre une équipe : parlez-nous de votre niveau et de vos postes.',
  },
  {
    value: 'question',
    label: 'Poser une question',
    description: 'Une question sur le club, les entraînements, les créneaux ou le bénévolat ?',
  },
  {
    value: 'partenariat',
    label: 'Devenir partenaire',
    description: 'Vous représentez une entreprise et souhaitez soutenir le club.',
  },
]

// Pictogrammes des cartes de choix du motif
const SUJET_ICONS: Record<Sujet, LucideIcon> = {
  inscription: UserPlus,
  jouer: Shirt,
  question: MessageCircleQuestion,
  partenariat: Handshake,
}

// Champs sombres communs du formulaire
const fieldClass =
  'mt-2 h-11 border-white/10 bg-neutral-950/60 text-base text-white shadow-none placeholder:text-neutral-500 focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/40 md:text-sm'

const labelClass = 'text-sm font-medium text-neutral-200'

const CATEGORIES_JEUNES = [
  'Baby Hand (3-5 ans)',
  '-11 ans',
  '-13 ans',
  '-15 ans',
  '-18 ans',
  'Seniors',
  'Loisirs',
  'Je ne sais pas encore',
]

function parseSujet(value: string | null): Sujet {
  switch (value) {
    case 'inscription':
      return 'inscription'
    case 'jouer':
    case 'rejoindre':
      return 'jouer'
    case 'partenariat':
      return 'partenariat'
    default:
      return 'question'
  }
}

export function ContactForm() {
  const searchParams = useSearchParams()
  const shouldReduceMotion = useReducedMotion()

  const [sujet, setSujet] = useState<Sujet>(() => parseSujet(searchParams.get('sujet')))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [niveau, setNiveau] = useState('')
  const [categorieSouhaitee, setCategorieSouhaitee] = useState('')
  const [positions, setPositions] = useState<string[]>([])

  const activeSujet = SUJETS.find((s) => s.value === sujet)!

  const resetExtraFields = () => {
    setNiveau('')
    setCategorieSouhaitee('')
    setPositions([])
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setIsError(false)
    setErrorMessage('')

    const form = e.currentTarget
    const formData = new FormData(form)
    const messageSaisi = String(formData.get('message') ?? '')

    // Le sujet et les informations complémentaires sont intégrés au message
    // pour rester compatible avec l'API de contact existante.
    const lignes: string[] = [`Sujet : ${activeSujet.label}`]

    if (sujet === 'inscription') {
      const licencie = String(formData.get('licencie') ?? '').trim()
      const age = String(formData.get('age') ?? '').trim()
      if (licencie) lignes.push(`Futur licencié : ${licencie}`)
      if (age) lignes.push(`Âge : ${age} ans`)
      if (categorieSouhaitee) lignes.push(`Catégorie envisagée : ${categorieSouhaitee}`)
    }

    const estJoueur = sujet === 'jouer'

    const data = {
      nom: formData.get('nom'),
      prenom: formData.get('prenom'),
      email: formData.get('email'),
      message: `${lignes.join('\n')}\n\n${messageSaisi}`,
      experience: estJoueur,
      niveau: estJoueur && niveau ? niveau : null,
      positions: estJoueur ? positions : [],
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        form.reset()
        resetExtraFields()
        setTimeout(() => setIsSuccess(false), 5000)
      } else {
        setIsError(true)
        setErrorMessage(result.error || 'Une erreur est survenue')
      }
    } catch (error) {
      console.error('Error:', error)
      setIsError(true)
      setErrorMessage('Impossible d\'envoyer le message. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePositionChange = (position: string, checked: boolean) => {
    if (checked) {
      setPositions([...positions, position])
    } else {
      setPositions(positions.filter((p) => p !== position))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Choix du motif de contact */}
      <div>
        <Label className={cn(labelClass, 'mb-3 block')}>Votre demande concerne</Label>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3" role="group" aria-label="Motif de contact">
          {SUJETS.map((option) => {
            const SujetIcon = SUJET_ICONS[option.value]
            const active = sujet === option.value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setSujet(option.value)
                  resetExtraFields()
                }}
                aria-pressed={active}
                className={cn(
                  'flex min-h-14 items-center gap-3 rounded-xl border p-3 text-left text-sm font-semibold leading-snug transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 sm:p-4',
                  active
                    ? 'border-primary-500 bg-primary-500/10 text-white'
                    : 'border-white/10 bg-white/[0.03] text-neutral-300 hover:border-white/25 hover:text-white'
                )}
              >
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                    active ? 'bg-primary-500 text-neutral-950' : 'bg-white/5 text-primary-400'
                  )}
                >
                  <SujetIcon className="size-4.5" />
                </span>
                {option.label}
              </button>
            )
          })}
        </div>
        <p className="mt-3 border-l-2 border-primary-500/60 pl-3 text-sm text-neutral-400">{activeSujet.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="nom" className={labelClass}>Nom *</Label>
          <Input
            id="nom"
            name="nom"
            type="text"
            required
            placeholder="Dupont"
            autoComplete="family-name"
            className={fieldClass}
          />
        </div>

        <div>
          <Label htmlFor="prenom" className={labelClass}>Prénom *</Label>
          <Input
            id="prenom"
            name="prenom"
            type="text"
            required
            placeholder="Jean"
            autoComplete="given-name"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email" className={labelClass}>Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="jean.dupont@example.com"
          autoComplete="email"
          className={fieldClass}
        />
      </div>

      {/* Informations sur le futur licencié (parents) */}
      {sujet === 'inscription' && (
        <fieldset className="space-y-5 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
          <legend className="sr-only">Le futur licencié</legend>
          <p aria-hidden className="font-eyebrow text-xs text-primary-400">Le futur licencié</p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <Label htmlFor="licencie" className={labelClass}>Prénom du futur licencié</Label>
              <Input
                id="licencie"
                name="licencie"
                type="text"
                placeholder="Léa"
                autoComplete="off"
                className={fieldClass}
              />
            </div>
            <div>
              <Label htmlFor="age" className={labelClass}>Âge</Label>
              <Input
                id="age"
                name="age"
                type="number"
                min={3}
                max={99}
                placeholder="9"
                autoComplete="off"
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="categorie" className={labelClass}>Catégorie envisagée</Label>
            <Select value={categorieSouhaitee} onValueChange={setCategorieSouhaitee}>
              <SelectTrigger id="categorie" className={cn(fieldClass, 'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40 data-[placeholder]:text-neutral-500')}>
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES_JEUNES.map((categorie) => (
                  <SelectItem key={categorie} value={categorie}>
                    {categorie}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </fieldset>
      )}

      {/* Informations joueur (adulte ou jeune souhaitant jouer) */}
      {sujet === 'jouer' && (
        <fieldset className="space-y-5 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
          <legend className="sr-only">Votre profil de joueur</legend>
          <p aria-hidden className="font-eyebrow text-xs text-primary-400">Votre profil de joueur</p>
          <div>
            <Label htmlFor="niveau" className={labelClass}>Niveau de pratique</Label>
            <Select value={niveau} onValueChange={setNiveau}>
              <SelectTrigger id="niveau" className={cn(fieldClass, 'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40 data-[placeholder]:text-neutral-500')}>
                <SelectValue placeholder="Sélectionnez votre niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="debutant">Débutant</SelectItem>
                <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                <SelectItem value="confirme">Confirmé</SelectItem>
                <SelectItem value="expert">Expert / Compétition</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className={cn(labelClass, 'mb-3 block')}>Postes préférés (plusieurs choix possibles)</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {['Gardien', 'Ailier gauche', 'Arrière gauche', 'Demi-centre', 'Pivot', 'Arrière droit', 'Ailier droit'].map((position) => (
                <div
                  key={position}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border pl-3 transition-colors',
                    positions.includes(position)
                      ? 'border-primary-500/60 bg-primary-500/10'
                      : 'border-white/10 bg-neutral-950/40 hover:border-white/25'
                  )}
                >
                  <Checkbox
                    id={position}
                    checked={positions.includes(position)}
                    onCheckedChange={(checked) => handlePositionChange(position, checked as boolean)}
                    className="size-5 border-white/30 data-[state=checked]:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500"
                  />
                  <label
                    htmlFor={position}
                    className="flex-1 cursor-pointer py-2.5 pr-3 text-sm leading-snug text-neutral-200"
                  >
                    {position}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </fieldset>
      )}

      <div>
        <Label htmlFor="message" className={labelClass}>Message *</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder={
            sujet === 'inscription'
              ? 'Disponibilités, questions sur les créneaux ou le tarif...'
              : 'Décrivez votre demande...'
          }
          autoComplete="off"
          className={cn(fieldClass, 'h-auto min-h-36 py-3')}
        />
      </div>

      {/* Message de succès */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <CheckCircle2 className="size-5 shrink-0" />
            <span className="font-medium">Votre message a été envoyé avec succès !</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message d'erreur */}
      <AnimatePresence>
        {isError && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <CircleAlert className="size-5 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(siteButton({ size: 'lg' }), 'w-full focus-visible:ring-offset-neutral-900')}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            Envoyer le message
            <Send />
          </>
        )}
      </button>
    </form>
  )
}
