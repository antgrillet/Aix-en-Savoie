'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { CircleAlert, ExternalLink, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/admin/Button'
import { StatusMark } from '@/components/admin/StatusMark'

interface LastRun {
  status: string
  conclusion: string | null
  created_at: string
  html_url: string
}

/** Où en est le lancement demandé depuis cet écran */
type Lancement = 'repos' | 'en-cours' | 'lance' | 'echec'

interface SyncState {
  lastRun: LastRun | null
  lancement: Lancement
  sync: () => void
}

const SyncContext = createContext<SyncState | null>(null)

/** Dernière synchronisation connue ; `null` si elle est illisible ou s'il n'y en a pas */
async function lireDernierLancement(): Promise<LastRun | null> {
  try {
    const response = await fetch('/api/sync/matches')
    const data = await response.json()
    return data.success && data.lastRun ? data.lastRun : null
  } catch {
    // Ignorer les erreurs silencieusement
    return null
  }
}

function useSync() {
  const state = useContext(SyncContext)
  if (!state) throw new Error('SyncButton et SyncStatus se placent dans un SyncProvider')
  return state
}

/**
 * Porte l'état de la synchronisation FFHANDBALL de la page Équipes : le bouton
 * (`SyncButton`) et la ligne d'état (`SyncStatus`) ne sont pas au même endroit
 * de l'en-tête, ils lisent tous deux cet état.
 */
export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [lancement, setLancement] = useState<Lancement>('repos')
  const [lastRun, setLastRun] = useState<LastRun | null>(null)
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Charger le statut du dernier workflow au montage
  useEffect(() => {
    let actif = true
    lireDernierLancement().then((run) => {
      if (actif && run) setLastRun(run)
    })
    return () => {
      actif = false
      if (refreshTimer.current) clearTimeout(refreshTimer.current)
    }
  }, [])

  const sync = useCallback(async () => {
    setLancement('en-cours')

    try {
      const response = await fetch('/api/sync/matches', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        setLancement('lance')
        toast.success('Synchronisation lancée', {
          description: 'Les matchs seront à jour dans quelques minutes.',
        })
        // Attendre un peu puis rafraîchir le statut
        refreshTimer.current = setTimeout(async () => {
          const run = await lireDernierLancement()
          if (run) setLastRun(run)
          setLancement('repos')
        }, 5000)
      } else {
        setLancement('echec')
        toast.error("La synchronisation n'a pas pu être lancée.", {
          description: data.error || 'Réessayez dans un instant.',
        })
      }
    } catch (error) {
      console.error('Erreur:', error)
      setLancement('echec')
      toast.error("La synchronisation n'a pas pu être lancée.", {
        description: 'Vérifiez votre connexion, puis réessayez.',
      })
    }
  }, [])

  return <SyncContext.Provider value={{ lastRun, lancement, sync }}>{children}</SyncContext.Provider>
}

/** Lance la synchronisation des matchs de toutes les équipes */
export function SyncButton() {
  const { lancement, sync } = useSync()
  const isSyncing = lancement === 'en-cours'

  return (
    <Button
      type="button"
      variant="outline"
      onClick={sync}
      disabled={isSyncing}
      aria-busy={isSyncing || undefined}
    >
      <RefreshCw className={isSyncing ? 'animate-spin' : undefined} aria-hidden="true" />
      {isSyncing ? (
        'Lancement…'
      ) : (
        <span>
          Synchroniser<span className="max-sm:sr-only"> les matchs</span>
        </span>
      )}
    </Button>
  )
}

const formatJour = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  day: 'numeric',
  month: 'short',
})

const formatHeure = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  hour: '2-digit',
  minute: '2-digit',
})

interface Etat {
  label: string
  /** Pointillé tant que rien n'est confirmé */
  provisoire: boolean
  erreur?: boolean
}

function lireEtat(lancement: Lancement, lastRun: LastRun | null): Etat | null {
  if (lancement === 'echec') return { label: 'Lancement impossible', provisoire: false, erreur: true }
  if (lancement === 'en-cours') return { label: 'Lancement…', provisoire: true }
  if (lancement === 'lance') return { label: 'Lancée', provisoire: true }
  if (!lastRun) return null
  if (lastRun.status === 'in_progress' || lastRun.status === 'queued') {
    return { label: 'En cours', provisoire: true }
  }
  if (lastRun.conclusion === 'success') return { label: 'Réussie', provisoire: false }
  return { label: 'Échec', provisoire: false, erreur: true }
}

/**
 * Ligne d'état de la synchronisation, à placer dans la description de
 * l'en-tête : dernière exécution connue (en cours, réussie, en échec) et suite
 * donnée au lancement demandé depuis le bouton.
 */
export function SyncStatus() {
  const { lancement, lastRun } = useSync()
  const etat = lireEtat(lancement, lastRun)
  const montreLaDate = lastRun && (lancement === 'repos' || lancement === 'echec')

  return (
    <span role="status" className="mt-1.5 flex min-h-6 flex-wrap items-center gap-x-2 gap-y-1">
      <span>Matchs importés de FFHANDBALL</span>
      {etat && (
        // Même marque montée d'un état à l'autre : le pointillé devient plein
        <StatusMark
          tone={etat.provisoire ? 'dashed' : 'solid'}
          icon={etat.erreur ? CircleAlert : undefined}
          className={etat.erreur ? 'text-destructive' : undefined}
        >
          <span className="sr-only">Synchronisation : </span>
          {etat.label}
        </StatusMark>
      )}
      {montreLaDate && (
        <a
          href={lastRun.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="adm-link inline-flex min-h-6 items-center gap-1"
        >
          {lancement === 'echec' && 'dernière synchronisation '}
          le {formatJour.format(new Date(lastRun.created_at))} à{' '}
          {formatHeure.format(new Date(lastRun.created_at))}
          <ExternalLink className="size-3" aria-hidden="true" />
          <span className="sr-only"> (détail de la synchronisation, nouvel onglet)</span>
        </a>
      )}
    </span>
  )
}
