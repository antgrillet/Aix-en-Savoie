'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { equipeSchema } from '@/lib/validations/equipe'
import { requireAdmin } from '@/lib/auth-utils'
import { deleteImage } from '@/lib/blob'

export async function getEquipes() {
  await requireAdmin()

  return prisma.equipe.findMany({
    include: {
      entrainements: true,
    },
    orderBy: { ordre: 'asc' },
  })
}

export async function getEquipe(id: number) {
  await requireAdmin()

  return prisma.equipe.findUnique({
    where: { id },
    include: {
      entrainements: true,
    },
  })
}

export async function createEquipe(formData: FormData) {
  const { user } = await requireAdmin()

  const entrainementsData = JSON.parse(formData.get('entrainements') as string)

  const data = {
    nom: formData.get('nom') as string,
    categorie: formData.get('categorie') as string,
    genre: formData.get('genre') as string,
    description: formData.get('description') as string,
    entraineur: formData.get('entraineur') as string,
    matches: formData.get('matches') as string,
    photo: formData.get('photo') as string,
    banniere: formData.get('banniere') as string || '',
    ordre: parseInt(formData.get('ordre') as string) || 0,
    published: formData.get('published') === 'true',
    featured: formData.get('featured') === 'true',
    entrainements: entrainementsData,
  }

  const validated = equipeSchema.parse(data)

  await prisma.equipe.create({
    data: {
      nom: validated.nom,
      categorie: validated.categorie,
      genre: validated.genre,
      description: validated.description,
      entraineur: validated.entraineur,
      matches: validated.matches,
      photo: validated.photo,
      banniere: validated.banniere || null,
      ordre: validated.ordre,
      published: validated.published,
      featured: validated.featured,
      slug: validated.nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-'),
      createdBy: user.id,
      entrainements: {
        create: validated.entrainements,
      },
    },
  })

  revalidatePath('/admin/equipes')
  redirect('/admin/equipes')
}

export async function updateEquipe(id: number, formData: FormData) {
  await requireAdmin()

  const entrainementsData = JSON.parse(formData.get('entrainements') as string)

  const data = {
    nom: formData.get('nom') as string,
    categorie: formData.get('categorie') as string,
    genre: formData.get('genre') as string,
    description: formData.get('description') as string,
    entraineur: formData.get('entraineur') as string,
    matches: formData.get('matches') as string,
    photo: formData.get('photo') as string,
    banniere: formData.get('banniere') as string || '',
    ordre: parseInt(formData.get('ordre') as string) || 0,
    published: formData.get('published') === 'true',
    featured: formData.get('featured') === 'true',
    entrainements: entrainementsData,
  }

  const validated = equipeSchema.parse(data)

  const existing = await prisma.equipe.findUnique({ where: { id } })
  if (existing) {
    if (existing.photo !== validated.photo) {
      await deleteImage(existing.photo)
    }
    if (existing.banniere && existing.banniere !== validated.banniere) {
      await deleteImage(existing.banniere)
    }
  }

  await prisma.entrainement.deleteMany({ where: { equipeId: id } })

  await prisma.equipe.update({
    where: { id },
    data: {
      nom: validated.nom,
      categorie: validated.categorie,
      genre: validated.genre,
      description: validated.description,
      entraineur: validated.entraineur,
      matches: validated.matches,
      photo: validated.photo,
      banniere: validated.banniere || null,
      ordre: validated.ordre,
      published: validated.published,
      featured: validated.featured,
      slug: validated.nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-'),
      entrainements: {
        create: validated.entrainements,
      },
    },
  })

  revalidatePath('/admin/equipes')
  revalidatePath(`/admin/equipes/${id}`)
  redirect('/admin/equipes')
}

export async function deleteEquipe(id: number) {
  await requireAdmin()

  const equipe = await prisma.equipe.findUnique({ where: { id } })
  if (equipe) {
    await deleteImage(equipe.photo)
    if (equipe.banniere) {
      await deleteImage(equipe.banniere)
    }
  }

  await prisma.equipe.delete({ where: { id } })

  revalidatePath('/admin/equipes')
}

export async function togglePublished(id: number) {
  await requireAdmin()

  const equipe = await prisma.equipe.findUnique({ where: { id } })
  if (!equipe) throw new Error('Equipe not found')

  await prisma.equipe.update({
    where: { id },
    data: { published: !equipe.published },
  })

  revalidatePath('/admin/equipes')
}

export async function deleteMultipleEquipes(ids: number[]) {
  await requireAdmin()

  // Récupérer toutes les équipes à supprimer pour nettoyer leurs images
  const equipes = await prisma.equipe.findMany({
    where: { id: { in: ids } },
  })

  // Supprimer les images
  for (const equipe of equipes) {
    await deleteImage(equipe.photo)
    if (equipe.banniere) {
      await deleteImage(equipe.banniere)
    }
  }

  // Supprimer les équipes
  await prisma.equipe.deleteMany({
    where: { id: { in: ids } },
  })

  revalidatePath('/admin/equipes')
}

export async function updateOrdre(updates: { id: number; ordre: number }[]) {
  await requireAdmin()

  await Promise.all(
    updates.map((update) =>
      prisma.equipe.update({
        where: { id: update.id },
        data: { ordre: update.ordre },
      })
    )
  )

  revalidatePath('/admin/equipes')
}
