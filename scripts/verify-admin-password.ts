import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcrypt'

async function main() {
  const password = 'admin123'

  console.log('🔐 Testing admin password with bcrypt...\n')

  // Get admin account
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@hbc-aix.fr' },
    include: { accounts: true },
  })

  if (!admin || !admin.accounts[0]) {
    console.error('❌ Admin not found')
    return
  }

  const storedHash = admin.accounts[0].password
  if (!storedHash) {
    console.error('❌ No password hash stored')
    return
  }

  console.log('📋 Stored hash:', storedHash)
  console.log('📋 Hash format:', storedHash.startsWith('$2b$') ? 'bcrypt ✅' : 'unknown ❌')
  console.log()

  // Verify password with bcrypt
  console.log('🔑 Testing password:', password)
  const isValid = await bcrypt.compare(password, storedHash)

  console.log()
  if (isValid) {
    console.log('✅ Password verification PASSED!')
    console.log('   The password "admin123" is correct.')
  } else {
    console.log('❌ Password verification FAILED!')
    console.log('   The password "admin123" does NOT match the stored hash.')
    console.log('\n🔧 Run this to reset the password:')
    console.log('   bun run update-admin-password')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
