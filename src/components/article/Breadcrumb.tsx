import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbProps {
  items: {
    label: string
    href: string
  }[]
  currentPage: string
}

export function Breadcrumb({ items, currentPage }: BreadcrumbProps) {
  return (
    <nav aria-label="Fil d'ariane" className="mb-8">
      <ol className="flex items-center gap-2 text-sm text-neutral-400">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <Link
              href={item.href}
              className="hover:text-primary-500 transition-colors"
            >
              {item.label}
            </Link>
            <ChevronRight className="w-4 h-4" />
          </li>
        ))}
        <li className="text-white font-medium truncate max-w-[200px] sm:max-w-xs">
          {currentPage}
        </li>
      </ol>
    </nav>
  )
}
