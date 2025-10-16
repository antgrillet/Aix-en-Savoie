import { PrismaClient } from '@prisma/client'
import { auth } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 Creating admin with Better Auth...\n')

  // Temporarily enable signup
  const originalSignUp = (auth as any).options.emailAndPassword?.disableSignUp
  if ((auth as any).options.emailAndPassword) {
    (auth as any).options.emailAndPassword.disableSignUp = false
  }

  try {
    // Try to use Better Auth's internal password hashing
    // Better Auth exports a hash function from better-auth/crypto
    const { hashPassword } = await import('better-auth/crypto')

    const hashedPassword = await hashPassword('admin123')
    console.log('✅ Password hashed with Better Auth')
    console.log('   Hash:', hashedPassword)
    console.log('   Length:', hashedPassword.length)
    console.log()

    // Update admin password
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@hbc-aix.fr' },
      include: { accounts: true },
    })

    if (!admin || !admin.accounts[0]) {
      console.error('❌ Admin not found')
      return
    }

    await prisma.account.update({
      where: { id: admin.accounts[0].id },
      data: { password: hashedPassword },
    })

    console.log('✅ Admin password updated with Better Auth hash!')
    console.log('   Email: admin@hbc-aix.fr')
    console.log('   Password: admin123')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    // Restore original signup setting
    if ((auth as any).options.emailAndPassword) {
      (auth as any).options.emailAndPassword.disableSignUp = originalSignUp
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
