import { chromium } from 'playwright'

async function inspectClassement() {
  const url = 'https://www.ffhandball.fr/competitions/saison-2025-2026-21/national/nationale-3-masculine-2025-26-28559/poule-169510/journee-5/'

  console.log('🔍 Ouverture de la page FFHANDBALL...')
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  })
  const page = await browser.newPage()

  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(2000)

  // Fermer la popup de cookies si elle existe
  try {
    const cookieButton = page.locator('button:has-text("Continuer sans accepter")')
    if (await cookieButton.isVisible({ timeout: 3000 })) {
      await cookieButton.click()
      await page.waitForTimeout(1000)
      console.log('✅ Popup de cookies fermée')
    }
  } catch (err) {
    console.log('ℹ️  Pas de popup de cookies')
  }

  console.log('\n📊 Recherche du classement...')

  // Attendre un peu pour voir la page
  await page.waitForTimeout(3000)

  // Essayer de trouver le classement
  const classementData = await page.evaluate(() => {
    console.log('🔍 Recherche du classement dans la page...')

    // Chercher tous les tableaux
    const tables = document.querySelectorAll('table')
    console.log(`Nombre de tableaux trouvés: ${tables.length}`)

    // Chercher des éléments contenant "classement"
    const allElements = document.querySelectorAll('*')
    const classementElements = []

    allElements.forEach(el => {
      const text = el.textContent?.toLowerCase() || ''
      if (text.includes('classement') || text.includes('rang')) {
        classementElements.push({
          tag: el.tagName,
          text: el.textContent?.substring(0, 100),
          classes: el.className
        })
      }
    })

    console.log('Éléments contenant "classement":', classementElements.length)

    // Analyser chaque tableau
    const tablesData = []
    tables.forEach((table, index) => {
      console.log(`\n--- Tableau ${index + 1} ---`)

      const headers = []
      const headerCells = table.querySelectorAll('thead th, thead td')
      headerCells.forEach(cell => {
        headers.push(cell.textContent?.trim())
      })
      console.log('Headers:', headers)

      const rows = []
      const bodyRows = table.querySelectorAll('tbody tr')
      console.log(`Nombre de lignes: ${bodyRows.length}`)

      bodyRows.forEach((row, rowIndex) => {
        if (rowIndex < 3) { // Afficher seulement les 3 premières lignes
          const cells = []
          row.querySelectorAll('td, th').forEach(cell => {
            cells.push(cell.textContent?.trim())
          })
          console.log(`Ligne ${rowIndex + 1}:`, cells)
          rows.push(cells)
        }
      })

      tablesData.push({
        headers,
        rowCount: bodyRows.length,
        sampleRows: rows
      })
    })

    return {
      tablesCount: tables.length,
      tables: tablesData,
      classementElementsCount: classementElements.length,
      classementElements: classementElements.slice(0, 5)
    }
  })

  console.log('\n📋 Résultats de l\'inspection:')
  console.log(JSON.stringify(classementData, null, 2))

  console.log('\n⏸️  Navigateur ouvert pour inspection manuelle...')
  console.log('Appuyez sur Ctrl+C pour fermer')

  // Garder le navigateur ouvert pour inspection manuelle
  await page.waitForTimeout(300000) // 5 minutes

  await browser.close()
}

inspectClassement().catch(console.error)
