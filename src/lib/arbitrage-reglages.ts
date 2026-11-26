import { prisma } from '@/lib/prisma'
import {
  CLE_BAREME_KM,
  CLE_EMAIL_COMPTABLE,
  EMAIL_COMPTABLE_DEFAUT,
  lireBareme,
} from '@/lib/arbitrage'

export interface ReglagesArbitrage {
  /** Destinataire des notes validées */
  emailComptable: string
  /** Barème appliqué aux nouvelles notes, en centimes par kilomètre */
  baremeKmCentimes: number
}

export async function getReglagesArbitrage(): Promise<ReglagesArbitrage> {
  const reglages = await prisma.setting.findMany({
    where: { key: { in: [CLE_BAREME_KM, CLE_EMAIL_COMPTABLE] } },
  })
  const valeur = (cle: string) => reglages.find((r) => r.key === cle)?.value?.trim() || null
  return {
    emailComptable: valeur(CLE_EMAIL_COMPTABLE) ?? EMAIL_COMPTABLE_DEFAUT,
    baremeKmCentimes: lireBareme(valeur(CLE_BAREME_KM)),
  }
}
