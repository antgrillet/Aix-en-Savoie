import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { EquipeForm } from '../EquipeForm'
import { getEquipe, updateEquipe } from '../actions'
import { SyncMatchesButton } from '@/components/admin/SyncMatchesButton'

export default async function EditEquipePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const equipe = await getEquipe(parseInt(id))

  if (!equipe) {
    notFound()
  }

  const updateWithId = updateEquipe.bind(null, equipe.id)

  // Import des matchs : utilise le lien de championnat déjà enregistré
  const syncPanel = (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
      {equipe.matches ? (
        <>
          <p className="text-xs text-muted-foreground">
            Récupère les matchs, dates, heures et scores à partir du lien enregistré.
          </p>
          <SyncMatchesButton
            equipeId={equipe.id}
            equipeNom={equipe.nom}
            hasMatchesUrl={!!equipe.matches}
            className="w-full bg-card"
          />
          <a
            href={equipe.matches}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-sm text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Ouvrir la page du championnat
            <ArrowUpRight className="size-3" />
          </a>
        </>
      ) : (
        <p className="text-xs text-muted-foreground">
          Renseignez et enregistrez un lien de championnat pour activer l'import automatique des matchs.
        </p>
      )}
    </div>
  )

  return (
    <div>
      <AdminPageHeader
        backHref="/admin/equipes"
        backLabel="Équipes"
        title={equipe.nom}
        description={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <StatusBadge status={equipe.published ? 'published' : 'draft'} />
            <span>Modifiez les informations de l'équipe</span>
          </span>
        }
        actions={
          <Button variant="outline" asChild>
            <Link href={`/equipes/${equipe.slug}`} target="_blank" rel="noopener noreferrer">
              Voir sur le site
              <ArrowUpRight />
            </Link>
          </Button>
        }
      />

      <EquipeForm action={updateWithId} initialData={equipe} syncPanel={syncPanel} />
    </div>
  )
}
