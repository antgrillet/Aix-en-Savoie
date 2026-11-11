'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CircleAlert, Eye, EyeOff, LogIn } from 'lucide-react'
import { signIn } from '@/lib/auth-client'
import { Button } from '@/components/admin/Button'
import { Field, Input } from '@/components/admin/Field'

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  // Seul un refus des identifiants met les deux champs en erreur
  const [identifiantsRefuses, setIdentifiantsRefuses] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setIdentifiantsRefuses(false)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn.email({
        email,
        password,
      })

      if (result.error) {
        setIdentifiantsRefuses(result.error.code === 'INVALID_EMAIL_OR_PASSWORD')
        setError(
          result.error.code === 'INVALID_EMAIL_OR_PASSWORD'
            ? 'Adresse e-mail ou mot de passe incorrect. Vérifiez la saisie, puis réessayez.'
            : 'La connexion est momentanément indisponible. Réessayez dans quelques instants.'
        )
      } else {
        router.push('/admin')
        router.refresh()
      }
    } catch (err) {
      setError('La connexion a échoué. Vérifiez votre accès à Internet, puis réessayez.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <Field id="email" label="Adresse e-mail">
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={identifiantsRefuses ? true : undefined}
          aria-describedby={error ? 'connexion-erreur' : undefined}
        />
      </Field>

      <Field id="password" label="Mot de passe">
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            className="pr-12"
            aria-invalid={identifiantsRefuses ? true : undefined}
            aria-describedby={error ? 'connexion-erreur' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword((shown) => !shown)}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            aria-pressed={showPassword}
            className="absolute right-0 top-0 grid size-11 place-content-center rounded-[3px] text-[color:var(--adm-ink)] transition-colors duration-150 ease-out hover:bg-foreground hover:text-background md:size-10"
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </Field>

      {error && (
        <p
          id="connexion-erreur"
          role="alert"
          className="flex items-start gap-2 rounded-[3px] border border-destructive px-3 py-2.5 text-[0.9375rem] font-medium text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}

      <Button
        type="submit"
        isLoading={isLoading}
        size="lg"
        className="w-full hover:border-background active:bg-background active:text-foreground"
      >
        {!isLoading && <LogIn aria-hidden="true" />}
        {isLoading ? 'Connexion…' : 'Se connecter'}
      </Button>
    </form>
  )
}
