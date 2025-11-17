import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Resetting admin with Better Auth compatible format...\n')

  // Step 1: Delete existing admin
  await prisma.account.deleteMany({
    where: {
      userId: {
        in: (await prisma.user.findMany({ where: { email: 'admin@hbc-aix.fr' } })).map(u => u.id)
      }
    }
  })
  await prisma.user.deleteMany({ where: { email: 'admin@hbc-aix.fr' } })
  console.log('✅ Deleted existing admin\n')

  // Step 2: Create admin with bcrypt hash
  const hashedPassword = await bcrypt.hash('admin123', 10)
  console.log('Password hash:', hashedPassword)
  console.log('Hash starts with $2b$:', hashedPassword.startsWith('$2b$'))
  console.log()

  const admin = await prisma.user.create({
    data: {
      email: 'admin@hbc-aix.fr',
      name: 'Admin HBC',
      emailVerified: true,
      role: 'admin',
      accounts: {
        create: {
          accountId: 'admin@hbc-aix.fr',
          providerId: 'credential',
          password: hashedPassword,
        },
      },
    },
    include: { accounts: true },
  })

  console.log('✅ Admin user created successfully!')
  console.log('   ID:', admin.id)
  console.log('   Email:', admin.email)
  console.log('   Password: admin123')
  console.log('   Account ID:', admin.accounts[0].accountId)
  console.log('   Provider ID:', admin.accounts[0].providerId)
  console.log()
  console.log('🔐 Try logging in with:')
  console.log('   Email: admin@hbc-aix.fr')
  console.log('   Password: admin123')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
