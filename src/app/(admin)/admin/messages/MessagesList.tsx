'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import { Archive, ArchiveRestore, ExternalLink, Mail, MailOpen, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/admin/Button'
import { DataList, type DataColumn } from '@/components/admin/DataList'
import { DeleteDialog } from '@/components/admin/DeleteDialog'
import { EmptyState } from '@/components/admin/EmptyState'
import { Checkbox } from '@/components/admin/Field'
import { ListCount } from '@/components/admin/FilterBar'
import { RowActions } from '@/components/admin/RowActions'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { cn } from '@/lib/utils'
import { deleteMessage, toggleRead, toggleArchived, bulkMarkAsRead } from './actions'
import type { ContactMessage } from '@/generated/prisma/client'

export type MessagesView = 'all' | 'unread' | 'archived'

interface MessagesListProps {
  initialMessages: ContactMessage[]
  /** Onglet affiché : il choisit le texte de l'état vide */
  view: MessagesView
}

const formatDate = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

function expediteur(message: ContactMessage) {
  return `${message.prenom} ${message.nom}`
}

export function MessagesList({ initialMessages, view }: MessagesListProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [busyId, setBusyId] = useState<number | null>(null)
  const [isMarking, setIsMarking] = useState(false)
  const selectAllId = useId()

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      await deleteMessage(deleteId)
      setMessages(messages.filter((m) => m.id !== deleteId))
      setSelectedIds(selectedIds.filter((id) => id !== deleteId))
      toast.success('Message supprimé')
      setDeleteId(null)
    } catch {
      toast.error("Le message n'a pas pu être supprimé. Réessayez dans un instant.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleRead = async (message: ContactMessage) => {
    setBusyId(message.id)
    try {
      await toggleRead(message.id)
      setMessages(messages.map((m) => (m.id === message.id ? { ...m, read: !m.read } : m)))
      toast.success(message.read ? 'Message marqué comme non lu' : 'Message marqué comme lu')
    } catch {
      toast.error("Le statut du message n'a pas pu être modifié. Réessayez dans un instant.")
    } finally {
      setBusyId(null)
    }
  }

  const handleToggleArchived = async (message: ContactMessage) => {
    setBusyId(message.id)
    try {
      await toggleArchived(message.id)
      setMessages(messages.filter((m) => m.id !== message.id))
      setSelectedIds(selectedIds.filter((id) => id !== message.id))
      toast.success(message.archived ? 'Message désarchivé' : 'Message archivé')
    } catch {
      toast.error(
        message.archived
          ? "Le message n'a pas pu être désarchivé. Réessayez dans un instant."
          : "Le message n'a pas pu être archivé. Réessayez dans un instant."
      )
    } finally {
      setBusyId(null)
    }
  }

  const handleBulkMarkAsRead = async () => {
    if (selectedIds.length === 0) return

    setIsMarking(true)
    try {
      await bulkMarkAsRead(selectedIds)
      setMessages(messages.map((m) => (selectedIds.includes(m.id) ? { ...m, read: true } : m)))
      setSelectedIds([])
      toast.success(
        selectedIds.length > 1
          ? `${selectedIds.length} messages marqués comme lus`
          : '1 message marqué comme lu'
      )
    } catch {
      toast.error("Les messages n'ont pas pu être marqués comme lus. Réessayez dans un instant.")
    } finally {
      setIsMarking(false)
    }
  }

  const allSelected = messages.length > 0 && selectedIds.length === messages.length

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(messages.map((m) => m.id))
    }
  }

  const columns: DataColumn<ContactMessage>[] = [
    {
      id: 'de',
      header: 'De',
      phone: 'title',
      cell: (message) => (
        <span className="flex items-center gap-3">
          {/* Sélection par lot : grand écran seulement, comme avant */}
          <Checkbox
            className="hidden md:grid"
            checked={selectedIds.includes(message.id)}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedIds([...selectedIds, message.id])
              } else {
                setSelectedIds(selectedIds.filter((id) => id !== message.id))
              }
            }}
            aria-label={`Sélectionner le message de ${expediteur(message)}`}
          />
          <span className="min-w-0 flex-1">
            {/* Pas de préchargement : ouvrir la page marque le message comme lu */}
            <Link
              href={`/admin/messages/${message.id}`}
              prefetch={false}
              className={cn(
                'adm-row-link decoration-1 underline-offset-4 hover:underline',
                message.read ? 'font-normal' : 'font-semibold'
              )}
            >
              {expediteur(message)}
            </Link>
            <span className="adm-meta block truncate font-normal md:max-w-[13rem] xl:hidden">
              {message.email}
            </span>
            <span
              className={cn(
                'mt-1 line-clamp-2 text-[0.8125rem] font-normal leading-snug md:hidden',
                message.read && 'text-muted-foreground'
              )}
            >
              {message.message}
            </span>
          </span>
        </span>
      ),
    },
    {
      id: 'email',
      header: 'Courriel',
      className: 'hidden xl:table-cell',
      phone: 'hidden',
      cell: (message) => <span className="break-all">{message.email}</span>,
    },
    {
      id: 'message',
      header: 'Message',
      className: 'max-w-[13rem] truncate xl:max-w-[18rem] 2xl:max-w-[28rem]',
      phone: 'hidden',
      cell: (message) => (
        <span className={message.read ? 'text-muted-foreground' : undefined}>{message.message}</span>
      ),
    },
    {
      id: 'date',
      header: 'Reçu le',
      className: 'whitespace-nowrap',
      cell: (message) => formatDate.format(new Date(message.createdAt)),
    },
    {
      id: 'statut',
      header: 'Statut',
      phone: 'marks',
      cell: (message) => (
        <span className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={message.read ? 'read' : 'unread'} />
          {message.archived && <StatusBadge status="archived" />}
        </span>
      ),
    },
  ]

  if (messages.length === 0) {
    if (view === 'unread') {
      return (
        <EmptyState title="Aucun message non lu">
          <p>
            Tout a été lu. Un nouveau message envoyé depuis le site apparaîtra ici, et son compte
            dans le menu.
          </p>
        </EmptyState>
      )
    }

    if (view === 'archived') {
      return (
        <EmptyState title="Aucun message archivé">
          <p>
            Archiver un message le sort des non lus sans le supprimer : il reste consultable ici.
            L'action « Archiver » se trouve dans le menu de chaque message.
          </p>
        </EmptyState>
      )
    }

    return (
      <EmptyState
        title="Aucun message pour l'instant"
        action={
          <Button asChild variant="outline">
            <a href="/contact" target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden="true" />
              Voir la page Contact
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
          </Button>
        }
      >
        <p>
          Les messages envoyés depuis la page Contact du site arrivent ici, avec les coordonnées de
          leur expéditeur pour lui répondre.
        </p>
      </EmptyState>
    )
  }

  return (
    <>
      <div className="mb-4 flex min-h-10 flex-wrap items-center gap-x-4 gap-y-2">
        <div className="hidden min-h-10 flex-wrap items-center gap-x-4 gap-y-2 md:flex">
          <div className="flex items-center gap-3">
            <Checkbox id={selectAllId} checked={allSelected} onCheckedChange={toggleSelectAll} />
            <label htmlFor={selectAllId} className="cursor-pointer text-[0.8125rem] font-medium">
              Tout sélectionner
            </label>
          </div>
          {selectedIds.length > 0 && (
            <>
              <Button type="button" size="sm" onClick={handleBulkMarkAsRead} isLoading={isMarking}>
                {!isMarking && <MailOpen aria-hidden="true" />}
                Marquer comme {selectedIds.length > 1 ? 'lus' : 'lu'} ({selectedIds.length})
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds([])}
                disabled={isMarking}
              >
                Annuler la sélection
              </Button>
            </>
          )}
        </div>
        <ListCount
          shown={messages.length}
          singular="message"
          plural="messages"
          className="ml-auto"
        />
      </div>

      <DataList
        caption="Messages"
        items={messages}
        columns={columns}
        getKey={(message) => message.id}
        actions={(message) => (
          <RowActions
            label={`Actions pour le message de ${expediteur(message)}`}
            items={[
              {
                label: 'Ouvrir le message',
                icon: MailOpen,
                href: `/admin/messages/${message.id}`,
              },
              {
                label: message.read ? 'Marquer comme non lu' : 'Marquer comme lu',
                icon: message.read ? Mail : MailOpen,
                onSelect: () => handleToggleRead(message),
                disabled: busyId === message.id,
              },
              {
                label: message.archived ? 'Désarchiver' : 'Archiver',
                icon: message.archived ? ArchiveRestore : Archive,
                onSelect: () => handleToggleArchived(message),
                disabled: busyId === message.id,
              },
              'separator',
              {
                label: 'Supprimer',
                icon: Trash2,
                destructive: true,
                onSelect: () => setDeleteId(message.id),
              },
            ]}
          />
        )}
      />

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Supprimer ce message ?"
        description="Cette action est irréversible. Le message et les coordonnées de son expéditeur seront définitivement supprimés."
        confirmLabel="Supprimer le message"
      />
    </>
  )
}
