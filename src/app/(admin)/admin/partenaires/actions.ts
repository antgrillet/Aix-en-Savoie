'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { partenaireSchema } from '@/lib/validations/partenaire'
import { requireAdmin } from '@/lib/auth-utils'
import { deleteImage } from '@/lib/blob'

export async function getPartenaires() {
  await requireAdmin()

  return prisma.partenaire.findMany({
    orderBy: { ordre: 'asc' },
  })
}

export async function getPartenaire(id: number) {
  await requireAdmin()

  return prisma.partenaire.findUnique({
    where: { id },
  })
}

export async function createPartenaire(formData: FormData) {
  const { user } = await requireAdmin()

  const data = {
    nom: formData.get('nom') as string,
    categorie: formData.get('categorie') as string,
    logo: formData.get('logo') as string,
    description: formData.get('description') as string,
    site: formData.get('site') as string,
    partenaire_majeur: formData.get('partenaire_majeur') === 'true',
    ordre: parseInt(formData.get('ordre') as string) || 0,
    published: formData.get('published') === 'true',
  }

  const validated = partenaireSchema.parse(data)

  await prisma.partenaire.create({
    data: {
      ...validated,
      createdBy: user.id,
    },
  })

  revalidatePath('/admin/partenaires')
  redirect('/admin/partenaires')
}

export async function updatePartenaire(id: number, formData: FormData) {
  await requireAdmin()

  const data = {
    nom: formData.get('nom') as string,
    categorie: formData.get('categorie') as string,
    logo: formData.get('logo') as string,
    description: formData.get('description') as string,
    site: formData.get('site') as string,
    partenaire_majeur: formData.get('partenaire_majeur') === 'true',
    ordre: parseInt(formData.get('ordre') as string) || 0,
    published: formData.get('published') === 'true',
  }

  const validated = partenaireSchema.parse(data)

  const existing = await prisma.partenaire.findUnique({ where: { id } })
  if (existing && existing.logo !== validated.logo) {
    await deleteImage(existing.logo)
  }

  await prisma.partenaire.update({
    where: { id },
    data: validated,
  })

  revalidatePath('/admin/partenaires')
  revalidatePath(`/admin/partenaires/${id}`)
  redirect('/admin/partenaires')
}

export async function deletePartenaire(id: number) {
  await requireAdmin()

  const partenaire = await prisma.partenaire.findUnique({ where: { id } })
  if (partenaire) {
    await deleteImage(partenaire.logo)
  }

  await prisma.partenaire.delete({ where: { id } })

  revalidatePath('/admin/partenaires')
}

export async function togglePublished(id: number) {
  await requireAdmin()

  const partenaire = await prisma.partenaire.findUnique({ where: { id } })
  if (!partenaire) throw new Error('Partenaire not found')

  await prisma.partenaire.update({
    where: { id },
    data: { published: !partenaire.published },
  })

  revalidatePath('/admin/partenaires')
}

export async function updateOrdre(updates: { id: number; ordre: number }[]) {
  await requireAdmin()

  await Promise.all(
    updates.map((update) =>
      prisma.partenaire.update({
        where: { id: update.id },
        data: { ordre: update.ordre },
      })
    )
  )

  revalidatePath('/admin/partenaires')
}
