import { scrapeFFHandballMatches } from './src/lib/scraping/ffhandball'

async function testScraper() {
  const url = 'https://www.ffhandball.fr/competitions/saison-2025-2026-21/regional/m15-ans-masculin-excellence-aura-27889/poule-168662/journee-7/'
  const equipeNom = 'HBC AIX EN SAVOIE'

  console.log('🧪 Test du scraper avec les nouvelles corrections\n')
  console.log(`URL: ${url}`)
  console.log(`Équipe: ${equipeNom}\n`)

  try {
    const matches = await scrapeFFHandballMatches(url, equipeNom)

    console.log(`\n✅ Résultat: ${matches.length} match(s) trouvé(s)\n`)

    for (const match of matches) {
      const status = match.termine
        ? `✅ ${match.scoreEquipe}-${match.scoreAdversaire}`
        : '⏳ À venir'
      const lieu = match.domicile ? '🏠 Domicile' : '✈️  Extérieur'

      console.log(`${lieu} ${match.date.toLocaleDateString('fr-FR')} ${match.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`)
      console.log(`   ${status} vs ${match.adversaire}`)
      console.log(`   Competition: ${match.competition}`)
      console.log(`   Logo: ${match.logoAdversaire ? '✓' : '✗'}`)
      console.log('')
    }

    // Validation
    console.log('\n📊 VALIDATION:')
    if (matches.length === 1) {
      console.log('✅ Nombre de matchs correct (1 match sur J7)')
      const match = matches[0]
      if (match.adversaire.includes('ANNECY-POISY') || match.adversaire.includes('ENTENTE')) {
        console.log('✅ Adversaire correct (M15M EXC - ENTENTE ANNECY-POISY)')
      } else {
        console.log(`❌ Adversaire incorrect: ${match.adversaire}`)
      }
      if (!match.termine) {
        console.log('✅ Statut correct (match à venir)')
      } else {
        console.log(`❌ Statut incorrect (match terminé avec score ${match.scoreEquipe}-${match.scoreAdversaire})`)
      }
    } else {
      console.log(`❌ Nombre de matchs incorrect: attendu 1, obtenu ${matches.length}`)
      console.log('   Le scraper capture trop ou pas assez de matchs!')
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

testScraper()
