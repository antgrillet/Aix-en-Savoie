'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth-utils'
import { deleteImage } from '@/lib/blob'
import { updateHeroBackgroundImage, getSetting, updatePageBackgroundImage, getPageBackgroundImage } from '@/lib/settings'
import { prisma } from '@/lib/prisma'

export async function getHeroBackground() {
  await requireAdmin()

  return await getSetting('hero_background_image')
}

export async function updateHeroBackground(formData: FormData) {
  const session = await requireAdmin()

  const heroBackgroundImage = formData.get('heroBackgroundImage') as string

  if (!heroBackgroundImage) {
    throw new Error('Image de fond requise')
  }

  const existingSetting = await getSetting('hero_background_image')

  if (existingSetting && existingSetting.value !== heroBackgroundImage) {
    await deleteImage(existingSetting.value)
  }

  await updateHeroBackgroundImage(heroBackgroundImage, session.user.id)

  revalidatePath('/')
  revalidatePath('/admin/parametres')
}

export async function removeHeroBackground() {
  const session = await requireAdmin()

  const existingSetting = await getSetting('hero_background_image')

  if (existingSetting && existingSetting.value) {
    await deleteImage(existingSetting.value)
  }

  await updateHeroBackgroundImage('', session.user.id)

  revalidatePath('/')
  revalidatePath('/admin/parametres')
}

// Page backgrounds
export async function getPageBackground(page: string) {
  await requireAdmin()

  return await getPageBackgroundImage(page)
}

export async function updatePageBackground(formData: FormData) {
  const session = await requireAdmin()

  const page = formData.get('page') as string
  const backgroundImage = formData.get('backgroundImage') as string

  if (!page || !backgroundImage) {
    throw new Error('Page et image de fond requises')
  }

  const existingSetting = await getPageBackgroundImage(page)

  if (existingSetting && existingSetting !== backgroundImage) {
    await deleteImage(existingSetting)
  }

  await updatePageBackgroundImage(page, backgroundImage, session.user.id)

  revalidatePath(`/${page}`)
  revalidatePath('/admin/parametres')
}

export async function removePageBackground(page: string) {
  const session = await requireAdmin()

  const existingSetting = await getPageBackgroundImage(page)

  if (existingSetting) {
    await deleteImage(existingSetting)
  }

  await updatePageBackgroundImage(page, '', session.user.id)

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
