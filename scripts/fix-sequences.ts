import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Fixing auto-increment sequences...')

  // Fix articles sequence
  await prisma.$executeRaw`
    SELECT setval(
      pg_get_serial_sequence('articles', 'id'),
      COALESCE((SELECT MAX(id) FROM articles), 1),
      true
    );
  `
  console.log('✓ Articles sequence fixed')

  // Fix equipes sequence
  await prisma.$executeRaw`
    SELECT setval(
      pg_get_serial_sequence('equipes', 'id'),
      COALESCE((SELECT MAX(id) FROM equipes), 1),
      true
    );
  `
  console.log('✓ Equipes sequence fixed')

  // Fix entrainements sequence
  await prisma.$executeRaw`
    SELECT setval(
      pg_get_serial_sequence('entrainements', 'id'),
      COALESCE((SELECT MAX(id) FROM entrainements), 1),
      true
    );
  `
  console.log('✓ Entrainements sequence fixed')

  // Fix partenaires sequence
  await prisma.$executeRaw`
    SELECT setval(
      pg_get_serial_sequence('partenaires', 'id'),
      COALESCE((SELECT MAX(id) FROM partenaires), 1),
      true
    );
  `
  console.log('✓ Partenaires sequence fixed')

  // Fix contact_messages sequence
  await prisma.$executeRaw`
    SELECT setval(
      pg_get_serial_sequence('contact_messages', 'id'),
      COALESCE((SELECT MAX(id) FROM contact_messages), 1),
      true
    );
  `
  console.log('✓ Contact messages sequence fixed')

  console.log('\n✅ All sequences fixed successfully!')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
