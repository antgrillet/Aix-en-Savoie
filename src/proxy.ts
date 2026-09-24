import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'
import { auth } from '@/lib/auth'

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (!pathname.startsWith('/admin')) return NextResponse.next()

  // Vérifier la session avant que Next.js ne rende les pages et leurs données.
  if (getSessionCookie(request)) {
    try {
      const session = await auth.api.getSession({ headers: request.headers })
      if (session?.user.role === 'admin') return NextResponse.next()
    } catch {
      // Un échec de validation ne doit jamais ouvrir l'accès à l'administration.
    }
  }

  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}
