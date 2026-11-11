'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { Check, CircleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

/* --------------------------------------------------------------------------
 * Champ : libellé, aide, erreur, place restante
 * ------------------------------------------------------------------------ */

interface FieldProps {
  /** Identifiant du contrôle : relie le libellé, l'aide et l'erreur au champ */
  id: string
  label: React.ReactNode
  /** Aide permanente sous le champ : format attendu, où la valeur apparaît */
  hint?: React.ReactNode
  /** Message d'erreur : dit le problème et comment le corriger */
  error?: React.ReactNode
  required?: boolean
  /** Affiche « facultatif » à côté du libellé */
  optional?: boolean
  /** Place restante pour un champ limité, affichée à droite du libellé */
  counter?: { value: number; max: number }
  className?: string
  children: React.ReactNode
}

const NATIVE_CONTROLS = ['input', 'textarea', 'select', 'button']

/**
 * Enveloppe un contrôle. Si l'enfant est un composant unique (Input, Textarea,
 * SimpleSelect, ImageUpload, RichTextEditor…), `id`, `aria-describedby`,
 * `aria-invalid` et `aria-required` lui sont transmis : inutile de les répéter.
 * Si l'enfant est un groupe (un `div` avec un champ et un bouton), poser `id`
 * et `aria-describedby="{id}-aide"` sur le champ à la main.
 */
export function Field({
  id,
  label,
  hint,
  error,
  required,
  optional,
  counter,
  className,
  children,
}: FieldProps) {
  const hintId = hint ? `${id}-aide` : undefined
  const errorId = error ? `${id}-erreur` : undefined
  const counterId = counter ? `${id}-place` : undefined
  const describedBy = [errorId, hintId, counterId].filter(Boolean).join(' ') || undefined
  const remaining = counter ? counter.max - counter.value : 0

  // Un enfant unique reçoit le câblage, sauf si c'est une simple balise
  // d'habillage (div, span…) : dans ce cas, poser `id` sur le contrôle à la main.
  const isControl =
    React.isValidElement<Record<string, unknown>>(children) &&
    (typeof children.type !== 'string' || NATIVE_CONTROLS.includes(children.type))

  const control = isControl
    ? React.cloneElement(children, {
        id: children.props.id ?? id,
        'aria-describedby': children.props['aria-describedby'] ?? describedBy,
        'aria-invalid': children.props['aria-invalid'] ?? (error ? true : undefined),
        'aria-required': children.props['aria-required'] ?? (required ? true : undefined),
      })
    : children

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[0.9375rem] font-semibold leading-snug">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5">
              {' '}
              *
            </span>
          )}
          {optional && <span className="ml-1.5 font-normal text-muted-foreground">facultatif</span>}
        </label>
        {counter && (
          <span
            id={counterId}
            className={cn(
              'shrink-0 text-xs',
              remaining < 0 ? 'font-semibold text-destructive' : 'text-muted-foreground'
            )}
          >
            {remaining < 0
              ? `${-remaining} caractère${-remaining > 1 ? 's' : ''} en trop`
              : `${remaining} restant${remaining > 1 ? 's' : ''}`}
            <span className="sr-only"> sur {counter.max} caractères</span>
          </span>
        )}
      </div>

      {control}

      {error && (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-[0.8125rem] font-medium text-destructive">
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
      {hint && (
        <p id={hintId} className="adm-meta">
          {hint}
        </p>
      )}
    </div>
  )
}

/* --------------------------------------------------------------------------
 * Contrôles de saisie
 * ------------------------------------------------------------------------ */

const controlBase =
  'w-full rounded-[3px] border border-input bg-background text-base text-foreground transition-colors duration-150 ease-out hover:border-foreground focus-visible:border-foreground disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-input aria-[invalid=true]:border-destructive md:text-[0.9375rem]'

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => (
    <input ref={ref} type={type} className={cn(controlBase, 'flex h-11 px-3 md:h-10', className)} {...props} />
  )
)
Input.displayName = 'Input'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(controlBase, 'block min-h-24 px-3 py-2.5 leading-normal', className)} {...props} />
  )
)
Textarea.displayName = 'Textarea'

/** Libellé seul, pour un contrôle qui n'est pas dans un `Field` */
export const Label = React.forwardRef<HTMLLabelElement, React.ComponentProps<'label'>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn('text-[0.9375rem] font-semibold leading-snug', className)} {...props} />
  )
)
Label.displayName = 'Label'

/* --------------------------------------------------------------------------
 * Case à cocher et bascule : cochée = bloc noir plein (état confirmé)
 * ------------------------------------------------------------------------ */

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer relative grid size-5 shrink-0 place-content-center rounded-[2px] border before:absolute before:-inset-3 before:content-[""] border-foreground bg-background text-background transition-colors duration-150 ease-out hover:border-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-foreground',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="grid place-content-center">
      <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = 'Checkbox'

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'peer relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-[3px] border before:absolute before:-inset-y-2.5 before:inset-x-0 before:content-[""] border-foreground bg-background transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-foreground',
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="pointer-events-none block size-4 translate-x-[3px] rounded-[1px] bg-foreground transition-transform duration-150 ease-out data-[state=checked]:translate-x-[23px] data-[state=checked]:bg-background" />
  </SwitchPrimitive.Root>
))
Switch.displayName = 'Switch'

interface ChoiceRowProps {
  id: string
  label: React.ReactNode
  /** Ce que le réglage change, en une phrase */
  description?: React.ReactNode
  /** Marque de statut ou mention affichée avant le contrôle */
  aside?: React.ReactNode
  className?: string
}

function ChoiceRow({
  id,
  label,
  description,
  aside,
  className,
  children,
}: ChoiceRowProps & { children: React.ReactNode }) {
  return (
    <div className={cn('flex min-h-14 items-center gap-4 border-b border-border py-2.5', className)}>
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="block cursor-pointer text-[0.9375rem] font-semibold leading-snug">
          {label}
        </label>
        {description && (
          <p id={`${id}-aide`} className="adm-meta mt-0.5">
            {description}
          </p>
        )}
      </div>
      {aside}
      {children}
    </div>
  )
}

interface SwitchFieldProps
  extends ChoiceRowProps,
    Omit<React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>, 'id' | 'className'> {}

/** Ligne de réglage : libellé et explication à gauche, bascule à droite */
export function SwitchField({ id, label, description, aside, className, ...props }: SwitchFieldProps) {
  return (
    <ChoiceRow id={id} label={label} description={description} aside={aside} className={className}>
      <Switch id={id} aria-describedby={description ? `${id}-aide` : undefined} {...props} />
    </ChoiceRow>
  )
}

interface CheckboxFieldProps
  extends ChoiceRowProps,
    Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'id' | 'className'> {}

/** Ligne de réglage avec case à cocher */
export function CheckboxField({ id, label, description, aside, className, ...props }: CheckboxFieldProps) {
  return (
    <ChoiceRow id={id} label={label} description={description} aside={aside} className={className}>
      <Checkbox id={id} aria-describedby={description ? `${id}-aide` : undefined} {...props} />
    </ChoiceRow>
  )
}
