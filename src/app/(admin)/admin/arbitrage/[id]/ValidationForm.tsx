'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/admin/Button'
import { CheckboxField, Field, Input, Textarea } from '@/components/admin/Field'
import { Section } from '@/components/admin/PageHeader'
import {
  centimesEnSaisie,
  eurosEnCentimes,
  formatCentimes,
  fraisKilometriques,
  totalCentimes,
} from '@/lib/arbitrage'
import { validerNote } from '../actions'
import { SignaturePad } from './SignaturePad'

interface ValidationFormProps {
  id: number
  emailComptable: string
  validateurParDefaut: string
  frais: {
    indemniteCentimes: number
    kilometres: number
    baremeKmCentimes: number
    fraisAnnexesCentimes: number
  }
  totalDemandeCentimes: number
}

type Champ = 'indemnite' | 'kilometres' | 'bareme' | 'fraisAnnexes' | 'validateur' | 'commentaire' | 'certification' | 'signature'

const ORDRE: Champ[] = ['indemnite', 'kilometres', 'bareme', 'fraisAnnexes', 'validateur', 'commentaire', 'certification', 'signature']

/**
 * Le visa du bureau : frais ajustables, nom, observation, certification et
 * signature. Une seule action : valider, ce qui envoie la note au comptable.
 */
