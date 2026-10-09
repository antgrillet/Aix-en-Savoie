'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth-client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { siteButton } from '@/components/site/styles'
import { cn } from '@/lib/utils'
import { CircleAlert, Loader2, LogIn } from 'lucide-react'

// Champs sombres, cohérents avec les formulaires du site
const fieldClass =
  'mt-2 h-11 border-white/10 bg-neutral-950/60 text-base text-white shadow-none placeholder:text-neutral-500 focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/40 md:text-sm'

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn.email({
        email,
        password,
      })

      if (result.error) {
        setError(result.error.code === 'INVALID_EMAIL_OR_PASSWORD'
          ? 'Email ou mot de passe incorrect'
          : 'Connexion temporairement indisponible. Veuillez réessayer dans quelques instants.')
      } else {
        router.push('/admin')
        router.refresh()
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="email" className="text-sm font-medium text-neutral-200">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="admin@hbcaixensavoie.fr"
          autoComplete="email"
          className={fieldClass}
        />
      </div>

      <div>
        <Label htmlFor="password" className="text-sm font-medium text-neutral-200">Mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          autoComplete="current-password"
          className={fieldClass}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={cn(siteButton({ size: 'lg' }), 'w-full focus-visible:ring-offset-neutral-900')}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            Connexion...
          </>
        ) : (
          <>
            <LogIn />
            Se connecter
          </>
        )}
      </button>
    </form>
  )
}
