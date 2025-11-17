'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Newspaper,
  Users,
  Handshake,
  MessageSquare,
  Settings,
  LogOut,
  Trophy,
  ClipboardList,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Articles', href: '/admin/articles', icon: Newspaper },
  { name: 'Équipes', href: '/admin/equipes', icon: Users },
  { name: 'Matchs', href: '/admin/matchs', icon: Trophy },
  { name: 'Inscriptions', href: '/admin/inscriptions', icon: ClipboardList },
  { name: 'Partenaires', href: '/admin/partenaires', icon: Handshake },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { name: 'Paramètres', href: '/admin/parametres', icon: Settings },
]

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-gradient-to-r from-primary-600 to-secondary-600 shadow-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-xl font-display font-bold text-white"
            >
              Admin HBC
            </Link>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-white/20 text-white backdrop-blur-sm'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Logout */}
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </div>
      </div>
    </nav>
  )
}
