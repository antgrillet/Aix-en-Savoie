'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Eye, EyeOff, Archive, ArchiveRestore, Trash2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { DeleteDialog } from '@/components/admin/DeleteDialog'
import { Checkbox } from '@/components/ui/checkbox'
import { deleteMessage, toggleRead, toggleArchived, bulkMarkAsRead } from './actions'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ContactMessage } from '@prisma/client'

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

  return (
    <>
      {selectedIds.length > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <Button onClick={handleBulkMarkAsRead} size="sm">
            <Mail className="w-4 h-4 mr-2" />
            Marquer comme lu ({selectedIds.length})
          </Button>
          <Button
            onClick={() => setSelectedIds([])}
            variant="outline"
            size="sm"
          >
            Annuler
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedIds.length === messages.length && messages.length > 0}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead>De</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                Aucun message
              </TableCell>
            </TableRow>
          ) : (
            messages.map((message) => (
              <TableRow key={message.id} className={!message.read ? 'bg-muted/30' : ''}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(message.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedIds([...selectedIds, message.id])
                      } else {
                        setSelectedIds(selectedIds.filter((id) => id !== message.id))
                      }
                    }}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {message.prenom} {message.nom}
                </TableCell>
                <TableCell>{message.email}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {message.message}
                </TableCell>
                <TableCell>
                  {format(new Date(message.createdAt), 'dd MMM yyyy', { locale: fr })}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <StatusBadge status={message.read ? 'read' : 'unread'} />
                    {message.archived && <StatusBadge status="archived" />}
                    {message.experience && (
                      <StatusBadge status="featured" className="bg-blue-100 text-blue-800" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/messages/${message.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleRead(message.id)}>
                        {message.read ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Marquer non lu
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Marquer lu
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleArchived(message.id)}>
                        {message.archived ? (
                          <>
                            <ArchiveRestore className="w-4 h-4 mr-2" />
                            Désarchiver
                          </>
                        ) : (
                          <>
                            <Archive className="w-4 h-4 mr-2" />
                            Archiver
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(message.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

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
