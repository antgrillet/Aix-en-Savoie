import { PrismaClient } from '@prisma/client'
import { scryptSync, randomBytes } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 Updating admin password...\n')

  // Hash the new password with scrypt (Better Auth default)
  // Format: salt:hash (both in hex)
  const salt = randomBytes(16)
  const derivedKey = scryptSync('admin123', salt, 32)
  const hashedPassword = `${salt.toString('hex')}:${derivedKey.toString('hex')}`

  // Find the admin user
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@hbc-aix.fr' },
    include: { accounts: true },
  })

  if (!admin) {
    console.error('❌ Admin user not found!')
    process.exit(1)
  }

  // Find the credential account
  const credentialAccount = admin.accounts.find(
    (account) => account.providerId === 'credential'
  )

  if (!credentialAccount) {
    console.error('❌ Credential account not found!')
    process.exit(1)
  }

  // Update the password
  await prisma.account.update({
    where: { id: credentialAccount.id },
    data: { password: hashedPassword },
  })

  console.log('✅ Admin password updated successfully!')
  console.log('   Email: admin@hbc-aix.fr')
  console.log('   Password: admin123\n')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
