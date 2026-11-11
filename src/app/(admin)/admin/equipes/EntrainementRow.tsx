'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/admin/Button'
import { Field, Input } from '@/components/admin/Field'
import { SimpleSelect } from '@/components/admin/Select'

export interface Creneau {
  jour: string
  horaire: string
  lieu: string
}

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const LIEUX = ['Gymnase des Prés-Riants', 'G4 Marlioz', 'G2 Marlioz']

/** Une valeur déjà enregistrée hors de la liste reste affichée, au lieu d'un champ vide */
function toOptions(values: string[], current: string) {
  const all = current && !values.includes(current) ? [...values, current] : values
  return all.map((value) => ({ value, label: value }))
}

// À partir de `sm`, les libellés sont portés par la ligne d'en-tête du
// formulaire : ceux des champs restent lus par les lecteurs d'écran.
const LABEL_EN_TETE = 'sm:[&>div:first-child]:sr-only'

interface EntrainementRowProps {
  index: number
  creneau: Creneau
  /** Erreurs du formulaire, repérées par l'identifiant du champ */
  errors: Record<string, string | undefined>
  onChange: (field: 'jour' | 'horaire' | 'lieu', value: string) => void
  onRemove: () => void
  canRemove: boolean
}

/**
 * Un créneau d'entraînement. Sur téléphone : un bloc titré, jour et horaire
 * côte à côte, lieu dessous. À partir de `sm` : une ligne de trois champs,
 * alignée sur l'en-tête de colonnes posé par `EquipeForm`.
 */
export function EntrainementRow({
  index,
  creneau,
  errors,
  onChange,
  onRemove,
  canRemove,
}: EntrainementRowProps) {
  const numero = index + 1
  const id = (champ: string) => `creneau-${index}-${champ}`

  return (
    <li className="max-sm:py-4 max-sm:first:pt-0 max-sm:last:pb-0">
      <div
        role="group"
        aria-label={`Créneau ${numero}`}
        className="grid grid-cols-2 gap-3 sm:grid-cols-[9rem_10rem_minmax(0,1fr)_2.75rem] sm:items-start md:grid-cols-[9rem_10rem_minmax(0,1fr)_2.5rem]"
      >
        <p aria-hidden="true" className="adm-h3 self-center sm:hidden">
          Créneau {numero}
        </p>

        <Field
          id={id('jour')}
          label={
            <>
              Jour<span className="sr-only"> du créneau {numero}</span>
            </>
          }
          required
          error={errors[id('jour')]}
          className={LABEL_EN_TETE}
        >
          <SimpleSelect
            value={creneau.jour}
            onValueChange={(value) => onChange('jour', value)}
            options={toOptions(JOURS, creneau.jour)}
            placeholder="Choisir"
          />
        </Field>

        <Field
          id={id('horaire')}
          label={
            <>
              Horaire<span className="sr-only"> du créneau {numero}</span>
            </>
          }
          required
          error={errors[id('horaire')]}
          className={LABEL_EN_TETE}
        >
          <Input
            value={creneau.horaire}
            onChange={(e) => onChange('horaire', e.target.value)}
            placeholder="18h00 - 20h00"
          />
        </Field>

        <Field
          id={id('lieu')}
          label={
            <>
              Lieu<span className="sr-only"> du créneau {numero}</span>
            </>
          }
          optional
          className={`max-sm:col-span-2 ${LABEL_EN_TETE}`}
        >
          <SimpleSelect
            value={creneau.lieu || ''}
            onValueChange={(value) => onChange('lieu', value)}
            options={toOptions(LIEUX, creneau.lieu)}
            placeholder="Choisir un gymnase"
          />
        </Field>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label={`Retirer le créneau ${numero}`}
          className="max-sm:col-start-2 max-sm:row-start-1 max-sm:justify-self-end md:size-10"
        >
          <X aria-hidden="true" />
        </Button>
      </div>
    </li>
  )
}
