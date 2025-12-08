'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { partenaireSchema } from '@/lib/validations/partenaire'
import { requireAdmin } from '@/lib/auth-utils'
import { deleteImage } from '@/lib/blob'

function generateSlug(nom: string): string {
  return nom
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: number): Promise<string> {
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.partenaire.findUnique({
      where: { slug },
    })

    if (!existing || (excludeId && existing.id === excludeId)) {
      return slug
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }
}

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

  // Parse arrays
  const valeurs = formData.get('valeurs') ? JSON.parse(formData.get('valeurs') as string) : []
  const galerie = formData.get('galerie') ? JSON.parse(formData.get('galerie') as string) : []
  const apports = formData.get('apports') ? JSON.parse(formData.get('apports') as string) : []
  const projetsCommuns = formData.get('projetsCommuns') ? JSON.parse(formData.get('projetsCommuns') as string) : []

  // Parse JSON fields
  const reseauxSociaux = formData.get('reseauxSociaux') ? JSON.parse(formData.get('reseauxSociaux') as string) : null
  const temoignage = formData.get('temoignage') ? JSON.parse(formData.get('temoignage') as string) : null

  const data = {
    nom: formData.get('nom') as string,
    categorie: formData.get('categorie') as string,
    typePartenariat: (formData.get('typePartenariat') as string) || 'Partenaire',
    logo: formData.get('logo') as string,
    description: formData.get('description') as string,
    site: (formData.get('site') as string) || '',
    email: (formData.get('email') as string) || '',
    telephone: (formData.get('telephone') as string) || '',

    // Informations complémentaires
    anneeDemarrage: formData.get('anneeDemarrage') ? parseInt(formData.get('anneeDemarrage') as string) : null,
    valeurs,
    galerie,
    reseauxSociaux,

    // Storytelling
    accroche: (formData.get('accroche') as string) || '',
    couleurPrincipale: (formData.get('couleurPrincipale') as string) || '',
    photoCouverture: (formData.get('photoCouverture') as string) || '',
    apports,
    temoignage,
    projetsCommuns,

    // Offre promotionnelle
    promoActive: formData.get('promoActive') === 'true',
    promoTitre: (formData.get('promoTitre') as string) || '',
    promoDescription: (formData.get('promoDescription') as string) || '',
    promoCode: (formData.get('promoCode') as string) || '',
    promoExpiration: formData.get('promoExpiration')
      ? new Date(formData.get('promoExpiration') as string)
      : null,
    promoConditions: (formData.get('promoConditions') as string) || '',

    // Paramètres
    partenaire_majeur: formData.get('partenaire_majeur') === 'true',
    ordre: parseInt(formData.get('ordre') as string) || 0,
    published: formData.get('published') === 'true',
  }

  const validated = partenaireSchema.parse(data)

  // Générer un slug unique
  const baseSlug = generateSlug(validated.nom)
  const slug = await ensureUniqueSlug(baseSlug)

  await prisma.partenaire.create({
    data: {
      ...validated,
      slug,
      createdBy: user.id,
      reseauxSociaux: validated.reseauxSociaux ?? Prisma.JsonNull,
      temoignage: validated.temoignage ?? Prisma.JsonNull,
    },
  })

  revalidatePath('/admin/partenaires')
  revalidatePath('/partenaires')
  redirect('/admin/partenaires')
}

export async function updatePartenaire(id: number, formData: FormData) {
  await requireAdmin()

  // Parse arrays
  const valeurs = formData.get('valeurs') ? JSON.parse(formData.get('valeurs') as string) : []
  const galerie = formData.get('galerie') ? JSON.parse(formData.get('galerie') as string) : []
  const apports = formData.get('apports') ? JSON.parse(formData.get('apports') as string) : []
  const projetsCommuns = formData.get('projetsCommuns') ? JSON.parse(formData.get('projetsCommuns') as string) : []

  // Parse JSON fields
  const reseauxSociaux = formData.get('reseauxSociaux') ? JSON.parse(formData.get('reseauxSociaux') as string) : null
  const temoignage = formData.get('temoignage') ? JSON.parse(formData.get('temoignage') as string) : null

  const data = {
    nom: formData.get('nom') as string,
    categorie: formData.get('categorie') as string,
    typePartenariat: (formData.get('typePartenariat') as string) || 'Partenaire',
    logo: formData.get('logo') as string,
    description: formData.get('description') as string,
    site: (formData.get('site') as string) || '',
    email: (formData.get('email') as string) || '',
    telephone: (formData.get('telephone') as string) || '',

    // Informations complémentaires
    anneeDemarrage: formData.get('anneeDemarrage') ? parseInt(formData.get('anneeDemarrage') as string) : null,
    valeurs,
    galerie,
    reseauxSociaux,

    // Storytelling
    accroche: (formData.get('accroche') as string) || '',
    couleurPrincipale: (formData.get('couleurPrincipale') as string) || '',
    photoCouverture: (formData.get('photoCouverture') as string) || '',
    apports,
    temoignage,
    projetsCommuns,

    // Offre promotionnelle
    promoActive: formData.get('promoActive') === 'true',
    promoTitre: (formData.get('promoTitre') as string) || '',
    promoDescription: (formData.get('promoDescription') as string) || '',
    promoCode: (formData.get('promoCode') as string) || '',
    promoExpiration: formData.get('promoExpiration')
      ? new Date(formData.get('promoExpiration') as string)
      : null,
    promoConditions: (formData.get('promoConditions') as string) || '',

    // Paramètres
    partenaire_majeur: formData.get('partenaire_majeur') === 'true',
    ordre: parseInt(formData.get('ordre') as string) || 0,
    published: formData.get('published') === 'true',
  }

  const validated = partenaireSchema.parse(data)

  const existing = await prisma.partenaire.findUnique({ where: { id } })

  // Cleanup old images if changed
  if (existing && existing.logo !== validated.logo) {
    await deleteImage(existing.logo)
  }
  if (existing?.photoCouverture && existing.photoCouverture !== validated.photoCouverture) {
    await deleteImage(existing.photoCouverture)
  }

  // Régénérer le slug si le nom a changé
  let slug = existing?.slug
  if (!slug || (existing && existing.nom !== validated.nom)) {
    const baseSlug = generateSlug(validated.nom)
    slug = await ensureUniqueSlug(baseSlug, id)
  }

  await prisma.partenaire.update({
    where: { id },
    data: {
      ...validated,
      slug,
      reseauxSociaux: validated.reseauxSociaux ?? Prisma.JsonNull,
      temoignage: validated.temoignage ?? Prisma.JsonNull,
    },
  })

  revalidatePath('/admin/partenaires')
  revalidatePath(`/admin/partenaires/${id}`)
  revalidatePath('/partenaires')
  if (existing?.slug) {
    revalidatePath(`/partenaires/${existing.slug}`)
  }
  if (slug) {
    revalidatePath(`/partenaires/${slug}`)
  }
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

export async function deleteMultiplePartenaires(ids: number[]) {
  await requireAdmin()

  // Récupérer tous les partenaires à supprimer pour nettoyer leurs logos
  const partenaires = await prisma.partenaire.findMany({
    where: { id: { in: ids } },
  })

  // Supprimer les logos
  for (const partenaire of partenaires) {
    await deleteImage(partenaire.logo)
  }

  // Supprimer les partenaires
  await prisma.partenaire.deleteMany({
    where: { id: { in: ids } },
  })

  revalidatePath('/admin/partenaires')
}
