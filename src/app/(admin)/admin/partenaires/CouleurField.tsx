'use client'

import { useState } from 'react'
import { Field, Input } from '@/components/admin/Field'

// Même format que `partenaireSchema.couleurPrincipale`
const HEX = /^#[0-9A-Fa-f]{6}$/

interface CouleurFieldProps {
  /** Couleur enregistrée, ou la couleur par défaut du site */
  initialValue: string
}

/**
 * Couleur de marque : la palette du navigateur et sa valeur écrite, tenues
 * ensemble. C'est la palette qui est envoyée (`couleurPrincipale`) : un code
 * mal écrit n'est jamais envoyé, le champ reprend la dernière couleur valide.
 * Pièce locale : le kit n'a pas de champ couleur.
 */
export function CouleurField({ initialValue }: CouleurFieldProps) {
  const [couleur, setCouleur] = useState(initialValue)
  const [texte, setTexte] = useState(initialValue.toUpperCase())

  return (
    <Field
      id="couleurTexte"
      label="Couleur de marque"
      hint="Couleur des accents sur sa page. Au clavier : # suivi de six caractères, de 0 à 9 et de A à F."
    >
      <div className="flex gap-2">
        <input
          type="color"
          name="couleurPrincipale"
          value={couleur}
          onChange={(event) => {
            setCouleur(event.target.value)
            setTexte(event.target.value.toUpperCase())
          }}
          aria-label="Choisir la couleur de marque dans la palette"
          className="h-11 w-14 shrink-0 cursor-pointer rounded-[3px] border border-input bg-background p-1 transition-colors duration-150 ease-out hover:border-foreground md:h-10"
        />
        <Input
          id="couleurTexte"
          aria-describedby="couleurTexte-aide"
          value={texte}
          onChange={(event) => {
            setTexte(event.target.value)
            if (HEX.test(event.target.value)) setCouleur(event.target.value)
          }}
          onBlur={() => {
            if (!HEX.test(texte)) setTexte(couleur.toUpperCase())
          }}
          placeholder="#FF6B35"
          spellCheck={false}
          autoComplete="off"
          className="w-32"
        />
      </div>
    </Field>
  )
}
