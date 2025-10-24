'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit, Trash2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { DeleteDialog } from '@/components/admin/DeleteDialog'
import { deleteMatch } from './actions'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Match {
  id: number
  adversaire: string
  date: Date
  lieu: string
  domicile: boolean
  competition: string | null
  scoreEquipe: number | null
  scoreAdversaire: number | null
  termine: boolean
  published: boolean
  equipe: {
    id: number
    nom: string
    categorie: string
  }
}

interface MatchsListProps {
  initialMatchs: Match[]
}

export function MatchsList({ initialMatchs }: MatchsListProps) {
  const [matchs, setMatchs] = useState(initialMatchs)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      await deleteMatch(deleteId)
      setMatchs(matchs.filter((m) => m.id !== deleteId))
      toast.success('Match supprimé')
      setDeleteId(null)
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Équipe</TableHead>
              <TableHead>Match</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Lieu</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matchs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Aucun match
                </TableCell>
              </TableRow>
            ) : (
              matchs.map((match) => (
                <TableRow key={match.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{formatDate(match.date)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{match.equipe.nom}</div>
                      <div className="text-sm text-muted-foreground">{match.equipe.categorie}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{match.equipe.nom}</span>
                      <span className="text-muted-foreground">vs</span>
                      <span className="font-medium">{match.adversaire}</span>
                      {match.competition && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">{match.competition}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {match.termine && match.scoreEquipe !== null && match.scoreAdversaire !== null ? (
                      <span className="font-bold">
                        {match.scoreEquipe} - {match.scoreAdversaire}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">À venir</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`text-sm ${match.domicile ? 'text-green-600' : 'text-blue-600'}`}>
                      {match.domicile ? '🏠 Domicile' : '✈️ Extérieur'}
                    </span>
                    <div className="text-xs text-muted-foreground">{match.lieu}</div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={match.published ? 'published' : 'draft'} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/matchs/${match.id}`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(match.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
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
        title="Supprimer ce match ?"
        description="Cette action est irréversible. Le match sera définitivement supprimé."
      />
    </>
  )
}
