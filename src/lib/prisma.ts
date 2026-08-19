import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getDatabaseUrl() {
  const value = process.env.DATABASE_URL
  if (!value) {
    throw new Error('DATABASE_URL is required')
  }

  const url = new URL(value)
  const sslMode = url.searchParams.get('sslmode')
  if (sslMode && ['prefer', 'require', 'verify-ca'].includes(sslMode)) {
    url.searchParams.set('sslmode', 'verify-full')
  }

  return url.toString()
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: getDatabaseUrl(),
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 30_000,
      max: process.env.NODE_ENV === 'production' ? 5 : 10,
    }),
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
