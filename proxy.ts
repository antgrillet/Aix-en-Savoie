import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Better Auth préfixe le cookie par __Secure- en HTTPS.
  // La validité de la session et le rôle sont vérifiés dans le layout admin.
  const sessionToken = getSessionCookie(request)

  // Protéger les routes admin
  if (pathname.startsWith('/admin')) {
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Un cookie expiré ne doit pas empêcher d'accéder au formulaire de connexion.
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}
