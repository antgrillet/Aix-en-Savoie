import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Fixing admin password...\n')

  // Find the admin user
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@hbc-aix.fr' },
    include: { accounts: true },
  })

  if (!adminUser) {
    console.log('❌ Admin user not found. Creating new admin user...')

    // Create admin user with proper bcrypt password hash
    const hashedPassword = await bcrypt.hash('admin123', 10)

    const newAdmin = await prisma.user.create({
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
    })

    console.log('✅ Admin user created successfully')
    console.log('   Email: admin@hbc-aix.fr')
    console.log('   Password: admin123\n')
  } else {
    console.log('📝 Admin user found:', adminUser.email)

    // Update the password with proper bcrypt hash
    const hashedPassword = await bcrypt.hash('admin123', 10)

    const account = adminUser.accounts[0]

    if (account) {
      await prisma.account.update({
        where: { id: account.id },
        data: {
          password: hashedPassword,
          providerId: 'credential',
          accountId: adminUser.email,
        },
      })
      console.log('✅ Password updated successfully')
    } else {
      await prisma.account.create({
        data: {
          userId: adminUser.id,
          accountId: adminUser.email,
          providerId: 'credential',
          password: hashedPassword,
        },
      })
      console.log('✅ Account created with password')
    }

    console.log('   Email: admin@hbc-aix.fr')
    console.log('   Password: admin123\n')
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
