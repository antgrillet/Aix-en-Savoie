import { prisma } from './prisma'

export async function getSetting(key: string) {
  return await prisma.setting.findUnique({
    where: { key },
  })
}

export async function getSettings() {
  return await prisma.setting.findMany({
    orderBy: { key: 'asc' },
  })
}

export async function getHeroBackgroundImage(): Promise<string | null> {
  const setting = await getSetting('hero_background_image')
  return setting?.value || null
}

export async function updateSetting(
  key: string,
  value: string,
  updatedBy?: string
) {
  return await prisma.setting.upsert({
    where: { key },
    update: {
      value,
      updatedBy,
      updatedAt: new Date(),
    },
    create: {
      key,
      value,
      type: 'string',
      updatedBy,
    },
  })
}

export async function updateHeroBackgroundImage(
  imageUrl: string,
  updatedBy?: string
) {
  return await updateSetting('hero_background_image', imageUrl, updatedBy)
}

// Page backgrounds
export async function getPageBackgroundImage(page: string): Promise<string | null> {
  const setting = await getSetting(`${page}_background_image`)
  return setting?.value || null
}

export async function updatePageBackgroundImage(
  page: string,
  imageUrl: string,
  updatedBy?: string
) {
  return await updateSetting(`${page}_background_image`, imageUrl, updatedBy)
}
