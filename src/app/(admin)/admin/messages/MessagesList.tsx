'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Eye, EyeOff, Archive, ArchiveRestore, Trash2, Mail, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

  const MessageActions = ({ message }: { message: ContactMessage }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="w-4 h-4" />
          <span className="sr-only">Actions</span>
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
  )

  return (
    <>
      {selectedIds.length > 0 && (
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <Button onClick={handleBulkMarkAsRead} size="sm" className="w-full sm:w-auto">
            <Mail className="w-4 h-4 mr-2" />
            Marquer comme lu ({selectedIds.length})
          </Button>
          <Button
            onClick={() => setSelectedIds([])}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
        </div>
      )}

      {/* Vue Mobile - Cartes */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Aucun message
          </div>
        ) : (
          messages.map((message) => (
            <Card key={message.id} className={`overflow-hidden ${!message.read ? 'border-l-4 border-l-primary-500' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      {message.prenom} {message.nom}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">{message.email}</p>
                  </div>
                  <MessageActions message={message} />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {message.message}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    <StatusBadge status={message.read ? 'read' : 'unread'} />
                    {message.archived && <StatusBadge status="archived" />}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(message.createdAt), 'dd/MM/yy', { locale: fr })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Vue Desktop - Table */}
      <div className="hidden md:block overflow-x-auto">
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
              <TableHead className="hidden lg:table-cell">Email</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
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
                  <TableCell>
                    <div className="font-medium">
                      {message.prenom} {message.nom}
                    </div>
                    <div className="text-xs text-muted-foreground lg:hidden">{message.email}</div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{message.email}</TableCell>
                  <TableCell className="max-w-[200px] lg:max-w-xs truncate">
                    {message.message}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {format(new Date(message.createdAt), 'dd MMM yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={message.read ? 'read' : 'unread'} />
                      {message.archived && <StatusBadge status="archived" />}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <MessageActions message={message} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
