'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-utils'

export async function getMessages(filter: 'all' | 'unread' | 'archived' = 'all') {
  await requireAdmin()

  const where = filter === 'unread'
    ? { read: false, archived: false }
    : filter === 'archived'
    ? { archived: true }
    : {}

  return prisma.contactMessage.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getMessage(id: number) {
  await requireAdmin()

  const message = await prisma.contactMessage.findUnique({
    where: { id },
  })

  if (message && !message.read) {
    await prisma.contactMessage.update({
      where: { id },
      data: { read: true },
    })
  }

  return message
}

export async function toggleRead(id: number) {
  await requireAdmin()

  const message = await prisma.contactMessage.findUnique({ where: { id } })
  if (!message) throw new Error('Message not found')

  await prisma.contactMessage.update({
    where: { id },
    data: { read: !message.read },
  })

  revalidatePath('/admin/messages')
}

export async function toggleArchived(id: number) {
  await requireAdmin()

  const message = await prisma.contactMessage.findUnique({ where: { id } })
  if (!message) throw new Error('Message not found')

  await prisma.contactMessage.update({
    where: { id },
    data: { archived: !message.archived },
  })

  revalidatePath('/admin/messages')
}

export async function deleteMessage(id: number) {
  await requireAdmin()

  await prisma.contactMessage.delete({ where: { id } })

  revalidatePath('/admin/messages')
}

export async function bulkMarkAsRead(ids: number[]) {
  await requireAdmin()

  await prisma.contactMessage.updateMany({
    where: { id: { in: ids } },
    data: { read: true },
  })

  revalidatePath('/admin/messages')
}
