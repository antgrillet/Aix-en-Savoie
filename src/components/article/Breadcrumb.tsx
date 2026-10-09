import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbProps {
  items: {
    label: string
    href: string
  }[]
  currentPage: string
  className?: string
}

export function Breadcrumb({ items, currentPage, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Fil d'ariane" className={className}>
      <ol className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-neutral-400">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <Link
              href={item.href}
              className="rounded-sm transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {item.label}
            </Link>
            <ChevronRight aria-hidden className="size-3.5 text-neutral-600" />
          </li>
        ))}
        <li aria-current="page" className={cn('min-w-0 max-w-full truncate text-neutral-200 sm:max-w-sm')}>
          {currentPage}
        </li>
      </ol>
    </nav>
  )
}
