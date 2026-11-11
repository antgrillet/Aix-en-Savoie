'use client'

import * as React from 'react'
import {
  Tabs,
  TabsContent as BaseTabsContent,
  TabsList as BaseTabsList,
  TabsTrigger as BaseTabsTrigger,
} from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export { Tabs }

/** Onglets à filet : un trait plein de 2 px sous l'onglet courant */
export const TabsList = React.forwardRef<
  React.ElementRef<typeof BaseTabsList>,
  React.ComponentPropsWithoutRef<typeof BaseTabsList>
>(({ className, ...props }, ref) => (
  <BaseTabsList
    ref={ref}
    className={cn(
      'flex h-auto w-full items-stretch justify-start gap-6 overflow-x-auto rounded-none border-b border-border bg-transparent p-0 text-muted-foreground',
      className
    )}
    {...props}
  />
))
TabsList.displayName = 'TabsList'

interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof BaseTabsTrigger> {
  /** Nombre d'éléments de l'onglet, affiché en chiffres tabulaires */
  count?: number
}

export const TabsTrigger = React.forwardRef<React.ElementRef<typeof BaseTabsTrigger>, TabsTriggerProps>(
  ({ className, count, children, ...props }, ref) => (
    <BaseTabsTrigger
      ref={ref}
      className={cn(
        'relative h-11 shrink-0 gap-2 rounded-none bg-transparent px-0 text-[0.9375rem] font-medium transition-colors duration-150 ease-out hover:text-foreground data-[state=active]:font-semibold data-[state=active]:text-foreground',
        'after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:origin-left after:scale-x-0 after:bg-foreground after:transition-transform after:duration-150 after:ease-out data-[state=active]:after:scale-x-100',
        className
      )}
      {...props}
    >
      {children}
      {count !== undefined && <span className="adm-num-sm">{count}</span>}
    </BaseTabsTrigger>
  )
)
TabsTrigger.displayName = 'TabsTrigger'

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof BaseTabsContent>,
  React.ComponentPropsWithoutRef<typeof BaseTabsContent>
>(({ className, ...props }, ref) => (
  <BaseTabsContent ref={ref} className={cn('mt-5', className)} {...props} />
))
TabsContent.displayName = 'TabsContent'
