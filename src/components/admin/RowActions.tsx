'use client'

import Link from 'next/link'
import { MoreVertical, type LucideIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Button } from '@/components/admin/Button'

export interface RowAction {
  label: string
  icon?: LucideIcon
  /** Lien interne, ou externe avec `external` (nouvel onglet) */
  href?: string
  external?: boolean
  onSelect?: () => void
  /** Suppression : texte rouge, à placer en dernier après un séparateur */
  destructive?: boolean
  disabled?: boolean
}

interface RowActionsProps {
  /** Nom accessible du bouton : « Actions pour {titre de la ligne} » */
  label: string
  /** Actions dans l'ordre d'usage ; `'separator'` trace un filet */
  items: (RowAction | 'separator')[]
}

const itemClasses =
  'min-h-11 cursor-pointer gap-2.5 rounded-[2px] px-2.5 text-[0.9375rem] font-medium md:min-h-9'

/** Menu d'actions d'une ligne de liste, navigable au clavier */
export function RowActions({ label, items }: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label={label}>
          <MoreVertical aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52 rounded-[3px] border-foreground p-1">
        {items.map((item, index) => {
          if (item === 'separator') {
            return <DropdownMenuSeparator key={`separator-${index}`} className="bg-border" />
          }

          const Icon = item.icon
          const classes = cn(
            itemClasses,
            item.destructive && 'text-destructive focus:bg-destructive focus:text-white'
          )
          const content = (
            <>
              {Icon && <Icon aria-hidden="true" />}
              {item.label}
            </>
          )

          if (item.href) {
            return (
              <DropdownMenuItem key={item.label} asChild disabled={item.disabled} className={classes}>
                {item.external ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer">
                    {content}
                    <span className="sr-only"> (nouvel onglet)</span>
                  </a>
                ) : (
                  <Link href={item.href}>{content}</Link>
                )}
              </DropdownMenuItem>
            )
          }

          return (
            <DropdownMenuItem
              key={item.label}
              disabled={item.disabled}
              onSelect={item.onSelect}
              className={classes}
            >
              {content}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
