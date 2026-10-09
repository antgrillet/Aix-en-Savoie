'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { signOut } from '@/lib/auth-client'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  ArrowUpRight,
  ClipboardList,
  Handshake,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Newspaper,
  Settings,
  Trophy,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sections = [
  {
    title: null,
    items: [{ name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard, exact: true }],
  },
  {
    title: 'Contenu',
    items: [
      { name: 'Articles', href: '/admin/articles', icon: Newspaper },
      { name: 'Équipes', href: '/admin/equipes', icon: Users },
      { name: 'Matchs', href: '/admin/matchs', icon: Trophy },
      { name: 'Partenaires', href: '/admin/partenaires', icon: Handshake },
    ],
  },
  {
    title: 'Club',
    items: [
      { name: 'Inscriptions bénévoles', href: '/admin/inscriptions', icon: ClipboardList },
      { name: 'Messages', href: '/admin/messages', icon: MessageSquare, counter: 'messages' as const },
    ],
  },
  {
    title: 'Réglages',
    items: [{ name: 'Paramètres', href: '/admin/parametres', icon: Settings }],
  },
]

interface AdminNavProps {
  user: { name?: string | null; email: string }
  unreadMessages: number
}

function NavContent({ pathname, unreadMessages, user, onNavigate, onLogout }: {
  pathname: string
  unreadMessages: number
  user: AdminNavProps['user']
  onNavigate?: () => void
  onLogout: () => void
}) {
  return (
    <div className="flex h-full flex-col bg-neutral-950 text-neutral-300">
      <Link
        href="/admin"
        onClick={onNavigate}
        className="flex items-center gap-3 px-5 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
      >
        <Image src="/img/home/logo.png" alt="" width={40} height={40} priority className="size-10 object-contain" />
        <span className="leading-tight">
          <span className="block font-display text-sm font-bold text-white">HBC Aix-en-Savoie</span>
          <span className="block text-xs text-neutral-500">Administration</span>
        </span>
      </Link>

      <nav aria-label="Administration" className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {sections.map((section, index) => (
          <div key={section.title ?? index}>
            {section.title && (
              <p className="mb-2 px-3 text-[0.7rem] font-semibold uppercase tracking-wider text-neutral-500">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const active =
                  'exact' in item && item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
                const count = 'counter' in item && item.counter === 'messages' ? unreadMessages : 0

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                        active ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'
                      )}
                    >
                      {active && <span aria-hidden className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary-500" />}
                      <Icon className={cn('size-4 shrink-0', active ? 'text-primary-400' : 'text-neutral-500 group-hover:text-neutral-300')} />
                      <span className="flex-1 truncate">{item.name}</span>
                      {count > 0 && (
                        <span className="rounded-full bg-primary-500 px-1.5 py-0.5 text-[0.65rem] font-bold leading-none text-neutral-950">
                          {count}
                          <span className="sr-only"> non lus</span>
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <ArrowUpRight className="size-4 text-neutral-500" />
          Voir le site
        </a>
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-500 text-xs font-bold uppercase text-neutral-950">
            {(user.name || user.email).charAt(0)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-white">{user.name || 'Administrateur'}</span>
            <span className="block truncate text-xs text-neutral-500">{user.email}</span>
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            title="Déconnexion"
          >
            <LogOut className="size-4" />
            <span className="sr-only">Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function AdminNav({ user, unreadMessages }: AdminNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Barre latérale fixe (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/10 lg:block">
        <NavContent pathname={pathname} unreadMessages={unreadMessages} user={user} onLogout={handleLogout} />
      </aside>

      {/* Barre supérieure (mobile) */}
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-white/10 bg-neutral-950 px-4 lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="-ml-1.5 rounded-md p-1.5 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <Menu className="size-5" />
              <span className="sr-only">Ouvrir le menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-r-0 p-0 [&>button]:text-neutral-400">
            <SheetTitle className="sr-only">Menu d&apos;administration</SheetTitle>
            <NavContent
              pathname={pathname}
              unreadMessages={unreadMessages}
              user={user}
              onNavigate={() => setIsOpen(false)}
              onLogout={() => {
                setIsOpen(false)
                handleLogout()
              }}
            />
          </SheetContent>
        </Sheet>
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/img/home/logo.png" alt="" width={28} height={28} priority className="size-7 object-contain" />
          <span className="font-display text-sm font-bold text-white">Admin HBC</span>
        </Link>
      </div>
    </>
  )
}
