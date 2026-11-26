import Link from 'next/link'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/admin/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/admin/Tabs'
import { getNotes } from './actions'
import { NotesList } from './NotesList'

export const metadata = { title: 'Arbitrage - Admin' }

export default async function ArbitragePage() {
  const notes = await getNotes()
  const aValider = notes.filter((n) => n.statut === 'EN_ATTENTE')
  // Une note validée dont l'envoi a échoué reste à traiter : elle passe dans « À valider ».
  const enEchec = notes.filter((n) => n.statut === 'VALIDEE' && !n.envoiComptableLe)
  const validees = notes.filter((n) => n.statut === 'VALIDEE')
  const refusees = notes.filter((n) => n.statut === 'REFUSEE')

  return (
    <div>
      <PageHeader
        title="Arbitrage"
        description="Les notes d'indemnisation déposées par les arbitres. Vérifiez, signez : la note validée part en PDF au comptable."
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/parametres#arbitrage">Lien et réglages</Link>
          </Button>
        }
      />

      <Tabs defaultValue="a-traiter">
        <TabsList aria-label="Filtrer les notes">
          <TabsTrigger value="a-traiter" count={aValider.length + enEchec.length}>
            À traiter
          </TabsTrigger>
          <TabsTrigger value="validees" count={validees.length}>
            Validées
          </TabsTrigger>
          <TabsTrigger value="refusees" count={refusees.length}>
            Refusées
          </TabsTrigger>
          <TabsTrigger value="toutes" count={notes.length}>
            Toutes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="a-traiter">
          <NotesList notes={[...enEchec, ...aValider]} vide="Aucune note à traiter" />
        </TabsContent>
        <TabsContent value="validees">
          <NotesList notes={validees} vide="Aucune note validée" />
        </TabsContent>
        <TabsContent value="refusees">
          <NotesList notes={refusees} vide="Aucune note refusée" />
        </TabsContent>
        <TabsContent value="toutes">
          <NotesList notes={notes} vide="Aucune note pour l'instant" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
