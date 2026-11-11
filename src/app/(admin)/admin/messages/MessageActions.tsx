'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Archive, ArchiveRestore, Reply } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/admin/Button'
import { toggleArchived } from './actions'

interface MessageActionsProps {
  id: number
  archived: boolean
  email: string
}

/**
 * Actions de la page d'un message : répondre par courriel, archiver.
 * « Marquer comme non lu » reste dans la liste : cette page marque le message
 * comme lu à chaque affichage.
 */
export function MessageActions({ id, archived, email }: MessageActionsProps) {
  const router = useRouter()
  const [isArchiving, setIsArchiving] = useState(false)

  const handleToggleArchived = async () => {
    setIsArchiving(true)
    try {
      await toggleArchived(id)
      toast.success(archived ? 'Message désarchivé' : 'Message archivé')
      router.refresh()
    } catch {
      toast.error(
        archived
          ? "Le message n'a pas pu être désarchivé. Réessayez dans un instant."
          : "Le message n'a pas pu être archivé. Réessayez dans un instant."
      )
    } finally {
      setIsArchiving(false)
    }
  }

  const ArchiveIcon = archived ? ArchiveRestore : Archive

  return (
    <>
      <Button type="button" variant="outline" onClick={handleToggleArchived} isLoading={isArchiving}>
        {!isArchiving && <ArchiveIcon aria-hidden="true" />}
        {archived ? 'Désarchiver' : 'Archiver'}
      </Button>
      <Button asChild>
        <a href={`mailto:${email}`}>
          <Reply aria-hidden="true" />
          Répondre par courriel
        </a>
      </Button>
    </>
  )
}
