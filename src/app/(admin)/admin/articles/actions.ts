'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { articleSchema } from '@/lib/validations/article'
import { requireAdmin } from '@/lib/auth-utils'
import { deleteImage } from '@/lib/blob'

export async function getArticles() {
  await requireAdmin()

  return prisma.article.findMany({
    orderBy: { date: 'desc' },
  })
}

export async function getArticle(id: number) {
  await requireAdmin()

  return prisma.article.findUnique({
    where: { id },
  })
}

export async function createArticle(formData: FormData) {
  const { user } = await requireAdmin()

  const tags = JSON.parse(formData.get('tags') as string)

  const data = {
    titre: formData.get('titre') as string,
    categorie: formData.get('categorie') as string,
    date: new Date(formData.get('date') as string),
    image: formData.get('image') as string,
    resume: formData.get('resume') as string,
    contenu: formData.get('contenu') as string,
    vedette: formData.get('vedette') === 'true',
    tags,
    published: formData.get('published') === 'true',
  }

  const validated = articleSchema.parse(data)

  const slug = validated.titre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  await prisma.article.create({
    data: {
      ...validated,
      slug,
      createdBy: user.id,
    },
  })

  revalidatePath('/admin/articles')
  redirect('/admin/articles')
}

export async function updateArticle(id: number, formData: FormData) {
  await requireAdmin()

  const tags = JSON.parse(formData.get('tags') as string)

  const data = {
    titre: formData.get('titre') as string,
    categorie: formData.get('categorie') as string,
    date: new Date(formData.get('date') as string),
    image: formData.get('image') as string,
    resume: formData.get('resume') as string,
    contenu: formData.get('contenu') as string,
    vedette: formData.get('vedette') === 'true',
    tags,
    published: formData.get('published') === 'true',
  }

  const validated = articleSchema.parse(data)

  const existing = await prisma.article.findUnique({ where: { id } })
  if (existing && existing.image !== validated.image) {
    await deleteImage(existing.image)
  }

  const slug = validated.titre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  await prisma.article.update({
    where: { id },
    data: {
      ...validated,
      slug,
    },
  })

  revalidatePath('/admin/articles')
  revalidatePath(`/admin/articles/${id}`)
  redirect('/admin/articles')
}

export async function deleteArticle(id: number) {
  await requireAdmin()

  const article = await prisma.article.findUnique({ where: { id } })
  if (article) {
    await deleteImage(article.image)
  }

  await prisma.article.delete({ where: { id } })

  revalidatePath('/admin/articles')
}

export async function togglePublished(id: number) {
  await requireAdmin()

  const article = await prisma.article.findUnique({ where: { id } })
  if (!article) throw new Error('Article not found')

  await prisma.article.update({
    where: { id },
    data: { published: !article.published },
  })

  revalidatePath('/admin/articles')
}

export async function toggleVedette(id: number) {
  await requireAdmin()

  const article = await prisma.article.findUnique({ where: { id } })
  if (!article) throw new Error('Article not found')

  await prisma.article.update({
    where: { id },
    data: { vedette: !article.vedette },
  })

  revalidatePath('/admin/articles')
}
