import { chromium } from 'playwright'

async function analyzeScores() {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  try {
    const url = 'https://www.ffhandball.fr/competitions/saison-2025-2026-21/regional/m15-ans-masculin-excellence-aura-27889/poule-168662/'

    console.log('🔍 Navigation vers:', url)
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)

    // Fermer popup cookies en forçant le clic
    try {
      await page.waitForTimeout(3000)
      const cookieButton = page.locator('button:has-text("Continuer sans accepter")')
      if (await cookieButton.isVisible({ timeout: 5000 })) {
        await cookieButton.click({ force: true })
        console.log('✅ Popup cookies fermée')
        await page.waitForTimeout(2000)
      }
    } catch (err) {
      console.log('⚠️ Pas de popup cookies ou erreur:', err.message)
    }

    // Analyser les 6 premiers matchs de J1 pour voir le pattern exact
    console.log('\n📊 ANALYSE DES MATCHS J1:\n')

    const j1Button = page.locator('button').filter({ hasText: /^J1$/ }).first()
    await j1Button.click({ force: true })
    await page.waitForTimeout(1500)

    const matchLinks = await page.locator('a[href*="/rencontre-"]').all()

    for (let i = 0; i < Math.min(6, matchLinks.length); i++) {
      const link = matchLinks[i]
      const fullText = await link.textContent()

      console.log(`\n--- MATCH ${i + 1} ---`)
      console.log('Texte complet:', fullText)

      // Extraire juste la partie après la date
      const dateRegex = /(\w+\s+)?(\d{1,2})\s+(\w+)\s+(\d{4})\s+à\s+(\d{1,2})H(\d{2})/
      const dateMatch = fullText.match(dateRegex)

      if (dateMatch) {
        const afterDate = fullText.substring(dateMatch[0].length).trim()
        const beforeVoir = afterDate.split(/Voir détail|Rematch/i)[0].trim()
        console.log('Partie pertinente:', beforeVoir)

        // Afficher tous les groupes de chiffres trouvés
        const allDigits = beforeVoir.match(/\d+/g)
        console.log('Tous les chiffres trouvés:', allDigits)
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

analyzeScores()
