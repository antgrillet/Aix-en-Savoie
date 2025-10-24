import { chromium } from 'playwright'

async function scrapeClassement() {
  const url = 'https://www.ffhandball.fr/competitions/saison-2025-2026-21/national/nationale-3-masculine-2025-26-28559/poule-169510/journee-5/'

  console.log('🔍 Scraping du classement depuis:', url)
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)

    // Fermer la popup de cookies
    try {
      const cookieButton = page.locator('button:has-text("Continuer sans accepter")')
      if (await cookieButton.isVisible({ timeout: 3000 })) {
        await cookieButton.click()
        await page.waitForTimeout(1000)
      }
    } catch (err) {
      // Pas de popup
    }

    // Scraper le classement
    const classement = await page.evaluate(() => {
      const table = document.querySelector('table')
      if (!table) return []

      const results = []
      const rows = table.querySelectorAll('tbody tr')

      rows.forEach(row => {
        const cells = row.querySelectorAll('td, th')
        if (cells.length >= 3) {
          const position = cells[0].textContent?.trim()
          const club = cells[1].textContent?.trim()
          const points = cells[2].textContent?.trim()

          // Chercher toutes les colonnes disponibles
          const allColumns = []
          cells.forEach(cell => {
            allColumns.push(cell.textContent?.trim())
          })

          results.push({
            position: parseInt(position),
            club,
            points: parseInt(points),
            allColumns
          })
        }
      })

      return results
    })

    console.log('\n📊 CLASSEMENT RÉCUPÉRÉ:')
    console.log('='.repeat(80))
    classement.forEach(team => {
      console.log(`${team.position}. ${team.club} - ${team.points} pts`)
      console.log(`   Colonnes complètes:`, team.allColumns)
    })
    console.log('='.repeat(80))
    console.log(`\nTotal: ${classement.length} équipes`)

    return classement
  } catch (error) {
    console.error('❌ Erreur:', error)
    throw error
  } finally {
    await browser.close()
  }
}

scrapeClassement().catch(console.error)
