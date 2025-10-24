import { chromium } from 'playwright'

async function inspectLogos() {
  const browser = await chromium.launch({ headless: false }) // visible pour debug
  const page = await browser.newPage()

  try {
    const url = 'https://www.ffhandball.fr/competitions/saison-2025-2026-21/national/nationale-3-masculine-2025-26-28559/poule-169510/journee-5/'

    console.log('🔍 Navigation vers:', url)
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)

    // Fermer popup de cookies
    try {
      const cookieButton = page.locator('button:has-text("Continuer sans accepter")')
      if (await cookieButton.isVisible({ timeout: 3000 })) {
        await cookieButton.click()
        await page.waitForTimeout(1000)
      }
    } catch (err) {}

    // Cliquer sur J1 pour voir les matchs
    await page.click('button:has-text("J1")')
    await page.waitForTimeout(2000)

    // Inspecter la structure d'un lien de match
    const matchStructure = await page.evaluate(() => {
      const matchLinks = document.querySelectorAll('a[href*="/rencontre-"]')
      if (matchLinks.length === 0) return null

      const firstMatch = matchLinks[0]

      // Récupérer toute la structure HTML
      const structure = {
        html: firstMatch.innerHTML,
        outerHTML: firstMatch.outerHTML,
        text: firstMatch.textContent,
        images: []
      }

      // Chercher toutes les images dans le lien
      const images = firstMatch.querySelectorAll('img')
      images.forEach((img, i) => {
        structure.images.push({
          index: i,
          src: img.src,
          alt: img.alt,
          className: img.className,
          width: img.width,
          height: img.height
        })
      })

      return structure
    })

    console.log('\n📊 Structure du premier match:')
    console.log('=====================================')
    console.log('Texte:', matchStructure?.text?.substring(0, 200))
    console.log('\n📸 Images trouvées:', matchStructure?.images?.length || 0)

    if (matchStructure?.images) {
      matchStructure.images.forEach((img) => {
        console.log(`\nImage ${img.index}:`)
        console.log(`  - URL: ${img.src}`)
        console.log(`  - Alt: ${img.alt}`)
        console.log(`  - Class: ${img.className}`)
        console.log(`  - Taille: ${img.width}x${img.height}`)
      })
    }

    console.log('\n🔍 HTML complet:')
    console.log(matchStructure?.outerHTML)

    console.log('\n\n⏸️  Navigateur ouvert pour inspection manuelle. Appuyez sur Ctrl+C pour fermer.')
    await page.waitForTimeout(60000) // Attendre 1 minute pour inspecter manuellement

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await browser.close()
  }
}

inspectLogos()
