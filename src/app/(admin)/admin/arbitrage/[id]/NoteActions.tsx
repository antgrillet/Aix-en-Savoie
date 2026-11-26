'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { FileDown, RotateCcw, Send, Trash2, XCircle } from 'lucide-react'
import { Button } from '@/components/admin/Button'
import { DeleteDialog } from '@/components/admin/DeleteDialog'
import { Field, Textarea } from '@/components/admin/Field'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/admin/Dialog'
import type { StatutNoteArbitrage } from '@/generated/prisma/client'
import { refuserNote, remettreEnAttente, renvoyerAuComptable, supprimerNote, type ResultatAction } from '../actions'

interface NoteActionsProps {
  id: number
  statut: StatutNoteArbitrage
  arbitre: string
  /** La note validée n'a pas encore atteint le comptable */
  envoiAFaire: boolean
}

/** Les actions secondaires d'une note ; la validation est dans son panneau. */
export function NoteActions({ id, statut, arbitre, envoiAFaire }: NoteActionsProps) {
  const router = useRouter()
  const [enCours, setEnCours] = useState<string | null>(null)
  const [refusOuvert, setRefusOuvert] = useState(false)
  const [motif, setMotif] = useState('')
  const [erreurMotif, setErreurMotif] = useState<string>()
  const [suppressionOuverte, setSuppressionOuverte] = useState(false)

  const lancer = async (cle: string, action: () => Promise<ResultatAction>, apres?: () => void) => {
    setEnCours(cle)
    try {
      const resultat = await action()
      if (resultat.ok) {
        if (resultat.avertissement) toast.warning(resultat.message, { description: resultat.avertissement, duration: 12000 })
        else toast.success(resultat.message)
        apres?.()
      } else {
        if (resultat.champs?.motif) setErreurMotif(resultat.champs.motif)
        toast.error(resultat.erreur)
      }
      return resultat.ok
    } catch {
      toast.error('L’action n’a pas abouti. Réessayez dans un instant.')
      return false
    } finally {
      setEnCours(null)
    }
  }

  const refuser = async () => {
    if (motif.trim().length < 5) {
      setErreurMotif('Expliquez le refus en quelques mots.')
      return
    }
    const ok = await lancer('refus', () => refuserNote({ id, motif }))
    if (ok) {
      setRefusOuvert(false)
      router.refresh()
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {statut === 'VALIDEE' && (
        <>
          <Button asChild variant="outline">
            <a href={`/api/admin/arbitrage/${id}/pdf`} target="_blank" rel="noreferrer">
              <FileDown aria-hidden="true" />
              PDF de la note
            </a>
          </Button>
          <Button
            variant={envoiAFaire ? 'default' : 'outline'}
            isLoading={enCours === 'envoi'}
            disabled={enCours !== null}
            onClick={() => lancer('envoi', () => renvoyerAuComptable(id), () => router.refresh())}
          >
            <Send aria-hidden="true" />
            {envoiAFaire ? 'Envoyer au comptable' : 'Renvoyer au comptable'}
          </Button>
        </>
      )}

      {statut === 'EN_ATTENTE' && (
        <Button variant="outline" disabled={enCours !== null} onClick={() => setRefusOuvert(true)}>
          <XCircle aria-hidden="true" />
          Refuser
        </Button>
      )}

      {statut === 'REFUSEE' && (
        <Button
          variant="outline"
          isLoading={enCours === 'attente'}
          disabled={enCours !== null}
          onClick={() => lancer('attente', () => remettreEnAttente(id), () => router.refresh())}
        >
          <RotateCcw aria-hidden="true" />
          Remettre à valider
        </Button>
      )}

      <Button variant="ghost" disabled={enCours !== null} onClick={() => setSuppressionOuverte(true)}>
        <Trash2 aria-hidden="true" />
        Supprimer
      </Button>

      <Dialog open={refusOuvert} onOpenChange={(open) => !enCours && setRefusOuvert(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser la note de {arbitre} ?</DialogTitle>
            <DialogDescription>
              L&apos;arbitre reçoit ce motif par e-mail et peut déposer une note corrigée.
            </DialogDescription>
          </DialogHeader>
          <Field id="motif-refus" label="Motif du refus" required error={erreurMotif} counter={{ value: motif.length, max: 1000 }}>
            <Textarea
              rows={3}
              maxLength={1000}
              value={motif}
              placeholder="Le match n'a pas été arbitré par vous, montant hors barème…"
              onChange={(e) => {
                setMotif(e.target.value)
                setErreurMotif(undefined)
              }}
            />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefusOuvert(false)} disabled={enCours !== null}>
              Annuler
            </Button>
            <Button onClick={refuser} isLoading={enCours === 'refus'}>
              Refuser la note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={suppressionOuverte}
        onOpenChange={(open) => !enCours && setSuppressionOuverte(open)}
        isLoading={enCours === 'suppression'}
        onConfirm={() =>
          lancer('suppression', () => supprimerNote(id), () => {
            setSuppressionOuverte(false)
            router.push('/admin/arbitrage')
            router.refresh()
          })
        }
        title="Supprimer cette note ?"
        description={
          statut === 'VALIDEE'
            ? 'Définitif. La note, sa signature et ses justificatifs sont effacés du site. Le mail déjà envoyé au comptable reste dans sa boîte.'
            : 'Définitif. La note et ses justificatifs sont effacés. L’arbitre n’est pas prévenu.'
        }
        confirmLabel="Supprimer la note"
      />
    </div>
  )
}
