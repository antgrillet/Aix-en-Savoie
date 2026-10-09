'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Eyebrow } from '@/components/site/Eyebrow'
import { container, siteButton } from '@/components/site/styles'
import { cn } from '@/lib/utils'

interface HeroWelcomeProps {
  backgroundImage?: string | null
  children?: React.ReactNode
}

export function HeroWelcome({ backgroundImage, children }: HeroWelcomeProps) {
  const shouldReduceMotion = useReducedMotion()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
        delayChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.6, ease: 'easeOut' as const },
    },
  }

  return (
    <section className="relative isolate flex min-h-[92svh] items-center overflow-hidden bg-neutral-950">
      <div aria-hidden className="absolute inset-0 -z-10">
        {backgroundImage && (
          <Image src={backgroundImage} alt="" fill priority sizes="100vw" className="object-cover opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-neutral-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/70" />
        <div className="absolute inset-0 bg-stripes" />
      </div>

      <div className={cn(container, 'grid items-center gap-12 pb-16 pt-32 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:pb-24 lg:pt-36')}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants}>
            <Eyebrow>Club de handball depuis 1964</Eyebrow>
          </motion.div>

          <motion.h1 variants={itemVariants} className="mt-6 font-headline text-white">
            <span className="block text-2xl text-neutral-300 sm:text-3xl">Bienvenue au</span>
            <span className="mt-2 block text-[3.25rem] sm:text-7xl xl:text-8xl">
              HBC <span className="whitespace-nowrap text-primary-500">Aix-en-Savoie</span>
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="mt-6 max-w-xl text-lg text-neutral-300">
            Une solide institution sportive aixoise, passionnée par le handball et dédiée à la formation de
            jeunes talents.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/contact?sujet=inscription" className={cn(siteButton({ size: 'lg' }), 'group')}>
              Inscrire un joueur
              <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link href="/equipes" className={siteButton({ variant: 'outline', size: 'lg' })}>
              Découvrir nos équipes
            </Link>
          </motion.div>
        </motion.div>

        {children && (
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: shouldReduceMotion ? 0 : 0.35 }}
            className="w-full"
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  )
}
