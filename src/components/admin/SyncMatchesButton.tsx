'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface SyncMatchesButtonProps {
  equipeId: number
  equipeNom: string
  hasMatchesUrl: boolean
  className?: string
}

export function SyncMatchesButton({ equipeId, equipeNom, hasMatchesUrl, className }: SyncMatchesButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    if (!hasMatchesUrl) {
      toast.error('Aucun lien de championnat configuré pour cette équipe')
      return
    }

    setIsSyncing(true)

    try {
      const response = await fetch(`/api/admin/equipes/${equipeId}/sync-matches`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erreur lors de la synchronisation')
      }

      toast.success(data.message || 'Synchronisation réussie', {
        description: `${data.summary.created} créés, ${data.summary.updated} mis à jour, ${data.summary.skipped} ignorés`,
      })

      // Recharger la page pour voir les nouveaux matchs
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error: any) {
      console.error('Erreur de synchronisation:', error)
      toast.error('Erreur lors de la synchronisation', {
        description: error.message,
      })
    } finally {
      setIsSyncing(false)
    }
  }

  // type="button" : le bouton peut être placé dans un formulaire sans le soumettre
  return (
    <Button
      type="button"
      onClick={handleSync}
      disabled={isSyncing || !hasMatchesUrl}
      variant="outline"
      className={cn('h-10', className)}
      title={`Importer les matchs de ${equipeNom} depuis FFHANDBALL`}
    >
      <RefreshCw className={isSyncing ? 'animate-spin' : undefined} />
      {isSyncing ? 'Synchronisation…' : 'Synchroniser les matchs'}
    </Button>
  )
}
