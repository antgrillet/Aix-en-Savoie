'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Send, CheckCircle2 } from 'lucide-react'
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
        <Label className="mb-3 block">Votre demande concerne</Label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Motif de contact">
          {SUJETS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setSujet(option.value)
                resetExtraFields()
              }}
              aria-pressed={sujet === option.value}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                sujet === option.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-zinc-900/60 text-neutral-300 border border-zinc-700 hover:bg-zinc-800'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-neutral-400 mt-3">{activeSujet.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="nom">Nom *</Label>
          <Input
            id="nom"
            name="nom"
            type="text"
            required
            placeholder="Dupont"
            autoComplete="family-name"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="prenom">Prénom *</Label>
          <Input
            id="prenom"
            name="prenom"
            type="text"
            required
            placeholder="Jean"
            autoComplete="given-name"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="jean.dupont@example.com"
          autoComplete="email"
          className="mt-1"
        />
      </div>

      {/* Informations sur le futur licencié (parents) */}
      {sujet === 'inscription' && (
        <div className="space-y-4 bg-zinc-900/50 p-4 rounded-lg border border-zinc-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="licencie">Prénom du futur licencié</Label>
              <Input
                id="licencie"
                name="licencie"
                type="text"
                placeholder="Léa"
                autoComplete="off"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="age">Âge</Label>
              <Input
                id="age"
                name="age"
                type="number"
                min={3}
                max={99}
                placeholder="9"
                autoComplete="off"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="categorie">Catégorie envisagée</Label>
            <Select value={categorieSouhaitee} onValueChange={setCategorieSouhaitee}>
              <SelectTrigger id="categorie" className="mt-1">
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
        </div>
      )}

      {/* Informations joueur (adulte ou jeune souhaitant jouer) */}
      {sujet === 'jouer' && (
        <div className="space-y-4 bg-zinc-900/50 p-4 rounded-lg border border-zinc-700">
          <div>
            <Label htmlFor="niveau">Niveau de pratique</Label>
            <Select value={niveau} onValueChange={setNiveau}>
              <SelectTrigger id="niveau" className="mt-1">
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
            <Label className="mb-2 block">Postes préférés (plusieurs choix possibles)</Label>
            <div className="grid grid-cols-2 gap-3">
              {['Gardien', 'Ailier gauche', 'Arrière gauche', 'Demi-centre', 'Pivot', 'Arrière droit', 'Ailier droit'].map((position) => (
                <div key={position} className="flex items-center space-x-3">
                  <Checkbox
                    id={position}
                    checked={positions.includes(position)}
                    onCheckedChange={(checked) => handlePositionChange(position, checked as boolean)}
                    className="h-5 w-5"
                  />
                  <label
                    htmlFor={position}
                    className="text-sm leading-none cursor-pointer"
                  >
                    {position}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder={
            sujet === 'inscription'
              ? 'Disponibilités, questions sur les créneaux ou le tarif...'
              : 'Décrivez votre demande...'
          }
          autoComplete="off"
          className="mt-1"
        />
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            className="bg-green-900/50 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg flex items-center gap-2"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Votre message a été envoyé avec succès !</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {isError && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            className="bg-red-900/50 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <span className="font-medium">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Envoi en cours...
          </span>
        ) : (
          <>
            Envoyer le message
            <Send className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </form>
  )
}
