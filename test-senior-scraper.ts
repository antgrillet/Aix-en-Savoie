import { scrapeFFHandballMatches } from './src/lib/scraping/ffhandball'

async function testSeniorScraper() {
  const url = 'https://www.ffhandball.fr/competitions/saison-2025-2026-21/regional/nationale-3-feminine-aura-27879/poule-168407/journee-5/'
  const equipeNom = 'AIX EN SAVOIE'

  console.log('🧪 Test du scraper SENIORS\n')
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

    console.log('\n📊 VALIDATION:')
    if (matches.length >= 1) {
      console.log(`✅ Au moins 1 match trouvé pour AIX EN SAVOIE`)

      // Vérifier le score attendu: VAL DE LEYSSE 22-20 AIX EN SAVOIE
      const matchVdL = matches.find(m => m.adversaire.includes('VAL DE LEYSSE'))
      if (matchVdL) {
        if (matchVdL.scoreEquipe === 20 && matchVdL.scoreAdversaire === 22) {
          console.log('✅ Score correct: AIX 20-22 VAL DE LEYSSE')
        } else {
          console.log(`❌ Score incorrect: AIX ${matchVdL.scoreEquipe}-${matchVdL.scoreAdversaire} VAL DE LEYSSE (attendu 20-22)`)
        }
      }
    } else {
      console.log(`❌ Aucun match trouvé!`)
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

testSeniorScraper()
