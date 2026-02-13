'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { signOut } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
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
  Menu,
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

function NavLinks({ mobile = false, pathname, onNavigate }: { mobile?: boolean; pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {navigation.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => mobile && onNavigate?.()}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
              mobile
                ? isActive
                  ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-700 border-l-4 border-primary-500'
                  : 'text-neutral-700 hover:bg-neutral-100 hover:text-primary-600'
                : isActive
                  ? 'bg-white/20 text-white backdrop-blur-sm'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className={mobile ? '' : 'hidden xl:inline'}>{item.name}</span>
          </Link>
        )
      })}
    </>
  )
}

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-gradient-to-r from-primary-600 to-secondary-600 shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                >
                  <Menu className="w-6 h-6" />
                  <span className="sr-only">Ouvrir le menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
                <SheetHeader className="p-6 bg-gradient-to-r from-primary-600 to-secondary-600">
                  <SheetTitle className="text-white text-left font-display">
                    Admin HBC
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-[calc(100%-80px)]">
                  <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <NavLinks mobile pathname={pathname} onNavigate={() => setIsOpen(false)} />
                  </nav>
                  <div className="p-4 border-t">
                    <Button
                      onClick={() => {
                        setIsOpen(false)
                        handleLogout()
                      }}
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-lg sm:text-xl font-display font-bold text-white"
            >
              Admin HBC
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <NavLinks pathname={pathname} />
          </div>

          {/* Logout Button - Desktop */}
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Déconnexion</span>
          </Button>

          {/* Logout Button - Mobile (icon only) */}
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="icon"
            className="sm:hidden text-white hover:bg-white/10"
          >
            <LogOut className="w-5 h-5" />
            <span className="sr-only">Déconnexion</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}
