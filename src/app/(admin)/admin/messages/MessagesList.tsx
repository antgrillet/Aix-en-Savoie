'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Archive, ArchiveRestore, Trash2, MailOpen, MoreHorizontal, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { DeleteDialog } from '@/components/admin/DeleteDialog'
import { Checkbox } from '@/components/ui/checkbox'
import { deleteMessage, toggleRead, toggleArchived, bulkMarkAsRead } from './actions'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatParis } from '@/lib/match-format'
import { cn } from '@/lib/utils'
import type { ContactMessage } from '@/generated/prisma/client'

interface MessagesListProps {
  initialMessages: ContactMessage[]
}

export function MessagesList({ initialMessages }: MessagesListProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      await deleteMessage(deleteId)
      setMessages(messages.filter((m) => m.id !== deleteId))
      toast.success('Message supprimé')
      setDeleteId(null)
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleRead = async (id: number) => {
    try {
      await toggleRead(id)
      setMessages(
        messages.map((m) =>
          m.id === id ? { ...m, read: !m.read } : m
        )
      )
      toast.success('Statut modifié')
    } catch (error) {
      toast.error('Erreur lors de la modification')
    }
  }

  const handleToggleArchived = async (id: number) => {
    try {
      await toggleArchived(id)
      setMessages(messages.filter((m) => m.id !== id))
      toast.success('Message archivé')
    } catch (error) {
      toast.error('Erreur lors de l\'archivage')
    }
  }

  const handleBulkMarkAsRead = async () => {
    if (selectedIds.length === 0) return

    try {
      await bulkMarkAsRead(selectedIds)
      setMessages(
        messages.map((m) =>
          selectedIds.includes(m.id) ? { ...m, read: true } : m
        )
      )
      setSelectedIds([])
      toast.success(`${selectedIds.length} message(s) marqué(s) comme lu(s)`)
    } catch (error) {
      toast.error('Erreur lors du marquage')
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === messages.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(messages.map((m) => m.id))
    }
  }

  const MessageActions = ({ message }: { message: ContactMessage }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9 shrink-0 text-muted-foreground hover:text-foreground">
          <MoreHorizontal />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={`/admin/messages/${message.id}`}>
            <Eye className="mr-2 size-4" />
            Voir
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleToggleRead(message.id)}>
          {message.read ? (
            <>
              <EyeOff className="mr-2 size-4" />
              Marquer non lu
            </>
          ) : (
            <>
              <MailOpen className="mr-2 size-4" />
              Marquer lu
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleToggleArchived(message.id)}>
          {message.archived ? (
            <>
              <ArchiveRestore className="mr-2 size-4" />
              Désarchiver
            </>
          ) : (
            <>
              <Archive className="mr-2 size-4" />
              Archiver
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setDeleteId(message.id)}
          className="text-red-600 focus:bg-red-50 focus:text-red-700"
        >
          <Trash2 className="mr-2 size-4" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <Inbox className="size-5" />
        </span>
        <p className="mt-4 font-display text-base font-semibold">Aucun message</p>
        <p className="mt-1 text-sm text-muted-foreground">Les messages envoyés depuis le formulaire de contact apparaîtront ici.</p>
      </div>
    )
  }

  const allSelected = selectedIds.length === messages.length && messages.length > 0

  return (
    <>
      {/* Barre d'outils : sélection groupée */}
      <div className="flex min-h-12 flex-wrap items-center gap-x-3 gap-y-2 border-b bg-muted/30 px-4 py-2">
        <Checkbox
          checked={allSelected}
          onCheckedChange={toggleSelectAll}
          aria-label="Tout sélectionner"
          className="hidden rounded-[4px] sm:flex"
        />
        {selectedIds.length > 0 ? (
          <>
            <span className="text-sm font-medium">
              {selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}
            </span>
            <div className="ml-auto flex gap-2">
              <Button onClick={() => setSelectedIds([])} variant="ghost" size="sm">
                Annuler
              </Button>
              <Button onClick={handleBulkMarkAsRead} variant="outline" size="sm">
                <MailOpen />
                Marquer comme lu
              </Button>
            </div>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">
            {messages.length} message{messages.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Boîte de réception */}
      <ul className="divide-y">
        {messages.map((message) => {
          const unread = !message.read
          const selected = selectedIds.includes(message.id)

          return (
            <li
              key={message.id}
              className={cn(
                'group relative flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40',
                selected && 'bg-primary-50/50 hover:bg-primary-50/70'
              )}
            >
              <Checkbox
                checked={selected}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedIds([...selectedIds, message.id])
                  } else {
                    setSelectedIds(selectedIds.filter((id) => id !== message.id))
                  }
                }}
                aria-label={`Sélectionner le message de ${message.prenom} ${message.nom}`}
                className="relative z-10 mt-1 hidden rounded-[4px] sm:flex"
              />

              {/* Indicateur non lu */}
              <span
                aria-hidden
                className={cn('mt-2 size-2 shrink-0 rounded-full', unread ? 'bg-primary-500' : 'bg-transparent')}
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <Link
                    href={`/admin/messages/${message.id}`}
                    className={cn(
                      'truncate text-sm after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring',
                      unread ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'
                    )}
                  >
                    {message.prenom} {message.nom}
                    {unread && <span className="sr-only"> (non lu)</span>}
                  </Link>
                  <time
                    dateTime={new Date(message.createdAt).toISOString()}
                    title={formatParis(message.createdAt, { dateStyle: 'full', timeStyle: 'short' })}
                    className={cn(
                      'shrink-0 text-xs tabular-nums',
                      unread ? 'font-semibold text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {formatParis(message.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </time>
                </div>
                <p className="truncate text-xs text-muted-foreground">{message.email}</p>
                <p
                  className={cn(
                    'mt-1 line-clamp-2 text-sm sm:line-clamp-1',
                    unread ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {message.message}
                </p>
                {(message.archived || message.experience) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {message.archived && <StatusBadge status="archived" />}
                    {message.experience && (
                      <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-800 ring-1 ring-inset ring-primary-600/25">
                        Souhaite rejoindre le club
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="relative z-10 -my-1 -mr-2">
                <MessageActions message={message} />
              </div>
            </li>
          )
        })}
      </ul>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Supprimer ce message ?"
        description="Cette action est irréversible."
      />
    </>
  )
}
