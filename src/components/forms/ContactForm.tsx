'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Send, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [experience, setExperience] = useState(false)
  const [niveau, setNiveau] = useState('')
  const [positions, setPositions] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setIsError(false)
    setErrorMessage('')

    const formData = new FormData(e.currentTarget)
    const data = {
      nom: formData.get('nom'),
      prenom: formData.get('prenom'),
      email: formData.get('email'),
      telephone: formData.get('telephone'),
      message: formData.get('message'),
      experience,
      niveau: experience ? niveau : null,
      positions: experience ? positions : [],
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
        ;(e.target as HTMLFormElement).reset()
        setExperience(false)
        setNiveau('')
        setPositions([])
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="nom">Nom *</Label>
          <Input
            id="nom"
            name="nom"
            type="text"
            required
            placeholder="Dupont"
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
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="jean.dupont@example.com"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="telephone">Téléphone</Label>
          <Input
            id="telephone"
            name="telephone"
            type="tel"
            placeholder="06 12 34 56 78"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="Décrivez votre demande..."
          className="mt-1"
        />
      </div>

      {/* Section pour les joueurs intéressés */}
      <div className="pt-4 border-t border-zinc-700">
        <div className="flex items-center space-x-3 mb-4">
          <Checkbox
            id="experience"
            checked={experience}
            onCheckedChange={(checked) => setExperience(checked as boolean)}
            className="h-5 w-5"
          />
          <label
            htmlFor="experience"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Je souhaite rejoindre le club (informations complémentaires)
          </label>
        </div>

        <AnimatePresence>
          {experience && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 bg-zinc-900/50 p-4 rounded-lg border border-zinc-700"
            >
              <div>
                <Label htmlFor="niveau">Niveau de pratique</Label>
                <Select value={niveau} onValueChange={setNiveau}>
                  <SelectTrigger className="mt-1">
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
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {position}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-900/50 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg flex items-center gap-2"
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-900/50 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg"
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
