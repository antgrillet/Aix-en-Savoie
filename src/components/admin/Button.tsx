import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Bouton de l'admin. Mêmes noms de variantes et de tailles que le bouton
 * shadcn : on change seulement le chemin d'import.
 *
 * - `default`     : action principale. Orange du club, texte noir. Une par écran.
 * - `outline`     : action secondaire. Bouton blanc à bord clair.
 * - `ghost`       : action discrète (icône de ligne, barre d'outils).
 * - `destructive` : confirmation d'une suppression, jamais ailleurs.
 * - `link`        : lien dans une phrase.
 *
 * 44 px de haut sur téléphone (cible tactile), 40 px à partir de `md`.
 */
export const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border font-semibold leading-none',
    'transition-[background-color,border-color,color] duration-150 ease-out',
    'disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        default:
          'border-primary bg-primary text-primary-foreground hover:border-[#d0640f] hover:bg-[#d0640f] active:bg-[#b9580c]',
        outline:
          'border-border bg-background text-foreground hover:border-[color:var(--adm-control)] hover:bg-muted active:bg-[#ece9e2] aria-pressed:border-[color:var(--adm-logo)] aria-pressed:bg-[color:var(--adm-logo)] aria-pressed:text-white',
        secondary:
          'border-transparent bg-secondary text-foreground hover:bg-[#e2dfd7] active:bg-[#d9d5cb]',
        ghost:
          'border-transparent bg-transparent text-foreground hover:bg-muted active:bg-[#ece9e2] aria-pressed:bg-muted data-[state=open]:bg-muted',
        destructive:
          'border-destructive bg-destructive text-white hover:border-[#951c13] hover:bg-[#951c13] active:bg-[#7d170f]',
        link: 'adm-link h-auto border-transparent px-0 font-medium md:h-auto',
      },
      size: {
        default: 'h-11 px-4 text-[0.9375rem] md:h-10',
        sm: 'h-11 px-3 text-[0.875rem] md:h-9',
        lg: 'h-12 px-6 text-base',
        icon: 'size-11 px-0 md:size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Affiche l'indicateur de chargement et désactive le bouton */
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, disabled, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className)

    if (asChild) {
      return (
        <Slot className={classes} ref={ref} {...props}>
          {children}
        </Slot>
      )
    }

    return (
      <button
        className={classes}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading && <Loader2 className="animate-spin" aria-hidden="true" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
