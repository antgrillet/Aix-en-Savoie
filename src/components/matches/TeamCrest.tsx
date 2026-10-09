import Image from 'next/image'
import { cn } from '@/lib/utils'

interface TeamCrestProps {
  name: string
  logo?: string | null
  /** Logo du club : servi en local et optimisé */
  isHbc?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'size-9 p-1',
  md: 'size-12 p-1.5',
  lg: 'size-16 p-2',
}

/** Écusson rond d'une équipe (logo sur fond blanc ou initiales) */
export function TeamCrest({ name, logo, isHbc = false, size = 'md', className }: TeamCrestProps) {
  const src = isHbc ? '/img/home/logo.png' : logo

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        src ? 'bg-white' : 'bg-white/10 ring-1 ring-white/15',
        sizes[size],
        className
      )}
    >
      {src ? (
        <div className="relative size-full">
          <Image src={src} alt={name} fill sizes="64px" className="object-contain" unoptimized={!isHbc} />
        </div>
      ) : (
        <span className="font-display text-xs font-bold uppercase text-neutral-300">
          {name.replace(/[^A-Za-zÀ-ÿ0-9]/g, '').substring(0, 3)}
        </span>
      )}
    </div>
  )
}
