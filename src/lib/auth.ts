import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin } from 'better-auth/plugins'
import { prisma } from './prisma'
import bcrypt from 'bcrypt'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3002',

  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  logger: {
    level: 'debug',
    disabled: false,
    verboseLogging: true,
  },

  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3002',
    'https://hbc-aix-en-savoie.fr',
    'https://www.hbc-aix-en-savoie.fr',
    'https://www.hbc-aix-en-savoie.fr',
    'https://*.vercel.app',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
  ],

  emailAndPassword: {
    enabled: true,
    disableSignUp: true, // Désactiver l'inscription publique
    sendResetPassword: async ({ user, url }) => {
      // TODO: Implémenter l'envoi d'email
      console.log('Reset password URL:', url)
    },
    password: {
      hash: async (password) => {
        console.log('[AUTH] Hashing password')
        return await bcrypt.hash(password, 10)
      },
      verify: async ({ hash, password }) => {
        console.log('[AUTH] Verifying password')
        console.log('[AUTH] Hash:', hash?.substring(0, 20) + '...')
        const result = await bcrypt.compare(password, hash)
        console.log('[AUTH] Verification result:', result)
        return result
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

  plugins: [
    admin({
      impersonationSessionDuration: 60 * 10, // 10 minutes
    }),
  ],

  advanced: {
    generateId: () => crypto.randomUUID(),
  },
})

export type Session = typeof auth.$Infer.Session
