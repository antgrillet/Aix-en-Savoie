'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronRight } from 'lucide-react'
import { mobileMenuContainer, mobileMenuItem } from '@/lib/animations'

interface NavigationItem {
  name: string
  href: string
  external?: boolean
}

const leftNavigation: NavigationItem[] = [
  { name: 'Inscription', href: '/contact' },
  { name: 'Boutique', href: 'https://sports-services-conseils.fr/clubs/hbc-aix-en-savoie/', external: true },
]

const mainNavigation: NavigationItem[] = [
  { name: 'Nos actus', href: '/actus' },
  { name: 'Nos équipes', href: '/equipes' },
  { name: 'Calendrier', href: '/calendrier' },
  { name: 'Nos partenaires', href: '/partenaires' },
  { name: 'Contact', href: '/contact' },
]

const allNavigation: NavigationItem[] = [
  { name: 'Accueil', href: '/' },
  ...leftNavigation,
  ...mainNavigation,
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Mettre à jour isScrolled
      setIsScrolled(currentScrollY > 50)

      // Si on est tout en haut, toujours visible
      if (currentScrollY < 10) {
        setIsVisible(true)
      }
      // Si on scroll vers le bas, cacher le header
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      }
      // Si on scroll vers le haut, afficher le header
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <>
      <header
        className={`top-0 left-0 right-0 transition-all duration-500 ${
          isScrolled
            ? 'header-scrolled fixed'
            : 'absolute bg-black/30 backdrop-blur-md border-b border-white/10'
        } ${
          !isVisible && !isMobileMenuOpen ? '-translate-y-full' : 'translate-y-0'
        } ${
          isMobileMenuOpen ? 'z-[70]' : 'z-40'
        }`}
        style={{ transition: 'transform 0.3s ease-in-out' }}
      >
        <div className="px-4 xl:px-8 py-3 md:py-4 transition-all duration-300">
          <div className="flex items-center justify-between">
            {/* Left Side: Logo + Left Navigation */}
            <div className="flex items-center gap-8 md:gap-16">
              {/* Modern Logo */}
              <Link
                href="/"
                aria-label="Accueil"
                className="group relative z-10"
              >
                <div className="relative">
                  {/* Glow effect background */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500" />

                  {/* Logo container with glassmorphism */}
                  <div className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 group-hover:border-orange-500/50 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 shadow-xl">
                    <Image
                      src="/img/home/logo.png"
                      alt="Logo HBC Aix-en-Savoie"
                      width={80}
                      height={80}
                      className="w-12 h-12 md:w-16 md:h-16 object-contain transition-all duration-500 group-hover:scale-105"
                      priority
                    />

                    {/* Orange accent dot */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-lg shadow-orange-500/50 animate-pulse" />
                  </div>
                </div>
              </Link>

              {/* Left Navigation Links (Desktop) */}
              <div className="hidden xl:flex gap-8">
                {leftNavigation.map((item) =>
                  item.external ? (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nav-link font-mont font-bold uppercase text-sm tracking-wide"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="nav-link font-mont font-bold uppercase text-sm tracking-wide"
                    >
                      {item.name}
                    </Link>
                  )
                )}
              </div>
            </div>

            {/* Right Side: Main Navigation (Desktop) */}
            <nav className="hidden xl:flex items-center gap-12 md:gap-16">
              {mainNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="nav-link text-base"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`xl:hidden transition-all duration-200 hover:scale-110 ${
                isMobileMenuOpen
                  ? 'fixed top-4 right-4 z-[60] p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20'
                  : 'relative z-50 p-2'
              }`}
              aria-label="Menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">{isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
              {isMobileMenuOpen ? (
                <X className="w-7 h-7 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Outside header */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuContainer}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-gradient-to-br from-black/95 via-zinc-900/95 to-black/95 backdrop-blur-xl z-[45] overflow-auto pt-24"
          >
            <nav className="p-6">
              <ul className="space-y-1">
                {allNavigation.map((item, index) => (
                  <motion.li
                    key={item.name}
                    variants={mobileMenuItem}
                    custom={index}
                    className="relative overflow-hidden"
                  >
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block py-5 px-6 text-white hover:text-orange-500 transition-all transform hover:translate-x-2 duration-300 flex items-center justify-between font-mont text-2xl font-bold rounded-xl hover:bg-white/5"
                      >
                        <span>{item.name}</span>
                        <ChevronRight className="h-6 w-6 group-hover:text-orange-500 transition-colors" />
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="group block py-5 px-6 text-white hover:text-orange-500 transition-all transform hover:translate-x-2 duration-300 flex items-center justify-between font-mont text-2xl font-bold rounded-xl hover:bg-white/5"
                      >
                        <span>{item.name}</span>
                        <ChevronRight className="h-6 w-6 group-hover:text-orange-500 transition-colors" />
                      </Link>
                    )}
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
                  </motion.li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
