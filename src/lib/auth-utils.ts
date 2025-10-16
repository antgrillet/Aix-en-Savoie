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

export async function requireAdmin() {
  const session = await getServerSession()

  if (!session || session.user.role !== 'admin') {
    redirect('/login')
  }

  return session
}
