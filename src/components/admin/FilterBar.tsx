'use client'

import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/admin/Button'

interface ListCountProps {
  /** Nombre d'éléments affichés */
  shown: number
  /** Nombre total avant filtrage ; omis si la liste n'est pas filtrable */
  total?: number
  singular: string
  plural: string
  className?: string
}

/**
 * Annonce le compte de la liste, en chiffres tabulaires, à droite. Lu aussi
 * par les lecteurs d'écran quand un filtre change le résultat.
 */
export function ListCount({ shown, total, singular, plural, className }: ListCountProps) {
  const filtered = total !== undefined && total !== shown
  const reference = filtered ? total : shown

  return (
    <p role="status" className={cn('adm-meta whitespace-nowrap', className)}>
      <span className="adm-num-sm text-foreground">{shown}</span>
      {filtered && (
        <>
          {' sur '}
          <span className="adm-num-sm text-foreground">{total}</span>
        </>
      )}{' '}
      {reference > 1 ? plural : singular}
    </p>
  )
}

interface FilterBarProps {
  /** Nom accessible de la zone : « Filtrer les articles » */
  label: string
  /**
   * Champ de recherche et listes de filtres. Envelopper deux listes dans
   * `<FilterGroup>` les place côte à côte sur téléphone.
   */
  children: React.ReactNode
  /** Compte de la liste, poussé à droite */
  count?: ListCountProps
  /** Si présent, affiche « Effacer les filtres » */
  onReset?: () => void
  className?: string
}

/** Barre de filtres d'une liste : recherche, filtres, remise à zéro, compte. */
export function FilterBar({ label, children, count, onReset, className }: FilterBarProps) {
  return (
    <div
      role="search"
      aria-label={label}
      className={cn('mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center', className)}
    >
      {children}
      {onReset && (
        <Button type="button" variant="ghost" size="sm" onClick={onReset} className="self-start md:self-auto">
          <X aria-hidden="true" />
          Effacer les filtres
        </Button>
      )}
      {count && <ListCount {...count} className="self-end md:ml-auto md:self-auto" />}
    </div>
  )
}

/** Deux filtres côte à côte sur téléphone, à plat dans la barre à partir de `md` */
export function FilterGroup({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 md:contents">{children}</div>
}

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  /** Nom accessible du champ : « Rechercher un article » */
  label: string
  placeholder?: string
  className?: string
}

/** Champ de recherche avec bouton d'effacement */
export function SearchField({ value, onChange, label, placeholder, className }: SearchFieldProps) {
  return (
    <div className={cn('relative w-full md:max-w-xs md:flex-1', className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        placeholder={placeholder ?? label}
        className="h-11 w-full rounded-[3px] border border-input bg-background pl-9 pr-10 text-base text-foreground transition-colors duration-150 ease-out hover:border-foreground focus-visible:border-foreground md:h-10 md:text-[0.9375rem] [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value !== '' && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Effacer la recherche"
          className="absolute right-0 top-0 grid size-11 place-content-center rounded-[3px] text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground md:size-10"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
