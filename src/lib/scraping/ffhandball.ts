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

const FFHB_TIMEZONE = 'Europe/Paris'

function getTimeZoneOffset(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const parts = formatter.formatToParts(date).filter(part => part.type !== 'literal')
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]))
  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  )
  return (asUtc - date.getTime()) / 60000
}

function parisDateToUtcDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): Date {
  const naiveUtc = new Date(Date.UTC(year, month, day, hour, minute))
  const offsetMinutes = getTimeZoneOffset(naiveUtc, FFHB_TIMEZONE)
  return new Date(naiveUtc.getTime() - offsetMinutes * 60000)
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
      // Le texte du bouton a changé sur le site FFHB
      const cookieButton = page.locator('button:has-text("Accepter & Fermer")')
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
          // Utiliser [^\d\s]+ au lieu de \w+ pour matcher les caractères accentués (décembre, février, août)
          const dateRegex = /([^\d\s]+\s+)?(\d{1,2})\s+([^\d\s]+)\s+(\d{4})\s+à\s+(\d{1,2})H(\d{2})/
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

            const matchDate = parisDateToUtcDate(
              parseInt(year, 10),
              month,
              parseInt(day, 10),
              parseInt(hour, 10),
              parseInt(minute, 10)
            )
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

            const matchDate = parisDateToUtcDate(
              parseInt(year, 10),
              month,
              parseInt(day, 10),
              parseInt(hour, 10),
              parseInt(minute, 10)
            )
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

// Catégories qui jouent en format plateau (plusieurs matchs au même endroit)
const PLATEAU_CATEGORIES = ['-11', '-9']

export function isPlateauCategory(categorie: string): boolean {
  return PLATEAU_CATEGORIES.some(cat => categorie.toUpperCase().startsWith(cat))
}

/**
 * Scrape les matchs au format plateau (catégories -11 et -9)
 *
 * Différences avec le format classique :
 * - La position des équipes (team1 vs team2) ne reflète PAS domicile/extérieur
 * - Le lieu est sur la page détail de chaque match (section "Salle")
 * - Domicile = la salle est à Aix-les-Bains (code postal 73100)
 * - Les noms d'équipes contiennent des suffixes numériques ("HBC AIX EN SAVOIE 1")
 *   qui se mélangent avec les scores dans le texte brut → parsing DOM
 */
export async function scrapeFFHandballPlateauMatches(url: string, equipeNom: string): Promise<ScrapedMatch[]> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    console.log('🔍 Navigation vers (plateau):', url)

    const pouleUrlMatch = url.match(/(.*\/poule-\d+)\/?/)
    const baseUrl = pouleUrlMatch ? pouleUrlMatch[1] : url.replace(/\/$/, '')
    console.log('📍 URL de base:', baseUrl)

    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)

    // Fermer la popup de cookies si elle existe
    try {
      const cookieButton = page.locator('button:has-text("Accepter & Fermer")')
      if (await cookieButton.isVisible({ timeout: 3000 })) {
        await cookieButton.click()
        await page.waitForTimeout(1000)
        console.log('✅ Popup de cookies fermée')
      }
    } catch (err) {
      console.log('ℹ️  Pas de popup de cookies')
    }

    // Récupérer le nom de la compétition depuis le heading de la page
    let competitionName = equipeNom
    try {
      const headings = await page.locator('h1, h2').allTextContents()
      for (const h of headings) {
        const trimmed = h.trim()
        if (trimmed && !trimmed.includes('Calendrier') && !trimmed.includes('Classement') && !trimmed.includes('Actualités')) {
          competitionName = trimmed
          break
        }
      }
    } catch (err) {}

    // Récupérer les boutons de journées (plateaux)
    const journeeButtons = await page.locator('button').all()
    const journees: string[] = []
    for (const btn of journeeButtons) {
      const text = await btn.textContent()
      if (text && /^J\d+$/.test(text.trim())) {
        journees.push(text.trim())
      }
    }

    console.log(`📅 ${journees.length} plateaux trouvés:`, journees.join(', '))

    // Phase 1 : Collecter les infos de base + hrefs depuis la page liste
    interface PlateauMatchInfo {
      href: string
      day: string
      monthName: string
      year: string
      hour: string
      minute: string
      team1: string
      team2: string
      isAvenir: boolean
      scores: number[]
      opponentLogo: string | null
    }
    const pendingMatches: PlateauMatchInfo[] = []

    for (const journee of journees) {
      console.log(`🔄 Scraping plateau ${journee}...`)

      try {
        await page.click(`button:has-text("${journee}")`)
        await page.waitForTimeout(1500)

        const matchLinks = await page.locator('a[href*="/rencontre-"]').all()
        console.log(`   🔍 ${matchLinks.length} rencontres sur le plateau`)

        for (const link of matchLinks) {
          const childData = await link.evaluate((el: HTMLAnchorElement) => {
            const childTexts: string[] = []
            const imgs: { src: string; title: string }[] = []

            for (const child of Array.from(el.children)) {
              if (child.tagName === 'IMG') {
                imgs.push({
                  src: (child as HTMLImageElement).src,
                  title: (child as HTMLImageElement).title || (child as HTMLImageElement).alt || ''
                })
              } else {
                const text = (child.textContent || '').trim()
                if (text) childTexts.push(text)
              }
            }

            return { childTexts, imgs, href: el.href }
          })

          // Catégoriser chaque morceau de texte
          const dateRegex = /(\d{1,2})\s+([^\d\s]+)\s+(\d{4})\s+à\s+(\d{1,2})H(\d{2})/
          let dateText = ''
          const teamNames: string[] = []
          const scoreTexts: string[] = []
          let isAvenir = false

          for (const text of childData.childTexts) {
            if (dateRegex.test(text)) {
              dateText = text
            } else if (text.includes('Voir détail') || text.includes('Rematch')) {
              continue
            } else if (text === '--') {
              isAvenir = true
            } else if (text.includes('--')) {
              const parts = text.split('--')
              if (parts.length === 2) {
                isAvenir = true
                teamNames.push(parts[0].trim(), parts[1].trim())
              }
            } else if (/^\d+$/.test(text) && parseInt(text) < 100) {
              scoreTexts.push(text)
            } else if (/^\d+\s*-\s*\d+$/.test(text)) {
              scoreTexts.push(...text.split('-').map(s => s.trim()))
            } else if (text.length > 1) {
              teamNames.push(text)
            }
          }

          if (!dateText || teamNames.length < 2) continue

          const dateMatch = dateText.match(dateRegex)
          if (!dateMatch) continue

          const team1 = cleanTeamName(teamNames[0])
          const team2 = cleanTeamName(teamNames[1])

          if (!isOurTeam(team1) && !isOurTeam(team2)) continue

          const opponentLogo = childData.imgs
            .filter(img => !isOurTeam(img.title))
            .map(img => img.src)[0] || null

          pendingMatches.push({
            href: childData.href,
            day: dateMatch[1],
            monthName: dateMatch[2],
            year: dateMatch[3],
            hour: dateMatch[4],
            minute: dateMatch[5],
            team1,
            team2,
            isAvenir,
            scores: scoreTexts.map(s => parseInt(s)).filter(n => !isNaN(n)),
            opponentLogo,
          })

          console.log(`   ✅ Trouvé: ${team1} vs ${team2}`)
        }
      } catch (err) {
        console.error(`❌ Erreur lors du scraping du plateau ${journee}:`, err)
      }
    }

    console.log(`\n📍 Récupération du lieu pour ${pendingMatches.length} matchs...`)

    // Phase 2 : Visiter chaque page détail pour récupérer la salle
    const allMatches: ScrapedMatch[] = []

    for (const m of pendingMatches) {
      let lieu = 'Plateau'
      let domicile = false

      try {
        await page.goto(m.href, { waitUntil: 'networkidle', timeout: 20000 })
        await page.waitForTimeout(1000)

        // Extraire la salle depuis le texte de la page
        // Format : "Salle\nNOM GYMNASE\nADRESSE\n73100 VILLE"
        const salleInfo = await page.evaluate(() => {
          const text = document.body.innerText
          // Chercher la section "Salle" et extraire nom + code postal + ville
          const salleMatch = text.match(/Salle\s*\n([^\n]+)\n([^\n]+)\n(\d{5})\s+([^\n]+)/)
          if (salleMatch) {
            return {
              nom: salleMatch[1].trim(),
              adresse: salleMatch[2].trim(),
              codePostal: salleMatch[3],
              ville: salleMatch[4].trim()
            }
          }
          return null
        })

        if (salleInfo) {
          lieu = salleInfo.nom
          // Domicile si la salle est à Aix-les-Bains (73100)
          domicile = salleInfo.codePostal === '73100'
          console.log(`   📍 ${salleInfo.nom} - ${salleInfo.ville} (${domicile ? 'domicile' : 'extérieur'})`)
        } else {
          console.log(`   ⚠️  Salle non trouvée pour ${m.team1} vs ${m.team2}`)
        }
      } catch (err) {
        console.log(`   ⚠️  Erreur page détail pour ${m.team1} vs ${m.team2}`)
      }

      const month = monthNames[m.monthName.toLowerCase()]
      if (month === undefined) continue

      const matchDate = parisDateToUtcDate(
        parseInt(m.year, 10),
        month,
        parseInt(m.day, 10),
        parseInt(m.hour, 10),
        parseInt(m.minute, 10)
      )

      const isDomicile = domicile
      const isOurTeam1 = isOurTeam(m.team1)
      const termine = !m.isAvenir && m.scores.length >= 2

      allMatches.push({
        adversaire: isOurTeam1 ? m.team2 : m.team1,
        date: matchDate,
        lieu,
        domicile: isDomicile,
        competition: competitionName,
        scoreEquipe: termine ? (isOurTeam1 ? m.scores[0] : m.scores[1]) : null,
        scoreAdversaire: termine ? (isOurTeam1 ? m.scores[1] : m.scores[0]) : null,
        termine,
        logoAdversaire: m.opponentLogo,
      })
    }

    console.log(`📦 ${allMatches.length} matchs plateau récupérés au total`)
    return allMatches

  } catch (error) {
    console.error('❌ Erreur scraping FFHANDBALL (plateau):', error)
    throw new Error(`Impossible de récupérer les matchs plateau: ${error}`)
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
      // Le texte du bouton a changé sur le site FFHB
      const cookieButton = page.locator('button:has-text("Accepter & Fermer")')
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
