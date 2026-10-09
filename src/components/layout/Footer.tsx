import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, Mail, MapPin } from 'lucide-react'
import { Icon } from '@iconify/react/offline'
import facebookIcon from '@iconify-icons/simple-icons/facebook'
import instagramIcon from '@iconify-icons/simple-icons/instagram'
import { ADDRESS_LINES, CONTACT_EMAIL, SHOP_URL, SOCIAL_LINKS } from '@/lib/site'
import { container } from '@/components/site/styles'
import { cn } from '@/lib/utils'

const columns = [
  {
    title: 'Le club',
    links: [
      { name: 'Actualités', href: '/actus' },
      { name: 'Nos équipes', href: '/equipes' },
      { name: 'Partenaires', href: '/partenaires' },
      { name: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Participer',
    links: [
      { name: "S'inscrire", href: '/contact?sujet=inscription' },
      { name: 'Devenir partenaire', href: '/contact?sujet=partenariat' },
      { name: 'Espace bénévoles', href: '/calendrier' },
      { name: 'Boutique', href: SHOP_URL, external: true },
    ],
  },
]

const linkClass =
  'inline-flex items-center gap-1 rounded-sm text-sm text-neutral-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-neutral-950 text-white">
      <div className={cn(container, 'relative z-10 pt-16 pb-10 md:pt-20')}>
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-4 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <Image src="/img/home/logo.png" alt="" width={72} height={72} className="size-16 object-contain" />
              <span className="flex flex-col leading-none">
                <span className="font-headline text-3xl">HBC</span>
                <span className="font-eyebrow text-xs text-primary-400">Aix-en-Savoie</span>
              </span>
            </Link>
            <p className="mt-6 max-w-xs text-sm text-neutral-400">
              Club de handball passionné, engagé dans la formation et le développement des jeunes talents.
            </p>
            <div className="mt-6 flex gap-2">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex size-10 items-center justify-center rounded-md border border-white/10 text-neutral-300 transition-colors hover:border-primary-500 hover:bg-primary-500 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <Icon icon={facebookIcon} className="size-4" />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex size-10 items-center justify-center rounded-md border border-white/10 text-neutral-300 transition-colors hover:border-primary-500 hover:bg-primary-500 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <Icon icon={instagramIcon} className="size-4" />
              </a>
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="font-eyebrow text-xs text-neutral-500">{column.title}</h2>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.name}>
                    {'external' in link && link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                        {link.name}
                        <ArrowUpRight className="size-3.5" />
                      </a>
                    ) : (
                      <Link href={link.href} className={linkClass}>
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="font-eyebrow text-xs text-neutral-500">Nous trouver</h2>
            <ul className="mt-5 space-y-4 text-sm text-neutral-400">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary-500" />
                <address className="not-italic">
                  {ADDRESS_LINES.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-primary-500" />
                <a href={`mailto:${CONTACT_EMAIL}`} className={cn(linkClass, 'break-all')}>
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between">
          <p>&copy; {currentYear} HBC Aix-en-Savoie. Tous droits réservés.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/mentions-legales" className={linkClass}>
              Mentions légales
            </Link>
            <Link href="/politique-confidentialite" className={linkClass}>
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </div>

      {/* Grand lettrage décoratif */}
      <p
        aria-hidden
        className="pointer-events-none -mb-[0.12em] select-none whitespace-nowrap text-center font-headline text-[13vw] leading-none text-white/[0.04]"
      >
        Aix-en-Savoie
      </p>
    </footer>
  )
}
