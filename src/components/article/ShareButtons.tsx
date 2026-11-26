'use client'

import { useState } from 'react'
import { Link2, Check } from 'lucide-react'
import { Icon } from '@iconify/react/offline'
import facebookIcon from '@iconify-icons/simple-icons/facebook'
import linkedinIcon from '@iconify-icons/simple-icons/linkedin'
import { toast } from 'sonner'

interface ShareButtonsProps {
  url: string
}

const boutonClass =
  'grid size-10 place-items-center rounded-full border border-zinc-700 text-white transition-colors hover:border-primary-500 hover:bg-primary-500 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400'

/** Partage en fin d'article : Facebook, LinkedIn et copie du lien. */
export function ShareButtons({ url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`

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

  return (
    <div className="flex items-center gap-2 text-neutral-400">
      <span className="mr-1 font-mono text-xs uppercase tracking-[0.1em]">Partager</span>
      <a
        href={facebook}
        target="_blank"
        rel="noopener noreferrer"
        className={boutonClass}
        aria-label="Partager sur Facebook (nouvel onglet)"
      >
        <Icon icon={facebookIcon} className="size-4" aria-hidden="true" />
      </a>
      <a
        href={linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className={boutonClass}
        aria-label="Partager sur LinkedIn (nouvel onglet)"
      >
        <Icon icon={linkedinIcon} className="size-4" aria-hidden="true" />
      </a>
      <button
        type="button"
        onClick={copyToClipboard}
        className={boutonClass}
        aria-label={copied ? 'Lien copié' : 'Copier le lien'}
      >
        {copied ? <Check className="size-4" aria-hidden="true" /> : <Link2 className="size-4" aria-hidden="true" />}
      </button>
    </div>
  )
}
