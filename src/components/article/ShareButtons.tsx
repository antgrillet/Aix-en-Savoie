'use client'

import { useState } from 'react'
import { Facebook, Linkedin, Twitter, Link2, Check } from 'lucide-react'
import { toast } from 'sonner'

interface ShareButtonsProps {
  title: string
  url: string
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
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

  const buttonClass = "flex items-center justify-center w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700 hover:border-primary-500 hover:bg-primary-500 text-neutral-400 hover:text-white transition-all duration-200 hover:scale-110"

  return (
    <>
      <div className="hidden lg:flex fixed left-8 top-1/2 -translate-y-1/2 flex-col gap-3 z-40">
        <span className="text-xs text-neutral-400 font-semibold mb-1 text-center uppercase tracking-wide">
          Partager
        </span>

        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
          aria-label="Partager sur Twitter"
        >
          <Twitter className="w-5 h-5" />
        </a>

        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
          aria-label="Partager sur Facebook"
        >
          <Facebook className="w-5 h-5" />
        </a>

        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
          aria-label="Partager sur LinkedIn"
        >
          <Linkedin className="w-5 h-5" />
        </a>

        <button
          onClick={copyToClipboard}
          className={buttonClass}
          aria-label="Copier le lien"
        >
          {copied ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
        </button>
      </div>

      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-3 px-5 py-3 bg-zinc-800/95 backdrop-blur-sm rounded-full border border-zinc-700 shadow-2xl">
          <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wide">Partager</span>

          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary-500 text-neutral-400 hover:text-white transition-all"
            aria-label="Partager sur Twitter"
          >
            <Twitter className="w-4 h-4" />
          </a>

          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary-500 text-neutral-400 hover:text-white transition-all"
            aria-label="Partager sur Facebook"
          >
            <Facebook className="w-4 h-4" />
          </a>

          <a
            href={shareLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary-500 text-neutral-400 hover:text-white transition-all"
            aria-label="Partager sur LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </a>

          <button
            onClick={copyToClipboard}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary-500 text-neutral-400 hover:text-white transition-all"
            aria-label="Copier le lien"
          >
            {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </>
  )
}
