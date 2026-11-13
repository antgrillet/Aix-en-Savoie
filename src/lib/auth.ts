import { betterAuth } from 'better-auth/minimal'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'
import bcrypt from 'bcrypt'

// Origins allowed to call the auth API and to receive its redirects.
export function originesDeConfiance(env: { NODE_ENV?: string; VERCEL_URL?: string; VERCEL_BRANCH_URL?: string }) {
  const origines = [
    'https://hbcaixensavoie.fr',
    'https://www.hbcaixensavoie.fr',
    'https://hbc-aix-en-savoie.fr',
    'https://www.hbc-aix-en-savoie.fr',
  ]
  if (env.NODE_ENV !== 'production') {
    for (const port of [3000, 3001, 3002]) {
      origines.push(`http://localhost:${port}`, `http://127.0.0.1:${port}`)
    }
  }
  // Preview deployments of this project only, never any Vercel subdomain.
  if (env.VERCEL_URL) origines.push(`https://${env.VERCEL_URL}`)
  if (env.VERCEL_BRANCH_URL) origines.push(`https://${env.VERCEL_BRANCH_URL}`)
  return origines
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || (
    process.env.NODE_ENV === 'production'
      ? 'https://www.hbcaixensavoie.fr'
      : 'http://localhost:3002'
  ),

  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  trustedOrigins: originesDeConfiance(process.env),

  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
        input: false,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    disableSignUp: true, // Désactiver l'inscription publique
    sendResetPassword: async ({ user, url }) => {
      // TODO: Implémenter l'envoi d'email
      console.log('Reset password URL:', url)
    },
    password: {
      hash: async (password) => {
        return await bcrypt.hash(password, 10)
      },
      verify: async ({ hash, password }) => {
        return await bcrypt.compare(password, hash)
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24, // Update session every 24h
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  advanced: {
    generateId: () => crypto.randomUUID(),
    database: {
      joins: true,
    },
  },
})

export type Session = typeof auth.$Infer.Session
