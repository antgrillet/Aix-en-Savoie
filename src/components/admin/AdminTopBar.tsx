'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Check, ChevronDown, ExternalLink, LogOut, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { LOGO } from '@/components/admin/AdminNav'
import { StatusDot, type StatusTone } from '@/components/admin/StatusMark'
import { useDeconnexion } from '@/components/admin/useDeconnexion'
import type { SaisonsAdmin } from '@/components/admin/saisons-admin'

/** Valeur du paramètre `?saison=` de Matchs qui affiche toutes les saisons. */
const TOUTES = 'toutes'
const MATCHS = '/admin/matchs'

export interface SynchroEnTete {
  tone: StatusTone
  libelle: string
  detail: string
}

interface AdminTopBarProps {
  saisons: SaisonsAdmin
  synchro: SynchroEnTete
  user?: { name?: string | null; email?: string | null }
}

const menuClasses = 'min-w-64 rounded-xl border-border p-1.5 shadow-[0_12px_32px_rgb(31_30_27/0.14)]'
const itemClasses = 'min-h-11 cursor-pointer gap-2.5 rounded-lg px-2.5 text-[0.9375rem] md:min-h-9'

function initiales(user: AdminTopBarProps['user']): string {
  const source = (user?.name || user?.email || '?').trim()
  const mots = source.split(/[\s@.]+/).filter(Boolean)
  return ((mots[0]?.[0] ?? '?') + (mots[1]?.[0] ?? '')).toUpperCase()
}

/**
 * Sélecteur de saison. Il s'appuie sur le filtre `?saison=` de Matchs : sur
 * cette page il change la saison listée ; ailleurs, il rappelle la saison que
 * voit le public et mène aux matchs de la saison choisie. La saison du site se
 * change dans Paramètres.
 */
