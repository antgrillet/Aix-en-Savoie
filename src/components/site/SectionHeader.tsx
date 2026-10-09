import { cn } from '@/lib/utils'
import { Eyebrow } from './Eyebrow'

interface SectionHeaderProps {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  align?: 'left' | 'center'
  as?: 'h1' | 'h2'
  className?: string
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
  as: Heading = 'h2',
  className,
}: SectionHeaderProps) {
  const centered = align === 'center'

  return (
    <div
      className={cn(
        'mb-10 flex flex-col gap-6 md:mb-12',
        centered ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between',
        className
      )}
    >
      <div className={cn('max-w-3xl', centered && 'flex flex-col items-center')}>
        {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
        <Heading className="font-headline text-4xl text-white sm:text-5xl lg:text-6xl">{title}</Heading>
        {description && <p className="mt-4 max-w-2xl text-base text-neutral-400 md:text-lg">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
