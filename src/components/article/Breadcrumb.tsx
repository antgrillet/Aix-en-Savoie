import Link from 'next/link'

interface BreadcrumbProps {
  items: {
    label: string
    href: string
  }[]
}

/** Fil d'Ariane discret : « Accueil / Actualités ». */
export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Fil d'Ariane" className="mb-5">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-neutral-400">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            <Link href={item.href} className="transition-colors hover:text-primary-400">
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}
