import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking admin user...\n')

  const admin = await prisma.user.findUnique({
    where: { email: 'admin@hbc-aix.fr' },
    include: { accounts: true },
  })

  if (!admin) {
    console.error('❌ Admin user not found!')
    return
  }

  console.log('✅ Admin user found:')
  console.log('   ID:', admin.id)
  console.log('   Email:', admin.email)
  console.log('   Name:', admin.name)
  console.log('   Role:', admin.role)
  console.log('   Email Verified:', admin.emailVerified)
  console.log('\n📋 Accounts:')

  admin.accounts.forEach((account, index) => {
    console.log(`\n   Account ${index + 1}:`)
    console.log('   - ID:', account.id)
    console.log('   - Provider:', account.providerId)
    console.log('   - Account ID:', account.accountId)
    console.log('   - Has Password:', !!account.password)
    console.log('   - Password Hash Length:', account.password?.length || 0)
    console.log('   - Password Preview:', account.password?.substring(0, 20) + '...')
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
