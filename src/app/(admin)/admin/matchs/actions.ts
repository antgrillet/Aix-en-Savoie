'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-utils'
import { lireMatchFormData } from '@/lib/validations/match'

async function revalidateMatchsPublic(...equipeIds: (number | null | undefined)[]) {
  revalidatePath('/')
  revalidatePath('/calendrier')
  revalidatePath('/equipes')

  const ids = [...new Set(equipeIds.filter((id): id is number => typeof id === 'number'))]
  if (ids.length === 0) return

  const equipes = await prisma.equipe.findMany({
    where: { id: { in: ids } },
    select: { slug: true },
  })

  for (const equipe of equipes) {
    revalidatePath(`/equipes/${equipe.slug}`)
  }
}

export async function getMatchs() {
  await requireAdmin()
  const matchs = await prisma.match.findMany({
    include: {
      equipe: {
        select: {
          id: true,
          nom: true,
          categorie: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  })

  return matchs
}

export async function getMatch(id: number) {
  await requireAdmin()
  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      equipe: {
        select: {
          id: true,
          nom: true,
          categorie: true,
        },
      },
    },
  })

  return match
}

export async function getEquipesForSelect() {
  await requireAdmin()
  const equipes = await prisma.equipe.findMany({
    where: {
      published: true,
    },
    select: {
      id: true,
      nom: true,
      categorie: true,
    },
    orderBy: {
      ordre: 'asc',
    },
  })

  return equipes
}

export async function createMatch(formData: FormData) {
  await requireAdmin()
  const data = lireMatchFormData(formData)

  await prisma.match.create({
    data,
  })

  revalidatePath('/admin/matchs')
  await revalidateMatchsPublic(data.equipeId)
  redirect('/admin/matchs')
}

export async function updateMatch(id: number, formData: FormData) {
  await requireAdmin()
  const data = lireMatchFormData(formData)

  const existing = await prisma.match.findUnique({
    where: { id },
    select: { equipeId: true },
  })

  await prisma.match.update({
    where: { id },
    data,
  })

  revalidatePath('/admin/matchs')
  await revalidateMatchsPublic(data.equipeId, existing?.equipeId)
  redirect('/admin/matchs')
}

export async function deleteMatch(id: number) {
  await requireAdmin()
  const existing = await prisma.match.findUnique({
    where: { id },
    select: { equipeId: true },
  })

  await prisma.match.delete({
    where: { id },
  })

  revalidatePath('/admin/matchs')
  await revalidateMatchsPublic(existing?.equipeId)
}
