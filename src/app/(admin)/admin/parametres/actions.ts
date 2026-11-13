'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth-utils'
import { deleteImage } from '@/lib/blob'
import { updateHeroBackgroundImage, getSetting, updatePageBackgroundImage, getPageBackgroundImage } from '@/lib/settings'
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

// Calendrier password
export async function getCalendrierPassword() {
  await requireAdmin()

  const setting = await prisma.setting.findUnique({
    where: { key: 'calendrier_password' },
  })

  return setting?.value || ''
}

export async function updateCalendrierPassword(formData: FormData) {
  const session = await requireAdmin()

  const password = formData.get('password') as string

  if (!password) {
    throw new Error('Mot de passe requis')
  }

  await prisma.setting.upsert({
    where: { key: 'calendrier_password' },
    create: {
      key: 'calendrier_password',
      value: password,
      type: 'string',
      description: 'Mot de passe pour accéder au calendrier interactif',
      updatedBy: session.user.id,
    },
    update: {
      value: password,
      updatedBy: session.user.id,
    },
  })

  revalidatePath('/calendrier')
  revalidatePath('/admin/parametres')
}
