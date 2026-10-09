'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { siteButton } from '@/components/site/styles'
import { SHOP_URL } from '@/lib/site'

const navigation = [
  { name: 'Actualités', href: '/actus' },
  { name: 'Équipes', href: '/equipes' },
  { name: 'Partenaires', href: '/partenaires' },
  { name: 'Bénévoles', href: '/calendrier' },
  { name: 'Contact', href: '/contact' },
]

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Header() {
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Bloque le défilement de la page quand le menu mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  const solid = isScrolled || isMenuOpen

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300',
          solid
            ? 'border-b border-white/10 bg-neutral-950/90 backdrop-blur-xl'
            : 'border-b border-transparent bg-gradient-to-b from-neutral-950/80 to-transparent'
        )}
      >
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="HBC Aix-en-Savoie — accueil"
            className="group flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            onClick={() => setIsMenuOpen(false)}
          >
            <Image
              src="/img/home/logo.png"
              alt=""
              width={52}
              height={52}
              priority
              className="size-11 object-contain transition-transform duration-300 group-hover:scale-105 md:size-13"
            />
            <span className="hidden flex-col leading-none sm:flex lg:hidden xl:flex">
              <span className="font-headline text-xl text-white">HBC</span>
              <span className="font-eyebrow text-[0.65rem] text-primary-400">Aix-en-Savoie</span>
            </span>
          </Link>

          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navigation.map((item) => {
                const active = isActive(pathname, item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'relative rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                        active ? 'text-white' : 'text-neutral-300 hover:text-white'
                      )}
                    >
                      {item.name}
                      <span
                        aria-hidden
                        className={cn(
                          'absolute inset-x-3 -bottom-0.5 h-0.5 origin-left bg-primary-500 transition-transform duration-300',
                          active ? 'scale-x-100' : 'scale-x-0'
                        )}
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <a
              href={SHOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={siteButton({ variant: 'outline', size: 'sm' })}
            >
              Boutique
              <ArrowUpRight />
            </a>
            <Link href="/contact?sujet=inscription" className={siteButton({ size: 'sm' })}>
              S&apos;inscrire
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="-mr-2 inline-flex size-11 items-center justify-center rounded-md text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 lg:hidden"
            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 bottom-0 top-18 z-40 overflow-y-auto bg-neutral-950 bg-stripes lg:hidden"
          >
            <nav aria-label="Navigation mobile" className="flex min-h-full flex-col px-4 pb-8 pt-6 sm:px-6">
              <ul className="divide-y divide-white/10 border-y border-white/10">
                {[{ name: 'Accueil', href: '/' }, ...navigation].map((item, index) => {
                  const active = item.href === '/' ? pathname === '/' : isActive(pathname, item.href)
                  return (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: shouldReduceMotion ? 0 : 0.03 * index }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex items-center justify-between py-4 font-headline text-4xl transition-colors focus-visible:outline-none focus-visible:text-primary-400',
                          active ? 'text-primary-400' : 'text-white hover:text-primary-400'
                        )}
                      >
                        {item.name}
                        <span aria-hidden className="font-eyebrow text-xs text-neutral-500">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </Link>
                    </motion.li>
                  )
                })}
              </ul>

              <div className="mt-auto grid gap-3 pt-10 sm:grid-cols-2">
                <Link
                  href="/contact?sujet=inscription"
                  onClick={() => setIsMenuOpen(false)}
                  className={siteButton({ size: 'lg' })}
                >
                  S&apos;inscrire au club
                </Link>
                <a
                  href={SHOP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={siteButton({ variant: 'outline', size: 'lg' })}
                >
                  Boutique
                  <ArrowUpRight />
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
