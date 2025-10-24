import { prisma } from '../src/lib/prisma'

function generateSlug(nom: string): string {
  return nom
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, '') // Enlever les tirets en début et fin
}

async function generatePartnerSlugs() {
  console.log('🔄 Génération des slugs pour les partenaires...\n')

  const partners = await prisma.partenaire.findMany({
    where: {
      slug: null,
    },
    select: {
      id: true,
      nom: true,
    },
  })

  console.log(`📊 ${partners.length} partenaires sans slug trouvés\n`)

  for (const partner of partners) {
    let slug = generateSlug(partner.nom)
    let slugSuffix = 1

    // Vérifier si le slug existe déjà
    while (await prisma.partenaire.findUnique({ where: { slug } })) {
      slug = `${generateSlug(partner.nom)}-${slugSuffix}`
      slugSuffix++
    }

    await prisma.partenaire.update({
      where: { id: partner.id },
      data: { slug },
    })

    console.log(`✅ ${partner.nom} → ${slug}`)
  }

  console.log(`\n✨ Tous les slugs ont été générés!`)
}

generatePartnerSlugs()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
