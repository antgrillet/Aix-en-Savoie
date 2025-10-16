import { scryptSync } from 'crypto'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const password = 'admin123'

  console.log('🔐 Testing password verification...\n')

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
  console.log('📋 Hash length:', storedHash.length)
  console.log()

  // Parse stored hash
  const [saltHex, hashHex] = storedHash.split(':')
  console.log('📋 Salt (hex):', saltHex)
  console.log('📋 Hash (hex):', hashHex)
  console.log()

  // Verify password
  const salt = Buffer.from(saltHex, 'hex')
  const derivedKey = scryptSync(password, salt, 32)
  const derivedKeyHex = derivedKey.toString('hex')

  console.log('🔑 Testing password:', password)
  console.log('🔑 Derived key (hex):', derivedKeyHex)
  console.log()

  const isValid = derivedKeyHex === hashHex

  if (isValid) {
    console.log('✅ Password verification PASSED!')
  } else {
    console.log('❌ Password verification FAILED!')
    console.log('   Expected:', hashHex)
    console.log('   Got:     ', derivedKeyHex)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
