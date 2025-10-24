import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateSlug(nom) {
  return nom
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function generatePartnerSlugs() {
  console.log('🔄 Génération des slugs pour les partenaires...\n')

  // Récupérer tous les partenaires sans slug
  const partenaires = await prisma.partenaire.findMany({
    where: {
      OR: [
        { slug: null },
        { slug: '' }
      ]
    }
  })

  console.log(`📊 ${partenaires.length} partenaires à traiter\n`)

  for (const partenaire of partenaires) {
    let slug = generateSlug(partenaire.nom)
    let slugExists = true
    let counter = 1

    // Vérifier si le slug existe déjà et ajouter un numéro si nécessaire
    while (slugExists) {
      const existing = await prisma.partenaire.findUnique({
        where: { slug }
      })

      if (!existing || existing.id === partenaire.id) {
        slugExists = false
      } else {
        slug = `${generateSlug(partenaire.nom)}-${counter}`
        counter++
      }
    }

    // Mettre à jour le partenaire
    await prisma.partenaire.update({
      where: { id: partenaire.id },
      data: { slug }
    })

    console.log(`✅ ${partenaire.nom} → ${slug}`)
  }

  console.log(`\n✨ Terminé! ${partenaires.length} slugs générés`)
}

generatePartnerSlugs()
  .catch((error) => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
