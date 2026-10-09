import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Boutons du site public : libellés en capitales condensées, orange du logo
 * avec texte noir (lisible, comme les numéros des maillots).
 */
export const siteButton = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-display font-bold uppercase tracking-wider [font-stretch:85%] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-neutral-950 hover:bg-primary-400',
        outline: 'border border-white/20 text-white hover:border-white/40 hover:bg-white/10',
        light: 'bg-white text-neutral-950 hover:bg-neutral-200',
        dark: 'bg-neutral-950 text-white hover:bg-neutral-800 focus-visible:ring-neutral-950 focus-visible:ring-offset-primary-500',
        darkOutline: 'border border-neutral-950/30 text-neutral-950 hover:bg-neutral-950/10 focus-visible:ring-neutral-950 focus-visible:ring-offset-primary-500',
        link: 'px-0 text-primary-400 hover:text-primary-300',
      },
      size: {
        sm: 'h-9 px-4 text-xs',
        md: 'h-11 px-6 text-sm',
        lg: 'h-13 px-7 text-[0.95rem]',
      },
    },
    compoundVariants: [{ variant: 'link', className: 'h-auto px-0' }],
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

export type SiteButtonProps = VariantProps<typeof siteButton>

/** Pastilles de filtre (catégories, genres…) */
export const sitePill = cva(
  'inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950',
  {
    variants: {
      active: {
        true: 'border-primary-500 bg-primary-500 text-neutral-950',
        false: 'border-white/10 bg-white/[0.03] text-neutral-300 hover:border-white/25 hover:text-white',
      },
    },
    defaultVariants: { active: false },
  }
)

/** Surface de carte sombre commune */
export const siteCard =
  'rounded-xl border border-white/10 bg-neutral-900'

export const container = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'
