import { chromium } from 'playwright'

export interface ScrapedMatch {
  adversaire: string
  date: Date
  lieu: string
  domicile: boolean
  competition: string
  scoreEquipe: number | null
  scoreAdversaire: number | null
  termine: boolean
  logoAdversaire: string | null
}

export interface ScrapedClassement {
  position: number
  club: string
  points: number
}

const monthNames: Record<string, number> = {
  'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3,
  'mai': 4, 'juin': 5, 'juillet': 6, 'août': 7,
  'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
}

// Keywords to identify our team
const teamKeywords = ['HBC AIX', 'AIX EN SAVOIE']

function isOurTeam(teamName: string): boolean {
  const upperName = teamName.toUpperCase()
  return teamKeywords.some(keyword => upperName.includes(keyword))
}

function cleanTeamName(name: string): string {
  // Enlever les préfixes numériques (position au classement) au début
  let cleaned = name.replace(/^\d+/, '').trim()
  // Enlever les espaces multiples
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  return cleaned
}

export async function scrapeFFHandballMatches(url: string, equipeNom: string): Promise<ScrapedMatch[]> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    console.log('🔍 Navigation vers:', url)

    // Extraire l'URL de base de la poule
    const pouleUrlMatch = url.match(/(.*\/poule-\d+)\/?/)
    const baseUrl = pouleUrlMatch ? pouleUrlMatch[1] : url.replace(/\/journee-\d+\/?$/, '')
    console.log('📍 URL de base de la poule:', baseUrl)

    // Naviguer vers la page de la poule
    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 })
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

    // Récupérer tous les boutons de journées
    const journeeButtons = await page.locator('button').all()
    const journees: string[] = []
    for (const btn of journeeButtons) {
      const text = await btn.textContent()
      if (text && /^J\d+$/.test(text.trim())) {
        journees.push(text.trim())
      }
    }

    console.log(`📅 ${journees.length} journées trouvées:`, journees.join(', '))

    const allMatches: ScrapedMatch[] = []
    let consecutiveEmptyJournees = 0

    // Parcourir chaque journée
    for (const journee of journees) {
      console.log(`🔄 Scraping ${journee}...`)

      try {
        // Cliquer sur le bouton de la journée
        await page.click(`button:has-text("${journee}")`)
        await page.waitForTimeout(1500)

        // Récupérer tous les liens de matchs
        const matchLinks = await page.locator('a[href*="/rencontre-"]').all()
        console.log(`   🔍 ${matchLinks.length} matchs trouvés`)

        let matchesThisJournee = 0

        for (let i = 0; i < matchLinks.length; i++) {
          const link = matchLinks[i]
          const fullText = await link.textContent()
          if (!fullText) continue

          // Extraire la date et l'heure
          const dateRegex = /(\w+\s+)?(\d{1,2})\s+(\w+)\s+(\d{4})\s+à\s+(\d{1,2})H(\d{2})/
          const dateMatch = fullText.match(dateRegex)
          if (!dateMatch) continue

          const [, , day, monthName, year, hour, minute] = dateMatch
          const month = monthNames[monthName.toLowerCase()]

          // Enlever la partie date du début et "Voir détail..." de la fin
          const afterDate = fullText.substring(dateMatch[0].length).trim()
          const beforeVoir = afterDate.split(/Voir détail|Rematch/i)[0].trim()

          // Extraire les images/logos
          const images = await link.locator('img').all()
          const logos: { src: string, title: string }[] = []
          for (const img of images) {
            const src = await img.getAttribute('src')
            const title = await img.getAttribute('title')
            if (src) {
              logos.push({ src, title: title || '' })
            }
          }

          function getOpponentLogo(): string | null {
            for (const logo of logos) {
              if (!isOurTeam(logo.title)) {
                return logo.src
              }
            }
            return logos.length > 0 ? logos[0].src : null
          }

          // 2 formats: avec "--" (à venir) ou avec scores (terminés)
          if (beforeVoir.includes('--')) {
            // Match à venir
            const parts = beforeVoir.split('--')
            if (parts.length !== 2) continue

            const team1 = cleanTeamName(parts[0])
            const team2 = cleanTeamName(parts[1])

            if (!isOurTeam(team1) && !isOurTeam(team2)) {
              console.log(`   ⏭️  Ignoré: ${team1} vs ${team2}`)
              continue
            }

            const isDomicile = isOurTeam(team1)
            console.log(`   ✅ Trouvé (à venir): ${team1} vs ${team2} - Domicile: ${isDomicile}`)

            const matchDate = new Date(parseInt(year), month, parseInt(day), parseInt(hour), parseInt(minute))
            allMatches.push({
              adversaire: isDomicile ? team2 : team1,
              date: matchDate,
              lieu: 'À déterminer',
              domicile: isDomicile,
              competition: 'M15 Ans Masculin Excellence Aura',
              scoreEquipe: null,
              scoreAdversaire: null,
              termine: false,
              logoAdversaire: getOpponentLogo(),
            })
            matchesThisJournee++
          } else {
            // Format des matchs terminés (2 formats possibles):
            // FORMAT 1 (U15 avec numéros d'équipe): "VAL DE LEYSSE 14126HBC AIX EN SAVOIE 1" = 1|41-26
            // FORMAT 2 (Seniors sans numéros): "VAL DE LEYSSE2220AIX EN SAVOIE" = 22-20

            let score1: number, score2: number
            let beforeScores: string, afterScores: string

            // Essayer d'abord le format à 5 chiffres (U15)
            const regex5digits = /(\d)(\d{2})(\d{2})/
            const match5 = beforeVoir.match(regex5digits)

            if (match5) {
              // Format U15: ignorer le premier chiffre (numéro d'équipe)
              score1 = parseInt(match5[2])
              score2 = parseInt(match5[3])
              beforeScores = beforeVoir.substring(0, match5.index).trim()
              afterScores = beforeVoir.substring(match5.index! + match5[0].length).trim()
            } else {
              // Essayer le format à 4 chiffres (Seniors)
              const regex4digits = /(\d{2})(\d{2})/
              const match4 = beforeVoir.match(regex4digits)

              if (!match4) {
                console.log(`   ⏭️  Pas de scores trouvés dans: "${beforeVoir}"`)
                continue
              }

              score1 = parseInt(match4[1])
              score2 = parseInt(match4[2])
              beforeScores = beforeVoir.substring(0, match4.index).trim()
              afterScores = beforeVoir.substring(match4.index! + match4[0].length).trim()
            }

            const team1 = cleanTeamName(beforeScores)
            const team2 = cleanTeamName(afterScores)

            if (!isOurTeam(team1) && !isOurTeam(team2)) {
              console.log(`   ⏭️  Ignoré: ${team1} ${score1}-${score2} ${team2}`)
              continue
            }

            const isDomicile = isOurTeam(team1)
            console.log(`   ✅ Trouvé (terminé): ${team1} ${score1}-${score2} ${team2}`)

            const matchDate = new Date(parseInt(year), month, parseInt(day), parseInt(hour), parseInt(minute))
            allMatches.push({
              adversaire: isDomicile ? team2 : team1,
              date: matchDate,
              lieu: 'À déterminer',
              domicile: isDomicile,
              competition: 'M15 Ans Masculin Excellence Aura',
              scoreEquipe: isDomicile ? score1 : score2,
              scoreAdversaire: isDomicile ? score2 : score1,
              termine: true,
              logoAdversaire: getOpponentLogo(),
            })
            matchesThisJournee++
          }
        }

        console.log(`   ✅ ${matchesThisJournee} matchs de HBC AIX pour ${journee}`)

        if (matchesThisJournee === 0) {
          consecutiveEmptyJournees++
          if (consecutiveEmptyJournees >= 2) {
            console.log('🛑 Arrêt après 2 journées consécutives sans match')
            break
          }
        } else {
          consecutiveEmptyJournees = 0
        }

      } catch (err) {
        console.error(`❌ Erreur lors du scraping de ${journee}:`, err)
      }
    }

    console.log(`📦 ${allMatches.length} matchs récupérés au total`)
    return allMatches

  } catch (error) {
    console.error('❌ Erreur scraping FFHANDBALL:', error)
    throw new Error(`Impossible de récupérer les matchs: ${error}`)
  } finally {
    await browser.close()
  }
}

export async function getFFHandballMatchesFromAPI(url: string, equipeNom: string): Promise<ScrapedMatch[]> {
  return scrapeFFHandballMatches(url, equipeNom)
}

export async function scrapeFFHandballClassement(url: string): Promise<ScrapedClassement[]> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    console.log('🔍 Scraping du classement depuis:', url)
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

    // Scraper le classement
    const rows = await page.locator('table tbody tr').all()
    const classement: ScrapedClassement[] = []

    for (const row of rows) {
      const cells = await row.locator('td, th').all()
      if (cells.length >= 3) {
        const position = await cells[0].textContent()
        const club = await cells[1].textContent()
        const points = await cells[2].textContent()

        if (position && club && points) {
          classement.push({
            position: parseInt(position.trim()),
            club: club.trim(),
            points: parseInt(points.trim()),
          })
        }
      }
    }

    console.log(`📊 ${classement.length} équipes récupérées dans le classement`)
    return classement

  } catch (error) {
    console.error('❌ Erreur scraping classement FFHANDBALL:', error)
    throw new Error(`Impossible de récupérer le classement: ${error}`)
  } finally {
    await browser.close()
  }
}
