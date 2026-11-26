'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth-utils'
import { deleteImage } from '@/lib/blob'
import { updateHeroBackgroundImage, getSetting, updatePageBackgroundImage, getPageBackgroundImage, updateSetting } from '@/lib/settings'
import { lireSaison } from '@/lib/saisons'
import { CLE_SAISON_AFFICHEE } from '@/lib/saison-courante'
import { prisma } from '@/lib/prisma'
import { imageDeFondSchema, pageAvecFondSchema } from '@/lib/validations/setting'

export async function getHeroBackground() {
  await requireAdmin()

  return await getSetting('hero_background_image')
}

export async function updateHeroBackground(formData: FormData) {
  const session = await requireAdmin()

  const image = formData.get('heroBackgroundImage') as string

  if (!image) {
    throw new Error('Image de fond requise')
  }

  const heroBackgroundImage = imageDeFondSchema.parse(image)

  const existingSetting = await getSetting('hero_background_image')

  await updateHeroBackgroundImage(heroBackgroundImage, session.user.id)

  // Ancienne image supprimée seulement une fois le réglage enregistré
  if (existingSetting && existingSetting.value !== heroBackgroundImage) {
    await deleteImage(existingSetting.value)
  }

  revalidatePath('/')
  revalidatePath('/admin/parametres')
}

export async function removeHeroBackground() {
  const session = await requireAdmin()

  const existingSetting = await getSetting('hero_background_image')

  await updateHeroBackgroundImage('', session.user.id)

  if (existingSetting && existingSetting.value) {
    await deleteImage(existingSetting.value)
  }

  revalidatePath('/')
  revalidatePath('/admin/parametres')
}

// Page backgrounds
export async function getPageBackground(pageDemandee: string) {
  await requireAdmin()

  const page = pageAvecFondSchema.parse(pageDemandee)

  return await getPageBackgroundImage(page)
}

export async function updatePageBackground(formData: FormData) {
  const session = await requireAdmin()

  const pageDemandee = formData.get('page') as string
  const image = formData.get('backgroundImage') as string

  if (!pageDemandee || !image) {
    throw new Error('Page et image de fond requises')
  }

  const page = pageAvecFondSchema.parse(pageDemandee)
  const backgroundImage = imageDeFondSchema.parse(image)

  const existingSetting = await getPageBackgroundImage(page)

  await updatePageBackgroundImage(page, backgroundImage, session.user.id)

  // Ancienne image supprimée seulement une fois le réglage enregistré
  if (existingSetting && existingSetting !== backgroundImage) {
    await deleteImage(existingSetting)
  }

  revalidatePath(`/${page}`)
  revalidatePath('/admin/parametres')
}

export async function removePageBackground(pageDemandee: string) {
  const session = await requireAdmin()

  const page = pageAvecFondSchema.parse(pageDemandee)

  const existingSetting = await getPageBackgroundImage(page)

  await updatePageBackgroundImage(page, '', session.user.id)

  if (existingSetting) {
    await deleteImage(existingSetting)
  }

  revalidatePath(`/${page}`)
  revalidatePath('/admin/parametres')
}

// Saison affichée sur le site
export async function updateSaisonAffichee(valeur: string) {
  const session = await requireAdmin()

  // « auto » : la saison suit le calendrier (bascule le 1er août)
  let enregistree = ''
  if (valeur !== 'auto') {
    const saison = lireSaison(valeur)
    if (saison === null) throw new Error('Saison invalide')
    enregistree = String(saison)
  }

  await updateSetting(CLE_SAISON_AFFICHEE, enregistree, session.user.id)

  revalidatePath('/', 'layout')
}
