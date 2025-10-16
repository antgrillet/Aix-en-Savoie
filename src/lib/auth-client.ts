'use client'

import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
  plugins: [adminClient()],
})

// Export hooks pour utilisation dans les composants
export const {
  signIn,
  signOut,
  signUp,
  useSession,
} = authClient
