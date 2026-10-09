'use client'

import { useState } from 'react'
import { Link2, Check } from 'lucide-react'
import { Icon } from '@iconify/react/offline'
import facebookIcon from '@iconify-icons/simple-icons/facebook'
import linkedinIcon from '@iconify-icons/simple-icons/linkedin'
import xIcon from '@iconify-icons/simple-icons/x'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ShareButtonsProps {
  title: string
  url: string
  /** `inline` : libellé et boutons sur une ligne ; `stacked` : libellé au-dessus des boutons */
  layout?: 'inline' | 'stacked'
  className?: string
}

const buttonClass =
  'inline-flex size-10 items-center justify-center rounded-md border border-white/10 text-neutral-300 transition-colors hover:border-primary-500 hover:bg-primary-500 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950'

export function ShareButtons({ title, url, layout = 'inline', className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Lien copié !')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Erreur lors de la copie')
    }
  }

  const stacked = layout === 'stacked'

  return (
    <div className={cn('flex gap-3', stacked ? 'flex-col items-start' : 'flex-wrap items-center', className)}>
      <span className="font-eyebrow text-xs text-neutral-500">{stacked ? "Partager l'article" : 'Partager'}</span>

      <ul className="flex gap-2">
        <li>
          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass}
            aria-label="Partager sur Facebook"
          >
            <Icon icon={facebookIcon} className="size-4" />
          </a>
        </li>
        <li>
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass}
            aria-label="Partager sur X (Twitter)"
          >
            <Icon icon={xIcon} className="size-4" />
          </a>
        </li>
        <li>
          <a
            href={shareLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass}
            aria-label="Partager sur LinkedIn"
          >
            <Icon icon={linkedinIcon} className="size-4" />
          </a>
        </li>
        <li>
          <button
            type="button"
            onClick={copyToClipboard}
            className={cn(buttonClass, copied && 'border-primary-500 text-primary-400')}
            aria-label={copied ? 'Lien copié' : 'Copier le lien'}
          >
            {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
          </button>
        </li>
      </ul>

      {/* Confirmation visible même sans système de notifications sur la page */}
      <span
        aria-live="polite"
        className={cn('text-xs font-medium text-primary-400', !copied && 'sr-only')}
      >
        {copied ? 'Lien copié !' : ''}
      </span>
    </div>
  )
}
