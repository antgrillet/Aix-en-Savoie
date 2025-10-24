import { chromium } from 'playwright'

async function analyzeFinishedMatches() {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  try {
    const url = 'https://www.ffhandball.fr/competitions/saison-2025-2026-21/regional/m15-ans-masculin-excellence-aura-27889/poule-168662/'

    console.log('🔍 Navigation vers:', url)
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)

    // Fermer popup cookies
    try {
      await page.waitForTimeout(3000)
      const cookieButton = page.locator('button:has-text("Continuer sans accepter")')
      if (await cookieButton.isVisible({ timeout: 5000 })) {
        await cookieButton.click({ force: true })
        console.log('✅ Popup cookies fermée')
        await page.waitForTimeout(2000)
      }
    } catch (err) {
      console.log('⚠️ Pas de popup cookies')
    }

    // Analyser les matchs des premières journées (J1 à J6 qui sont probablement terminées)
    const journees = ['J1', 'J2', 'J3', 'J4', 'J5', 'J6']

    for (const journee of journees) {
      console.log(`\n\n${'='.repeat(60)}`)
      console.log(`📅 ANALYSE DE ${journee}`)
      console.log('='.repeat(60))

      const jButton = page.locator('button').filter({ hasText: new RegExp(`^${journee}$`) }).first()
      await jButton.click({ force: true })
      await page.waitForTimeout(1500)

      const matchLinks = await page.locator('a[href*="/rencontre-"]').all()
      console.log(`\nNombre de matchs: ${matchLinks.length}`)

      for (let i = 0; i < matchLinks.length; i++) {
        const link = matchLinks[i]
        const fullText = await link.textContent()

        // Vérifier si c'est un match de HBC AIX
        if (!fullText.includes('HBC AIX') && !fullText.includes('AIX EN SAVOIE')) {
          continue
        }

        console.log(`\n--- MATCH HBC AIX ${i + 1} ---`)
        console.log('📝 Texte complet:')
        console.log(fullText)

        // Extraire la partie après la date
        const dateRegex = /(\w+\s+)?(\d{1,2})\s+(\w+)\s+(\d{4})\s+à\s+(\d{1,2})H(\d{2})/
        const dateMatch = fullText.match(dateRegex)

        if (dateMatch) {
          const afterDate = fullText.substring(dateMatch[0].length).trim()
          const beforeVoir = afterDate.split(/Voir détail|Rematch/i)[0].trim()

          console.log('\n🔍 Partie pertinente (après date, avant "Voir détail"):')
          console.log(beforeVoir)

          // Afficher chaque caractère avec son index
          console.log('\n📊 Analyse caractère par caractère:')
          for (let j = 0; j < Math.min(beforeVoir.length, 150); j++) {
            const char = beforeVoir[j]
            if (char >= '0' && char <= '9') {
              console.log(`  [${j}] = '${char}' 🔢`)
            } else if (char === ' ') {
              console.log(`  [${j}] = ' ' (espace)`)
            } else {
              process.stdout.write(`${char}`)
            }
          }
          console.log('\n')

          // Extraire tous les groupes de chiffres
          const allDigits = beforeVoir.match(/\d+/g)
          console.log('🔢 Tous les groupes de chiffres trouvés:', allDigits)
        }
      }
    }

    console.log('\n\n💤 Attente de 30 secondes pour inspection manuelle...')
    await page.waitForTimeout(30000)

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await browser.close()
  }
}

analyzeFinishedMatches()