export function ValidationForm({ id, emailComptable, validateurParDefaut, frais, totalDemandeCentimes }: ValidationFormProps) {
  const router = useRouter()
  const [indemnite, setIndemnite] = useState(centimesEnSaisie(frais.indemniteCentimes))
  const [kilometres, setKilometres] = useState(String(frais.kilometres))
  const [bareme, setBareme] = useState(centimesEnSaisie(frais.baremeKmCentimes))
  const [fraisAnnexes, setFraisAnnexes] = useState(centimesEnSaisie(frais.fraisAnnexesCentimes))
  const [validateur, setValidateur] = useState(validateurParDefaut)
  const [commentaire, setCommentaire] = useState('')
  const [certification, setCertification] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [erreurs, setErreurs] = useState<Partial<Record<Champ, string>>>({})
  const [envoi, setEnvoi] = useState(false)

  const apercu = useMemo(() => {
    const km = /^\d{1,4}$/.test(kilometres.trim()) ? Number(kilometres.trim()) : 0
    const f = {
      indemniteCentimes: eurosEnCentimes(indemnite) ?? 0,
      kilometres: km,
      baremeKmCentimes: eurosEnCentimes(bareme) ?? 0,
      fraisAnnexesCentimes: eurosEnCentimes(fraisAnnexes) ?? 0,
    }
    return { km: fraisKilometriques(f), total: totalCentimes(f) }
  }, [indemnite, kilometres, bareme, fraisAnnexes])

  const effacerErreur = (champ: Champ) => setErreurs((e) => (e[champ] ? { ...e, [champ]: undefined } : e))

  const valider = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (envoi) return

    const locales: Partial<Record<Champ, string>> = {}
    if (!certification) locales.certification = 'Cochez la certification.'
    if (!signature) locales.signature = 'Signez dans le cadre.'
    if (!validateur.trim()) locales.validateur = 'Indiquez votre nom.'
    if (Object.keys(locales).length > 0) {
      setErreurs(locales)
      const premier = ORDRE.find((c) => locales[c])
      toast.error(locales[premier!]!)
      document.getElementById(`validation-${premier}`)?.focus()
      return
    }

    setEnvoi(true)
    try {
      const resultat = await validerNote({
        id,
        indemnite,
        kilometres,
        bareme,
        fraisAnnexes,
        validateur,
        commentaire,
        certification: true,
        signature: signature!,
      })
      if (!resultat.ok) {
        const champs = (resultat.champs ?? {}) as Partial<Record<Champ, string>>
        setErreurs(champs)
        const premier = ORDRE.find((c) => champs[c])
        toast.error(resultat.erreur, premier ? { description: champs[premier] } : undefined)
        if (premier) document.getElementById(`validation-${premier}`)?.focus()
        router.refresh()
        return
      }
      // Les erreurs des essais précédents n'ont plus lieu d'être
      toast.dismiss()
      if (resultat.avertissement) toast.warning(resultat.message, { description: resultat.avertissement, duration: 12000 })
      else toast.success(resultat.message)
      router.refresh()
    } catch {
      toast.error('La validation n’a pas abouti. Réessayez dans un instant.')
    } finally {
      setEnvoi(false)
    }
  }

  const ajuste = apercu.total !== totalDemandeCentimes

  return (
    <Section title="Validation du bureau" bodyClassName="px-[1.125rem] pb-4 pt-4">
      <form onSubmit={valider} noValidate className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field id="validation-indemnite" label="Indemnité (€)" error={erreurs.indemnite}>
            <Input inputMode="decimal" value={indemnite} onChange={(e) => { setIndemnite(e.target.value); effacerErreur('indemnite') }} />
          </Field>
          <Field id="validation-fraisAnnexes" label="Péage, parking (€)" error={erreurs.fraisAnnexes}>
            <Input inputMode="decimal" value={fraisAnnexes} onChange={(e) => { setFraisAnnexes(e.target.value); effacerErreur('fraisAnnexes') }} />
          </Field>
          <Field id="validation-kilometres" label="Aller-retour (km)" error={erreurs.kilometres}>
            <Input inputMode="numeric" value={kilometres} onChange={(e) => { setKilometres(e.target.value); effacerErreur('kilometres') }} />
          </Field>
          <Field id="validation-bareme" label="Barème (€/km)" error={erreurs.bareme}>
            <Input inputMode="decimal" value={bareme} onChange={(e) => { setBareme(e.target.value); effacerErreur('bareme') }} />
          </Field>
        </div>

        <dl className="rounded-lg bg-muted p-3">
          <div className="flex justify-between gap-3 adm-meta">
            <dt>Déplacement</dt>
            <dd className="adm-num-sm">{formatCentimes(apercu.km)}</dd>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-3">
            <dt className="font-semibold">Total à verser</dt>
            <dd className="adm-num-md" aria-live="polite">{formatCentimes(apercu.total)}</dd>
          </div>
          {ajuste && (
            <p className="adm-meta mt-1">Demandé par l&apos;arbitre : {formatCentimes(totalDemandeCentimes)}</p>
          )}
        </dl>

        <Field id="validation-validateur" label="Validé par" required error={erreurs.validateur}>
          <Input value={validateur} autoComplete="name" onChange={(e) => { setValidateur(e.target.value); effacerErreur('validateur') }} />
        </Field>

        <Field
          id="validation-commentaire"
          label="Observation pour la trésorerie"
          optional
          error={erreurs.commentaire}
          counter={{ value: commentaire.length, max: 1000 }}
        >
          <Textarea rows={2} value={commentaire} maxLength={1000} placeholder="Feuille de match vérifiée, RAS." onChange={(e) => setCommentaire(e.target.value)} />
        </Field>

        <div>
          <CheckboxField
            id="validation-certification"
            label="Je certifie la présence de l'arbitre et l'exactitude des montants"
            description="Avant transmission à la comptabilité."
            checked={certification}
            onCheckedChange={(c) => { setCertification(c === true); effacerErreur('certification') }}
          />
          {erreurs.certification && (
            <p className="mt-1 text-[0.875rem] font-medium" style={{ color: 'var(--adm-bad)' }}>
              {erreurs.certification}
            </p>
          )}
        </div>

        <div>
          <p className="mb-1.5 font-medium" id="validation-signature-libelle">
            Signature <span className="adm-meta">(obligatoire)</span>
          </p>
          <SignaturePad
            id="validation-signature"
            nom={validateur}
            onChange={(valeur) => { setSignature(valeur); effacerErreur('signature') }}
            invalid={Boolean(erreurs.signature)}
            describedBy={erreurs.signature ? 'validation-signature-erreur' : 'validation-signature-libelle'}
          />
          {erreurs.signature && (
            <p id="validation-signature-erreur" className="mt-1 text-[0.875rem] font-medium" style={{ color: 'var(--adm-bad)' }}>
              {erreurs.signature}
            </p>
          )}
        </div>

        <div className="border-t border-border pt-4">
          <Button type="submit" isLoading={envoi} className="w-full">
            Valider et envoyer au comptable
          </Button>
          <p className="adm-meta mt-2 text-center">
            PDF signé et justificatifs envoyés à <span className="break-all">{emailComptable}</span>. L&apos;arbitre est prévenu.
          </p>
        </div>
      </form>
    </Section>
  )
}
