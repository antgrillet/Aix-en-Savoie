'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Edit, Trash2, Calendar, Filter, MoreVertical, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  const [selectedEquipeId, setSelectedEquipeId] = useState<string>('all')

  // Extraire les équipes uniques depuis les matchs
  const equipes = useMemo(() => {
    const uniqueEquipes = new Map<number, { id: number; nom: string; categorie: string }>()
    initialMatchs.forEach((match) => {
      if (!uniqueEquipes.has(match.equipe.id)) {
        uniqueEquipes.set(match.equipe.id, match.equipe)
      }
    })
    return Array.from(uniqueEquipes.values()).sort((a, b) => a.nom.localeCompare(b.nom))
  }, [initialMatchs])

  // Filtrer les matchs par équipe
  const filteredMatchs = useMemo(() => {
    if (selectedEquipeId === 'all') return matchs
    return matchs.filter((match) => match.equipe.id === parseInt(selectedEquipeId))
  }, [matchs, selectedEquipeId])

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      await deleteMatch(deleteId)
      setMatchs(matchs.filter((m) => m.id !== deleteId))
      toast.success('Match supprimé')
      setDeleteId(null)
    } catch (_error) {
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
    })
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatFullDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const MatchActions = ({ match }: { match: Match }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="w-4 h-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/matchs/${match.id}`}>
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setDeleteId(match.id)}
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
      {/* Filtre par équipe - responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>Filtrer :</span>
        </div>
        <Select value={selectedEquipeId} onValueChange={setSelectedEquipeId}>
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Toutes les équipes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les équipes</SelectItem>
            {equipes.map((equipe) => (
              <SelectItem key={equipe.id} value={equipe.id.toString()}>
                {equipe.nom} ({equipe.categorie})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filteredMatchs.length} match{filteredMatchs.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Vue Mobile - Cartes */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredMatchs.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {selectedEquipeId === 'all' ? 'Aucun match' : 'Aucun match pour cette équipe'}
          </div>
        ) : (
          filteredMatchs.map((match) => (
            <Card key={match.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="font-medium text-sm">{match.equipe.nom}</div>
                    <div className="text-xs text-muted-foreground">{match.equipe.categorie}</div>
                  </div>
                  <MatchActions match={match} />
                </div>

                <div className="flex items-center justify-center gap-3 py-3 bg-muted/50 rounded-lg mb-3">
                  <span className="font-semibold text-sm">{match.equipe.nom}</span>
                  {match.termine && match.scoreEquipe !== null && match.scoreAdversaire !== null ? (
                    <span className="font-bold text-lg px-3">
                      {match.scoreEquipe} - {match.scoreAdversaire}
                    </span>
                  ) : (
                    <span className="text-muted-foreground px-3">vs</span>
                  )}
                  <span className="font-semibold text-sm">{match.adversaire}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(match.date)} à {formatTime(match.date)}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full ${
                    match.domicile
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {match.domicile ? 'Dom' : 'Ext'}
                  </span>
                  {match.competition && (
                    <span className="bg-muted px-2 py-0.5 rounded">{match.competition}</span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[150px]">{match.lieu}</span>
                  </div>
                  <StatusBadge status={match.published ? 'published' : 'draft'} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Vue Desktop - Table */}
      <div className="hidden md:block rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Équipe</TableHead>
              <TableHead>Match</TableHead>
              <TableHead className="hidden lg:table-cell">Score</TableHead>
              <TableHead className="hidden lg:table-cell">Lieu</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMatchs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {selectedEquipeId === 'all' ? 'Aucun match' : 'Aucun match pour cette équipe'}
                </TableCell>
              </TableRow>
            ) : (
              filteredMatchs.map((match) => (
                <TableRow key={match.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground hidden lg:block" />
                      <div>
                        <span className="font-medium">{formatDate(match.date)}</span>
                        <span className="text-muted-foreground text-xs block lg:inline lg:ml-1">
                          {formatTime(match.date)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{match.equipe.nom}</div>
                      <div className="text-sm text-muted-foreground">{match.equipe.categorie}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-2">
                      <span className="font-medium">{match.equipe.nom}</span>
                      <span className="text-muted-foreground">vs</span>
                      <span className="font-medium">{match.adversaire}</span>
                      {match.competition && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded w-fit">{match.competition}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {match.termine && match.scoreEquipe !== null && match.scoreAdversaire !== null ? (
                      <span className="font-bold">
                        {match.scoreEquipe} - {match.scoreAdversaire}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">À venir</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className={`text-sm ${match.domicile ? 'text-green-600' : 'text-blue-600'}`}>
                      {match.domicile ? 'Dom' : 'Ext'}
                    </span>
                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">{match.lieu}</div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={match.published ? 'published' : 'draft'} />
                  </TableCell>
                  <TableCell className="text-right">
                    <MatchActions match={match} />
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
