'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'

export async function getAllInscriptions() {
  await requireAdmin()

  const inscriptions = await prisma.inscription.findMany({
    where: {
      match: {
        domicile: true, // Uniquement les matchs à domicile
      },
    },
    include: {
      match: {
        include: {
          equipe: {
            select: {
              id: true,
              nom: true,
              categorie: true,
            },
          },
        },
      },
    },
    orderBy: {
      match: {
        date: 'asc',
      },
    },
  })

  return inscriptions
}

export async function getInscriptionsStats() {
  await requireAdmin()

  // Récupérer tous les matchs à venir (uniquement à domicile)
  const matchs = await prisma.match.findMany({
    where: {
      termine: false,
      published: true,
      domicile: true, // Uniquement les matchs à domicile
    },
    include: {
      equipe: {
        select: {
          id: true,
          nom: true,
          categorie: true,
        },
      },
      inscriptions: true,
    },
    orderBy: {
      date: 'asc',
    },
  })

  // Calculer les manques pour chaque match
  const matchsAvecManques = matchs.map((match) => {
    const inscriptionsParRole = {
      tableDeMarque: match.inscriptions.filter(
        (i) => i.role === 'TABLE_DE_MARQUE'
      ).length,
      arbitre: match.inscriptions.filter((i) => i.role === 'ARBITRE').length,
      responsableSalle: match.inscriptions.filter(
        (i) => i.role === 'RESPONSABLE_SALLE'
      ).length,
      buvette: match.inscriptions.filter((i) => i.role === 'BUVETTE').length,
    }

    // Récupérer les noms des inscrits par rôle
    const inscritsParRole = {
      tableDeMarque: match.inscriptions
        .filter((i) => i.role === 'TABLE_DE_MARQUE')
        .map((i) => `${i.prenom} ${i.nom}`),
      arbitre: match.inscriptions
        .filter((i) => i.role === 'ARBITRE')
        .map((i) => `${i.prenom} ${i.nom}`),
      responsableSalle: match.inscriptions
        .filter((i) => i.role === 'RESPONSABLE_SALLE')
        .map((i) => `${i.prenom} ${i.nom}`),
      buvette: match.inscriptions
        .filter((i) => i.role === 'BUVETTE')
        .map((i) => `${i.prenom} ${i.nom}`),
    }

    const manques = {
      tableDeMarque: Math.max(0, 2 - inscriptionsParRole.tableDeMarque),
      arbitre: Math.max(0, 2 - inscriptionsParRole.arbitre),
      responsableSalle: Math.max(0, 1 - inscriptionsParRole.responsableSalle),
    }

    const totalManques =
      manques.tableDeMarque + manques.arbitre + manques.responsableSalle

    return {
      id: match.id,
      date: match.date,
      adversaire: match.adversaire,
      equipe: match.equipe,
      domicile: match.domicile,
      inscriptionsParRole,
      inscritsParRole,
      manques,
      totalManques,
    }
  })

  // Filtrer seulement les matchs avec des manques
  const matchsAvecManquesFiltered = matchsAvecManques.filter(
    (m) => m.totalManques > 0
  )

  return matchsAvecManquesFiltered
}

export async function deleteInscription(id: number) {
  await requireAdmin()

  await prisma.inscription.delete({
    where: { id },
  })

  revalidatePath('/admin/inscriptions')
  revalidatePath('/calendrier')
}
