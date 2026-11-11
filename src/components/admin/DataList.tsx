import Image from 'next/image'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DataColumn<T> {
  id: string
  /** En-tête de colonne (grand écran) */
  header: string
  /**
   * Contenu de la cellule. Donner la classe `adm-row-link` au lien principal
   * de la ligne : sur téléphone, toute la ligne devient alors cliquable.
   */
  cell: (item: T) => React.ReactNode
  align?: 'start' | 'end'
  /** Classes de la colonne sur grand écran : largeur, `hidden lg:table-cell`… */
  className?: string
  /**
   * Place de la valeur dans la ligne du téléphone :
   * `title` (une seule colonne), `meta` (ligne grise sous le titre, par défaut),
   * `marks` (rangée de marques de statut), `hidden`.
   */
  phone?: 'title' | 'meta' | 'marks' | 'hidden'
}

interface DataListProps<T> {
  /** Nom accessible du tableau : « Articles » */
  caption: string
  items: T[]
  columns: DataColumn<T>[]
  getKey: (item: T) => string | number
  /** Vignette à gauche de la ligne */
  media?: (item: T) => React.ReactNode
  /** Menu d'actions à droite de la ligne (`RowActions`) */
  actions?: (item: T) => React.ReactNode
  /** Rendu quand `items` est vide (`EmptyState`) */
  empty?: React.ReactNode
  className?: string
}

/**
 * Liste à filets. Tableau à partir de `md`, lignes empilées en dessous : la
 * même définition de colonnes sert les deux. Pas de carte, pas de fond : un
 * filet entre les lignes, noir au survol.
 */
export function DataList<T>({
  caption,
  items,
  columns,
  getKey,
  media,
  actions,
  empty,
  className,
}: DataListProps<T>) {
  if (items.length === 0) {
    return <div className={className}>{empty}</div>
  }

  const titleColumn = columns.find((column) => column.phone === 'title') ?? columns[0]
  const metaColumns = columns.filter(
    (column) => column !== titleColumn && (column.phone ?? 'meta') === 'meta'
  )
  const markColumns = columns.filter((column) => column !== titleColumn && column.phone === 'marks')

  return (
    <div className={className}>
      {/* Grand écran : tableau */}
      <table className="adm-table hidden md:table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {media && (
              <th scope="col" className="w-16">
                <span className="sr-only">Image</span>
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={cn(column.align === 'end' && 'text-right', column.className)}
              >
                {column.header}
              </th>
            ))}
            {actions && (
              <th scope="col" className="w-12">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={getKey(item)}>
              {media && <td>{media(item)}</td>}
              {columns.map((column) => (
                <td key={column.id} className={cn(column.align === 'end' && 'text-right', column.className)}>
                  {column.cell(item)}
                </td>
              ))}
              {actions && <td className="text-right">{actions(item)}</td>}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Téléphone : lignes empilées */}
      <ul className="adm-rows border-t border-foreground md:hidden" aria-label={caption}>
        {items.map((item) => (
          <li key={getKey(item)} className="relative flex gap-3 py-3">
            {media && <div className="shrink-0 pt-0.5">{media(item)}</div>}
            <div className="min-w-0 flex-1">
              <div className="font-semibold leading-snug">{titleColumn.cell(item)}</div>
              {metaColumns.length > 0 && (
                // Le point médian vit dans la marge gauche de chaque élément : en début
                // de ligne il tombe hors du cadre et disparaît, jamais de « · » orphelin
                <div className="adm-meta mt-0.5 [clip-path:inset(-4px_-4px_-4px_0)]">
                  <div className="-ml-4 flex flex-wrap">
                    {metaColumns.map((column) => (
                      <span
                        key={column.id}
                        className="relative pl-4 before:absolute before:left-1.5 before:content-['·']"
                      >
                        <span className="sr-only">{column.header} : </span>
                        {column.cell(item)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {markColumns.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {markColumns.map((column) => (
                    <span key={column.id} className="contents">
                      {column.cell(item)}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {actions && <div className="relative z-10 -mr-2 -mt-1.5 shrink-0">{actions(item)}</div>}
          </li>
        ))}
      </ul>
    </div>
  )
}

interface ThumbProps {
  src?: string | null
  /** Vide si la vignette répète le titre de la ligne */
  alt?: string
  /** `contain` pour un logo, `cover` (défaut) pour une photo */
  fit?: 'cover' | 'contain'
  className?: string
}

/** Vignette carrée d'une ligne de liste */
export function Thumb({ src, alt = '', fit = 'cover', className }: ThumbProps) {
  return (
    <span
      className={cn(
        'relative grid size-12 place-content-center overflow-hidden rounded-[2px] border border-border bg-background text-muted-foreground',
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="48px"
          // Le liseré sombre garde lisible un logo blanc sur fond transparent
          className={
            fit === 'contain'
              ? 'object-contain p-1 [filter:drop-shadow(0_0_0.5px_rgb(34_34_33/0.9))]'
              : 'object-cover'
          }
        />
      ) : (
        <ImageOff className="size-4" aria-hidden="true" />
      )}
    </span>
  )
}
