import { scrapeFFHandballMatches } from './src/lib/scraping/ffhandball'

async function testScraper() {
  const url = 'https://www.ffhandball.fr/competitions/saison-2025-2026-21/regional/m15-ans-masculin-excellence-aura-27889/poule-168662/journee-7/'
  const equipeNom = 'HBC AIX EN SAVOIE'

  console.log('🧪 Test du NOUVEAU scraper\n')
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
    if (matches.length >= 1) {
      console.log(`✅ Au moins 1 match trouvé pour HBC AIX EN SAVOIE`)

      // Vérifier qu'aucun match de Chambéry n'a été capturé
      const chamberyMatches = matches.filter(m =>
        m.adversaire.toUpperCase().includes('CHAMBERY SAVOIE') &&
        !m.adversaire.toUpperCase().includes('HBC AIX')
      )

      if (chamberyMatches.length === 0) {
        console.log('✅ Aucun match de Chambéry capturé par erreur')
      } else {
        console.log(`❌ ${chamberyMatches.length} match(s) de Chambéry capturé(s) par erreur!`)
      }

      console.log('\n✨ Liste des matchs capturés:')
      for (const match of matches) {
        console.log(`   - ${match.date.toLocaleDateString()} vs ${match.adversaire}`)
      }
    } else {
      console.log(`❌ Aucun match trouvé!`)
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

testScraper()
