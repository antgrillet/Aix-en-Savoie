'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export async function getMatchs() {
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
  const equipeId = parseInt(formData.get('equipeId') as string)
  const adversaire = formData.get('adversaire') as string
  const dateStr = formData.get('date') as string
  const lieu = formData.get('lieu') as string
  const domicile = formData.get('domicile') === 'true'
  const competition = formData.get('competition') as string
  const termine = formData.get('termine') === 'true'
  const published = formData.get('published') === 'true'

  let scoreEquipe = null
  let scoreAdversaire = null

  if (termine) {
    const scoreEquipeStr = formData.get('scoreEquipe') as string
    const scoreAdversaireStr = formData.get('scoreAdversaire') as string
    if (scoreEquipeStr) scoreEquipe = parseInt(scoreEquipeStr)
    if (scoreAdversaireStr) scoreAdversaire = parseInt(scoreAdversaireStr)
  }

  await prisma.match.create({
    data: {
      equipeId,
      adversaire,
      date: new Date(dateStr),
      lieu,
      domicile,
      competition: competition || null,
      termine,
      scoreEquipe,
      scoreAdversaire,
      published,
    },
  })

  revalidatePath('/admin/matchs')
  revalidatePath('/')
  redirect('/admin/matchs')
}

export async function updateMatch(id: number, formData: FormData) {
  const equipeId = parseInt(formData.get('equipeId') as string)
  const adversaire = formData.get('adversaire') as string
  const dateStr = formData.get('date') as string
  const lieu = formData.get('lieu') as string
  const domicile = formData.get('domicile') === 'true'
  const competition = formData.get('competition') as string
  const termine = formData.get('termine') === 'true'
  const published = formData.get('published') === 'true'

  let scoreEquipe = null
  let scoreAdversaire = null

  if (termine) {
    const scoreEquipeStr = formData.get('scoreEquipe') as string
    const scoreAdversaireStr = formData.get('scoreAdversaire') as string
    if (scoreEquipeStr) scoreEquipe = parseInt(scoreEquipeStr)
    if (scoreAdversaireStr) scoreAdversaire = parseInt(scoreAdversaireStr)
  }

  await prisma.match.update({
    where: { id },
    data: {
      equipeId,
      adversaire,
      date: new Date(dateStr),
      lieu,
      domicile,
      competition: competition || null,
      termine,
      scoreEquipe,
      scoreAdversaire,
      published,
    },
  })

  revalidatePath('/admin/matchs')
  revalidatePath('/')
  redirect('/admin/matchs')
}

export async function deleteMatch(id: number) {
  await prisma.match.delete({
    where: { id },
  })

  revalidatePath('/admin/matchs')
  revalidatePath('/')
}
