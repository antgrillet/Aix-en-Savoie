'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Tag, Clock, Store, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { fadeInUp } from '@/lib/animations'

interface PromoCardProps {
  titre: string
  description?: string | null
  code?: string | null
  expiration?: Date | string | null
  conditions?: string | null
  brandColor?: string
}

export function PromoCard({
  titre,
  description,
  code,
  expiration,
  conditions,
  brandColor = '#FF6B35',
}: PromoCardProps) {
  const [copied, setCopied] = useState(false)

  const { isExpired, daysLeft } = useMemo(() => {
    if (expiration) {
      const now = new Date()
      const exp = new Date(expiration)
      const diff = exp.getTime() - now.getTime()
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
      return { isExpired: days < 0, daysLeft: days >= 0 ? days : null }
    }
    return { isExpired: false, daysLeft: null }
  }, [expiration])

  const copyToClipboard = async () => {
    if (!code) return

    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Code copie dans le presse-papiers !')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Erreur lors de la copie')
    }
  }

  // Don't render if expired
  if (isExpired) return null

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-xl"
    >
      {/* Dashed border coupon style */}
      <div
        className="border-2 border-dashed rounded-xl p-6 space-y-4"
        style={{
          borderColor: `${brandColor}60`,
          background: `linear-gradient(135deg, ${brandColor}10 0%, transparent 100%)`,
        }}
      >
        {/* Header with icon */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${brandColor}20` }}
            >
              <Tag className="w-6 h-6" style={{ color: brandColor }} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{titre}</h3>
              <p className="text-sm text-neutral-400">Offre exclusive membres HBC</p>
            </div>
          </div>

          {/* Expiration badge */}
          {daysLeft !== null && daysLeft <= 7 && (
            <div className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-amber-400 text-xs font-semibold">
              <Clock className="w-3 h-3" />
              {daysLeft === 0 ? 'Dernier jour !' : `${daysLeft}j restants`}
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-neutral-300 text-sm leading-relaxed">{description}</p>
        )}

        {/* Code section OR in-store mention */}
        {code ? (
          <div className="space-y-2">
            <p className="text-xs text-neutral-400 uppercase tracking-wide font-semibold">
              Votre code promo
            </p>
            <button
              onClick={copyToClipboard}
              className="w-full group flex items-center justify-between px-4 py-3 bg-zinc-800/60 border border-zinc-700 hover:border-primary-500 rounded-lg transition-all"
            >
              <span className="font-mono text-lg font-bold text-white tracking-wider">
                {code}
              </span>
              <div className="flex items-center gap-2 text-neutral-400 group-hover:text-primary-400 transition-colors">
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-500">Copie !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span className="text-sm">Copier</span>
                  </>
                )}
              </div>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3 bg-zinc-800/60 border border-zinc-700 rounded-lg">
            <Store className="w-5 h-5 text-primary-400" />
            <div>
              <p className="text-white font-semibold">Offre en magasin</p>
              <p className="text-sm text-neutral-400">
                Mentionnez &quot;HBC Aix-en-Savoie&quot; pour beneficier de l&apos;offre
              </p>
            </div>
          </div>
        )}

        {/* Conditions */}
        {conditions && (
          <div className="flex items-start gap-2 text-xs text-neutral-500 pt-2 border-t border-zinc-700/50">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{conditions}</p>
          </div>
        )}

        {/* Expiration date display */}
        {expiration && !isExpired && daysLeft !== null && daysLeft > 7 && (
          <p className="text-xs text-neutral-500">
            Valable jusqu&apos;au{' '}
            {new Date(expiration).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}

        {/* Decorative scissors circles (coupon style) */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-zinc-900 rounded-full" />
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-zinc-900 rounded-full" />
      </div>
    </motion.div>
  )
}
