import { chromium } from 'playwright'

async function debugExactText() {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  try {
    const url = 'https://www.ffhandball.fr/competitions/saison-2025-2026-21/regional/m15-ans-masculin-excellence-aura-27889/poule-168662/'

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)

    // Fermer popup cookies
    try {
      const cookieButton = page.locator('button:has-text("Continuer sans accepter")')
      if (await cookieButton.isVisible({ timeout: 5000 })) {
        await cookieButton.click({ force: true })
        await page.waitForTimeout(2000)
      }
    } catch (err) {}

    // Aller sur J2 où on sait qu'il y a le match AIX 28-55
    const j2Button = page.locator('button').filter({ hasText: /^J2$/ }).first()
    await j2Button.click({ force: true })
    await page.waitForTimeout(2000)

    const matchLinks = await page.locator('a[href*="/rencontre-"]').all()

    for (let i = 0; i < matchLinks.length; i++) {
      const link = matchLinks[i]
      const fullText = await link.textContent()

      if (!fullText.includes('HBC AIX') && !fullText.includes('AIX EN SAVOIE')) {
        continue
      }

      console.log(`\n${'='.repeat(80)}`)
      console.log(`MATCH HBC AIX #${i + 1}`)
      console.log('='.repeat(80))
      console.log('\nTexte complet brut:')
      console.log(JSON.stringify(fullText))
      console.log('\nTexte complet visible:')
      console.log(fullText)

      // Extraire après la date
      const dateRegex = /(\w+\s+)?(\d{1,2})\s+(\w+)\s+(\d{4})\s+à\s+(\d{1,2})H(\d{2})/
      const dateMatch = fullText.match(dateRegex)

      if (dateMatch) {
        const afterDate = fullText.substring(dateMatch[0].length).trim()
        const beforeVoir = afterDate.split(/Voir détail|Rematch/i)[0].trim()

        console.log('\n📋 Partie pertinente (après date, avant "Voir détail"):')
        console.log(JSON.stringify(beforeVoir))
        console.log(beforeVoir)

        // Analyser caractère par caractère les 100 premiers
        console.log('\n🔍 Analyse caractère par caractère:')
        for (let j = 0; j < Math.min(beforeVoir.length, 100); j++) {
          const char = beforeVoir[j]
          const code = char.charCodeAt(0)
          if (char >= '0' && char <= '9') {
            console.log(`  [${j}] = '${char}' (chiffre)`)
          } else if (char === ' ') {
            console.log(`  [${j}] = ' ' (espace normal, code ${code})`)
          } else if (code === 160) {
            console.log(`  [${j}] = (espace insécable, code ${code})`)
          } else if (code < 32 || code === 8203) {
            console.log(`  [${j}] = (caractère invisible, code ${code})`)
          }
        }

        // Trouver les groupes de chiffres
        console.log('\n🔢 Recherche de patterns de scores:')

        // Pattern 1: 4 chiffres collés
        const pattern1 = beforeVoir.match(/(\d{2})(\d{2})/)
        console.log('Pattern "\\d{2}\\d{2}" (4 chiffres collés):', pattern1)

        // Pattern 2: 2 chiffres, espace, 2 chiffres
        const pattern2 = beforeVoir.match(/(\d{1,2})\s+(\d{1,2})/)
        console.log('Pattern "\\d{1,2}\\s+\\d{1,2}" (2 chiffres + espace + 2 chiffres):', pattern2)

        // Pattern 3: tous les groupes de chiffres
        const allDigits = beforeVoir.match(/\d+/g)
        console.log('Tous les groupes de chiffres:', allDigits)
      }
    }

    console.log('\n\n💤 Attente de 20 secondes...')
    await page.waitForTimeout(20000)

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await browser.close()
  }
}

debugExactText()
