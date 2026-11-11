'use client'

import * as React from 'react'
import {
  Select,
  SelectContent as BaseSelectContent,
  SelectGroup,
  SelectItem as BaseSelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger as BaseSelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export { Select, SelectGroup, SelectLabel, SelectSeparator, SelectValue }

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof BaseSelectTrigger>,
  React.ComponentPropsWithoutRef<typeof BaseSelectTrigger>
>(({ className, ...props }, ref) => (
  <BaseSelectTrigger
    ref={ref}
    className={cn(
      'h-11 gap-2 rounded-[3px] border-input bg-background px-3 text-left text-[0.9375rem] text-foreground transition-colors duration-150 ease-out hover:border-foreground focus:ring-0 data-[state=open]:border-foreground data-[placeholder]:text-[color:var(--adm-placeholder)] aria-[invalid=true]:border-destructive md:h-10 [&>svg]:shrink-0 [&>svg]:opacity-100',
      className
    )}
    {...props}
  />
))
SelectTrigger.displayName = 'SelectTrigger'

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof BaseSelectContent>,
  React.ComponentPropsWithoutRef<typeof BaseSelectContent>
>(({ className, ...props }, ref) => (
  <BaseSelectContent ref={ref} className={cn('rounded-[3px] border-foreground', className)} {...props} />
))
SelectContent.displayName = 'SelectContent'

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof BaseSelectItem>,
  React.ComponentPropsWithoutRef<typeof BaseSelectItem>
>(({ className, ...props }, ref) => (
  <BaseSelectItem
    ref={ref}
    className={cn('min-h-11 rounded-[2px] pl-2.5 text-[0.9375rem] md:min-h-9', className)}
    {...props}
  />
))
SelectItem.displayName = 'SelectItem'

export interface SelectOption {
  value: string
  label: string
}

interface SimpleSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: readonly SelectOption[]
  placeholder?: string
  id?: string
  name?: string
  disabled?: boolean
  /** Classes du déclencheur (largeur, par exemple `md:w-44`) */
  className?: string
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  'aria-required'?: boolean
}

/**
 * Liste déroulante en une ligne. Dans un `Field`, l'identifiant et les
 * attributs d'accessibilité arrivent tout seuls ; dans une barre de filtres,
 * donner un `aria-label`.
 */
export function SimpleSelect({
  value,
  onValueChange,
  options,
  placeholder,
  id,
  name,
  disabled,
  className,
  ...aria
}: SimpleSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} name={name} disabled={disabled}>
      <SelectTrigger id={id} className={className} {...aria}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
