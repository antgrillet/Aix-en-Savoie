'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/admin/Button'
import { Field } from '@/components/admin/Field'
import { FormSection } from '@/components/admin/FormSection'
import { SimpleSelect } from '@/components/admin/Select'
import { StatusMark } from '@/components/admin/StatusMark'
import { libelleSaison } from '@/lib/saisons'
import { updateSaisonAffichee } from './actions'

interface SaisonFormProps {
  /** Saison fixée par l'admin, `null` en mode automatique */
  saisonFixee: number | null
  /** Saison que donne le calendrier aujourd'hui */
  saisonAutomatique: number
}

/**
 * Saison montrée au public (résultats, calendrier des équipes). Les matchs des
 * autres saisons restent dans l'admin, rien n'est supprimé.
 */
export function SaisonForm({ saisonFixee, saisonAutomatique }: SaisonFormProps) {
  const initiale = saisonFixee === null ? 'auto' : String(saisonFixee)
  const [enregistree, setEnregistree] = useState(initiale)
  const [valeur, setValeur] = useState(initiale)
  const [loading, setLoading] = useState(false)

  const options = [
    { value: 'auto', label: `Automatique : ${libelleSaison(saisonAutomatique)}` },
    ...[saisonAutomatique + 1, saisonAutomatique, saisonAutomatique - 1].map((s) => ({
      value: String(s),
      label: `Fixer sur ${libelleSaison(s)}`,
    })),
  ]
  // Une saison fixée plus ancienne reste proposée
  if (saisonFixee !== null && !options.some((o) => o.value === String(saisonFixee))) {
    options.push({ value: String(saisonFixee), label: `Fixer sur ${libelleSaison(saisonFixee)}` })
  }

  const enCours = enregistree === 'auto' ? saisonAutomatique : Number(enregistree)

  const enregistrer = async () => {
    setLoading(true)
    try {
      await updateSaisonAffichee(valeur)
      setEnregistree(valeur)
      toast.success('Saison du site enregistrée')
    } catch {
      toast.error("La saison n'a pas pu être enregistrée. Réessayez dans un instant.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormSection
      title="Saison du site"
      description={
        <>
          Le site ne montre que les résultats et le calendrier de cette saison. Les saisons passées
          restent consultables dans Matchs.
          <span className="mt-2 block">
            <StatusMark tone="ok">{libelleSaison(enCours)} · visible sur le site</StatusMark>
          </span>
        </>
      }
    >
      <Field
        id="saison-affichee"
        label="Saison affichée"
        hint="En automatique, la saison change le 1er août. Fixez la suivante pour l'ouvrir plus tôt, dès que les calendriers sont publiés."
      >
        <SimpleSelect
          id="saison-affichee"
          value={valeur}
          onValueChange={setValeur}
          options={options}
          disabled={loading}
          className="sm:max-w-sm"
        />
      </Field>
      <Button
        type="button"
        variant={valeur !== enregistree ? 'default' : 'outline'}
        isLoading={loading}
        disabled={valeur === enregistree}
        onClick={enregistrer}
      >
        Enregistrer la saison
      </Button>
    </FormSection>
  )
}
