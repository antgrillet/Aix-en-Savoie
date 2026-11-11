'use client'

import { useState } from 'react'
import { Check, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/admin/Button'
import { Field, Input } from '@/components/admin/Field'
import { FormSection } from '@/components/admin/FormSection'
import { StatusMark } from '@/components/admin/StatusMark'
import { updateCalendrierPassword } from './actions'

interface CalendrierPasswordFormProps {
  /** Un mot de passe est-il en place ? Sa valeur ne quitte jamais le serveur. */
  isDefined: boolean
}

/**
 * Mot de passe commun du calendrier des matchs. Le mot de passe en place n'est
 * jamais affiché : on en saisit un nouveau pour le remplacer.
 */
export function CalendrierPasswordForm({ isDefined }: CalendrierPasswordFormProps) {
  const [defined, setDefined] = useState(isDefined)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [justSaved, setJustSaved] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('password', password)

      await updateCalendrierPassword(formData)
      setDefined(true)
      setPassword('')
      setShowPassword(false)
      setJustSaved(true)
      toast.success(defined ? 'Mot de passe du calendrier modifié' : 'Mot de passe du calendrier enregistré')
    } catch (saveError) {
      console.error('Erreur:', saveError)
      setError("Le mot de passe n'a pas pu être enregistré. Réessayez dans un instant.")
      toast.error("Le mot de passe du calendrier n'a pas pu être enregistré.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormSection
      title="Mot de passe du calendrier"
      description={
        <>
          Le mot de passe commun que les bénévoles saisissent pour ouvrir le calendrier des matchs et
          s'y inscrire.
          <span className="mt-2 block">
            <StatusMark tone={defined ? 'solid' : 'action'}>{defined ? 'Défini' : 'À définir'}</StatusMark>
          </span>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Field
          id="calendrier-password"
          label={defined ? 'Nouveau mot de passe' : 'Mot de passe'}
          error={error}
          hint={
            defined
              ? "Un mot de passe est en place. Il n'est jamais affiché ici : pour le changer, saisissez-en un nouveau, puis transmettez-le aux bénévoles."
              : "Aucun mot de passe n'est en place : le calendrier reste fermé tant que vous n'en enregistrez pas un."
          }
        >
          <div className="relative sm:max-w-sm">
            <Input
              id="calendrier-password"
              aria-describedby={error ? 'calendrier-password-erreur calendrier-password-aide' : 'calendrier-password-aide'}
              aria-invalid={error ? true : undefined}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
                setJustSaved(false)
              }}
              disabled={loading}
              autoComplete="new-password"
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              aria-label={showPassword ? 'Masquer le mot de passe saisi' : 'Afficher le mot de passe saisi'}
              aria-pressed={showPassword}
              className="absolute right-0 top-0 grid size-11 place-content-center rounded-[3px] text-foreground transition-colors duration-150 ease-out hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-45 md:size-10"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </Field>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <Button
            type="submit"
            variant={password ? 'default' : 'outline'}
            isLoading={loading}
            disabled={!password}
          >
            Enregistrer le mot de passe
          </Button>

          <p role="status" className="adm-meta flex min-w-0 items-center gap-1.5">
            {justSaved && !password && (
              <>
                <Check className="size-3.5 shrink-0 text-foreground" aria-hidden="true" />
                Enregistré : c'est désormais ce mot de passe qui ouvre le calendrier.
              </>
            )}
          </p>
        </div>
      </form>
    </FormSection>
  )
}
