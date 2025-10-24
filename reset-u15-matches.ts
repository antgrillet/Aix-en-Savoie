import { prisma } from './src/lib/prisma'

async function resetU15Matches() {
  // Trouver l'équipe des moins de 15
  const equipe = await prisma.equipe.findFirst({
    where: {
      OR: [
        { nom: { contains: '15', mode: 'insensitive' } },
        { categorie: { contains: '15', mode: 'insensitive' } },
      ],
    },
  })

  if (!equipe) {
    console.log('❌ Aucune équipe trouvée pour les moins de 15')
    return
  }

  console.log(`\n📋 Équipe: ${equipe.nom} (${equipe.categorie})`)

  // Supprimer tous les matchs
  const deleted = await prisma.match.deleteMany({
    where: { equipeId: equipe.id },
  })

  console.log(`✅ ${deleted.count} matchs supprimés`)
  console.log('\n✨ Base nettoyée, prêt pour une nouvelle synchronisation!')
  console.log(`\n🔗 URL à utiliser: ${equipe.matches || 'NON CONFIGURÉ'}`)
}

resetU15Matches()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