function SelecteurSaison({ saisons }: { saisons: SaisonsAdmin }) {
  const pathname = usePathname()
  const params = useSearchParams()
  const surMatchs = pathname === MATCHS
  const parametre = surMatchs ? params.get('saison') : null
  const toutes = parametre === TOUTES
  const choisie = toutes
    ? null
    : (saisons.saisons.find((s) => parametre && (parametre === String(s.saison) || parametre === s.libelle))
        ?.saison ?? saisons.affichee)
  const libelleChoisie = choisie === null ? 'Toutes' : `${choisie}-${choisie + 1}`
  const etatChoisie =
    choisie === null ? 'les saisons' : saisons.saisons.find((s) => s.saison === choisie)?.etat

  const lien = (saison: number | null) => {
    if (saison === saisons.affichee) return MATCHS
    return `${MATCHS}?saison=${saison === null ? TOUTES : saison}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="adm-top-btn font-semibold text-foreground">
        <span className="max-sm:hidden">Saison</span>
        <span>{libelleChoisie}</span>
        <span className="font-normal text-muted-foreground max-xl:hidden">
          {choisie === saisons.affichee ? 'en cours' : etatChoisie}
        </span>
        <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={menuClasses}>
        <DropdownMenuLabel className="px-2.5 pb-1 pt-1.5 text-[0.875rem] font-normal text-muted-foreground">
          {surMatchs ? 'Matchs de la saison' : "Voir les matchs d'une saison"}
        </DropdownMenuLabel>
        {saisons.saisons.map((s) => {
          const courante = surMatchs && choisie === s.saison
          return (
            <DropdownMenuItem key={s.saison} asChild className={cn(itemClasses, courante && 'bg-[color:var(--adm-orange-soft)] font-semibold')}>
              <Link href={lien(s.saison)} aria-current={courante ? 'true' : undefined}>
                <span className="flex-1">{s.libelle}</span>
                <span className="text-[0.875rem] font-normal text-muted-foreground">{s.etat}</span>
                {courante && <Check aria-hidden="true" />}
              </Link>
            </DropdownMenuItem>
          )
        })}
        {surMatchs && (
          <DropdownMenuItem asChild className={cn(itemClasses, toutes && 'bg-[color:var(--adm-orange-soft)] font-semibold')}>
            <Link href={lien(null)}>
              <span className="flex-1">Toutes les saisons</span>
              {toutes && <Check aria-hidden="true" />}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className={itemClasses}>
          <Link href="/admin/parametres#saison">Changer la saison du site…</Link>
        </DropdownMenuItem>
        {saisons.suivante !== null && (
          <DropdownMenuItem asChild className={cn(itemClasses, 'font-semibold text-[color:var(--adm-orange-ink)]')}>
            <Link href="/admin/parametres#saison">
              <Plus aria-hidden="true" />
              Préparer {saisons.suivante}-{saisons.suivante + 1}
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** État de la synchro FFHandball : un point de couleur et une phrase, vers le journal. */
function EtatSynchro({ synchro, compact }: { synchro: SynchroEnTete; compact?: boolean }) {
  return (
    <Link
      href="/admin#synchro"
      title={synchro.detail}
      className={cn('adm-top-btn', compact && 'px-2.5')}
    >
      <StatusDot tone={synchro.tone} />
      {compact ? (
        <span className="sr-only">{synchro.detail}</span>
      ) : (
        <>
          <span className="sr-only">{synchro.detail}</span>
          <span aria-hidden="true">
            FFHandball · <span className={cn(synchro.tone === 'bad' && 'font-semibold text-[color:var(--adm-bad)]', synchro.tone === 'warn' && 'font-semibold text-[color:var(--adm-warn)]')}>{synchro.libelle}</span>
          </span>
        </>
      )}
    </Link>
  )
}

const CREATIONS = [
  { href: '/admin/articles/new', label: 'Article' },
  { href: '/admin/matchs/new', label: 'Match' },
  { href: '/admin/equipes/new', label: 'Équipe' },
  { href: '/admin/partenaires/new', label: 'Partenaire' },
]

function MenuCreer() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-[0.875rem] font-semibold text-primary-foreground transition-colors duration-150 hover:bg-[#d0640f]">
        <Plus className="size-4" aria-hidden="true" />
        Créer
        <ChevronDown className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn(menuClasses, 'min-w-48')}>
        {CREATIONS.map((creation) => (
          <DropdownMenuItem key={creation.href} asChild className={itemClasses}>
            <Link href={creation.href}>{creation.label}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MenuCompte({ user }: { user: AdminTopBarProps['user'] }) {
  const { deconnecter, enCours } = useDeconnexion()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Compte"
        className="grid size-9 place-content-center rounded-full bg-[color:var(--adm-logo)] text-[0.8125rem] font-semibold text-white"
      >
        {initiales(user)}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={menuClasses}>
        {user?.email && (
          <DropdownMenuLabel className="px-2.5 py-1.5 font-normal">
            <span className="block font-semibold">{user.name || user.email}</span>
            {user.name && <span className="block text-[0.875rem] text-muted-foreground">{user.email}</span>}
          </DropdownMenuLabel>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className={itemClasses}>
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink aria-hidden="true" />
            Voir le site
            <span className="sr-only"> (nouvel onglet)</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className={itemClasses} disabled={enCours} onSelect={() => void deconnecter()}>
          <LogOut aria-hidden="true" />
          {enCours ? 'Déconnexion…' : 'Déconnexion'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * En-tête de toutes les pages : état de la synchro FFHandball et sélecteur de
 * saison toujours visibles. Grand écran : collé en haut de la colonne de
 * travail. Téléphone : logo à gauche, synchro et saison à droite.
 */
export function AdminTopBar({ saisons, synchro, user }: AdminTopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[var(--adm-topbar)] items-center gap-2 border-b border-border bg-background px-[var(--adm-pad-x)] sm:gap-3">
      <Link href="/admin" className="flex min-h-11 items-center gap-2 lg:hidden">
        <Image src={LOGO} alt="" width={32} height={32} className="size-8 shrink-0" priority />
        <span className="font-semibold max-[420px]:sr-only">HBC Aix</span>
        <span className="sr-only"> : tableau de bord</span>
      </Link>
      <div className="flex-1" />
      <div className="max-md:hidden">
        <EtatSynchro synchro={synchro} />
      </div>
      <div className="md:hidden">
        <EtatSynchro synchro={synchro} compact />
      </div>
      <div className="max-md:hidden">
        <MenuCreer />
      </div>
      <SelecteurSaison saisons={saisons} />
      <div className="max-lg:hidden">
        <MenuCompte user={user} />
      </div>
    </header>
  )
}
