import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Bouton de l'admin. Mêmes noms de variantes et de tailles que le bouton
 * shadcn : on change seulement le chemin d'import.
 *
 * - `default`     : action principale. Bloc orange, texte noir. Une par écran.
 * - `outline`     : action secondaire. Contour noir, s'inverse au survol.
 * - `ghost`       : action discrète (icône de ligne, barre d'outils).
 * - `destructive` : confirmation d'une suppression, jamais ailleurs.
 * - `link`        : lien dans une phrase.
 *
 * 44 px de haut sur téléphone (cible tactile), 40 px à partir de `md`.
 */
export const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[3px] border font-semibold leading-none',
    'transition-[background-color,border-color,color] duration-150 ease-out',
    'disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        default:
          'border-2 border-primary bg-primary text-primary-foreground hover:border-foreground active:bg-foreground active:text-background',
        outline:
          'border-foreground bg-background text-foreground hover:bg-foreground hover:text-background active:bg-foreground active:text-background aria-pressed:bg-foreground aria-pressed:text-background',
        secondary:
          'border-foreground bg-background text-foreground hover:bg-foreground hover:text-background active:bg-foreground active:text-background',
        ghost:
          'border-transparent bg-transparent text-foreground hover:bg-foreground hover:text-background active:bg-foreground active:text-background aria-pressed:bg-foreground aria-pressed:text-background data-[state=open]:bg-foreground data-[state=open]:text-background',
        destructive:
          'border-2 border-destructive bg-destructive text-white hover:border-foreground active:bg-foreground',
        link: 'adm-link h-auto border-transparent px-0 font-medium md:h-auto',
      },
      size: {
        default: 'h-11 px-4 text-[0.9375rem] md:h-10',
        sm: 'h-11 px-3 text-[0.8125rem] md:h-8',
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
