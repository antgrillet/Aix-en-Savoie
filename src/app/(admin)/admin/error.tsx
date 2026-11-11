'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RotateCw } from 'lucide-react'
import { Button } from '@/components/admin/Button'
import { EmptyState } from '@/components/admin/EmptyState'
import { PageHeader } from '@/components/admin/PageHeader'

export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div>
      <PageHeader title="Cette page n'a pas pu s'afficher" />
      <EmptyState
        title="Les données du club n'ont pas répondu"
        action={
          <>
            <Button type="button" onClick={() => retry()}>
              <RotateCw aria-hidden="true" />
              Réessayer
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin">Revenir au tableau de bord</Link>
            </Button>
          </>
        }
      >
        <p>
          Réessayez dans un instant. Si le problème dure, vérifiez votre connexion ou prévenez la
          personne qui s'occupe du site.
        </p>
        {error.digest && <p className="adm-micro mt-2">Référence à transmettre : {error.digest}</p>}
      </EmptyState>
    </div>
  )
}
