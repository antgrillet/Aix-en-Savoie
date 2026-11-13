import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getServerSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    return session
  } catch (error) {
    return null
  }
}

export async function requireAuth() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  return session
}

// For API routes: no redirect, the caller answers 401 itself.
export async function sessionAdmin() {
  const session = await getServerSession()
  return session?.user.role === 'admin' ? session : null
}

export async function requireAdmin() {
  const session = await getServerSession()

  if (!session || session.user.role !== 'admin') {
    redirect('/login')
  }

  return session
}
