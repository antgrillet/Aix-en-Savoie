import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcrypt'
import { readFileSync } from 'fs'
import { join } from 'path'

// Helper: Generate slug from string
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Helper: Parse French date
function parseFrenchDate(dateStr: string): Date {
  const months: Record<string, number> = {
    janvier: 0, février: 1, mars: 2, avril: 3,
    mai: 4, juin: 5, juillet: 6, août: 7,
    septembre: 8, octobre: 9, novembre: 10, décembre: 11,
  }

  const match = dateStr.match(/(\d+)\s+(\w+)\s+(\d+)/)
  if (!match) return new Date()

  const [, day, month, year] = match
  const monthIndex = months[month.toLowerCase()]

  return new Date(parseInt(year), monthIndex, parseInt(day))
}

async function main() {
  console.log('🌱 Starting database seed...\n')

  // ============================================
  // 1. Créer l'utilisateur admin
  // ============================================
  console.log('👤 Creating admin user...')

  // Use bcrypt to hash the password (matches Better Auth configuration)
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hbc-aix.fr' },
    update: {},
    create: {
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

  console.log('✅ Admin user created:', admin.email)
  console.log('   Email: admin@hbc-aix.fr')
  console.log('   Password: admin123\n')

  // ============================================
  // 2. Migrer les articles
  // ============================================
  console.log('📰 Migrating articles...')

  const articlesData = JSON.parse(
    readFileSync(join(process.cwd(), 'backup/data/actualites.json'), 'utf-8')
  )

  let articlesCount = 0
  for (const article of articlesData) {
    await prisma.article.upsert({
      where: { id: article.id },
      update: {},
      create: {
        id: article.id,
        titre: article.titre,
        categorie: article.categorie,
        date: parseFrenchDate(article.date),
        image: article.image.startsWith('/') ? article.image : `/${article.image}`,
        resume: article.resume,
        contenu: article.contenu,
        vedette: article.vedette || false,
        tag: article.tag,
        tags: article.tags || [],
        slug: slugify(article.titre),
        published: true,
        views: 0,
        createdBy: admin.id,
      },
    })
    articlesCount++
  }

  console.log(`✅ Migrated ${articlesCount} articles\n`)

  // ============================================
  // 3. Migrer les équipes
  // ============================================
  console.log('👥 Migrating teams...')

  const equipesData = JSON.parse(
    readFileSync(join(process.cwd(), 'backup/data/equipes.json'), 'utf-8')
  )

  let equipesCount = 0
  for (const equipe of equipesData) {
    const team = await prisma.equipe.upsert({
      where: { id: equipe.id },
      update: {},
      create: {
        id: equipe.id,
        nom: equipe.nom,
        categorie: equipe.categorie,
        description: equipe.description,
        entraineur: equipe.entraineur,
        matches: equipe.matches,
        photo: equipe.photo || 'img/equipes/default.jpg',
        ordre: equipe.ordre || equipesCount,
        slug: slugify(equipe.nom),
        published: true,
        createdBy: admin.id,
      },
    })

    // Migrer les entraînements
    if (equipe.entrainements && equipe.entrainements.length > 0) {
      for (const entrainement of equipe.entrainements) {
        await prisma.entrainement.create({
          data: {
            jour: entrainement.jour,
            horaire: entrainement.horaire,
            lieu: entrainement.lieu || null,
            equipeId: team.id,
          },
        })
      }
    }

    equipesCount++
  }

  console.log(`✅ Migrated ${equipesCount} teams\n`)

  // ============================================
  // 4. Migrer les partenaires
  // ============================================
  console.log('🤝 Migrating partners...')

  const partenairesData = JSON.parse(
    readFileSync(join(process.cwd(), 'backup/data/partenaires.json'), 'utf-8')
  )

  let partenairesCount = 0
  for (const [index, partenaire] of partenairesData.entries()) {
    await prisma.partenaire.upsert({
      where: { id: partenaire.id },
      update: {},
      create: {
        id: partenaire.id,
        nom: partenaire.nom,
        categorie: partenaire.categorie,
        logo: partenaire.logo || 'img/partenaires/default.png',
        description: partenaire.description || '',
        site: partenaire.site || null,
        partenaire_majeur: partenaire.partenaire_majeur || false,
        ordre: index,
        published: true,
        createdBy: admin.id,
      },
    })
    partenairesCount++
  }

  console.log(`✅ Migrated ${partenairesCount} partners\n`)

  // ============================================
  // 5. Créer les paramètres par défaut
  // ============================================
  console.log('⚙️  Creating default settings...')

  await prisma.setting.upsert({
    where: { key: 'hero_background_image' },
    update: {},
    create: {
      key: 'hero_background_image',
      value: '',
      type: 'image',
      description: 'Image de fond de la section hero de la page d\'accueil',
    },
  })

  console.log('✅ Created default settings\n')

  // ============================================
  // Résumé
  // ============================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 Database seed completed successfully!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ ${articlesCount} articles`)
  console.log(`✅ ${equipesCount} teams`)
  console.log(`✅ ${partenairesCount} partners`)
  console.log(`✅ 1 admin user`)
  console.log(`✅ 1 default setting`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
