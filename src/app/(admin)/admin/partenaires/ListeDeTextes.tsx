'use client'

import { useEffect, useRef } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/admin/Button'
import { Input, Textarea } from '@/components/admin/Field'

interface ListeDeTextesProps {
  /** Préfixe des identifiants : « valeur » donne valeur-0, valeur-1… */
  id: string
  /** Nom accessible de la liste : « Valeurs partagées » */
  label: string
  items: string[]
  onChange: (items: string[]) => void
  /** Nom d'un élément, numéro compris : « Valeur 2 » */
  itemLabel: (numero: number) => string
  /** Nom du bouton de retrait : « Retirer la valeur 2 » */
  removeLabel: (numero: number) => string
  /** Nom du bouton d'ajout : « Ajouter une valeur » */
  addLabel: string
  /** Phrase affichée tant que la liste est vide */
  emptyText: string
  placeholder?: string
  /** Texte de plusieurs lignes plutôt qu'un mot */
  multiline?: boolean
  disabled?: boolean
}

/**
 * Liste de textes courts à compléter : une ligne par élément, un bouton pour
 * en ajouter. Pièce locale : le kit n'a pas de champ répété.
 */
export function ListeDeTextes({
  id,
  label,
  items,
  onChange,
  itemLabel,
  removeLabel,
  addLabel,
  emptyText,
  placeholder,
  multiline,
  disabled,
}: ListeDeTextesProps) {
  const addButton = useRef<HTMLButtonElement>(null)
  // Après un ajout, le curseur va dans la nouvelle ligne ; après un retrait,
  // le focus revient au bouton d'ajout plutôt que de se perdre.
  const focusAfterChange = useRef<'last' | 'add' | null>(null)

  useEffect(() => {
    if (focusAfterChange.current === 'last') {
      document.getElementById(`${id}-${items.length - 1}`)?.focus()
    } else if (focusAfterChange.current === 'add') {
      addButton.current?.focus()
    }
    focusAfterChange.current = null
  }, [id, items.length])

  const update = (index: number, value: string) => {
    onChange(items.map((item, i) => (i === index ? value : item)))
  }

  return (
    <div className="space-y-3">
      {items.length > 0 ? (
        <ul className="space-y-2" aria-label={label}>
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              {multiline ? (
                <Textarea
                  id={`${id}-${index}`}
                  value={item}
                  onChange={(event) => update(index, event.target.value)}
                  placeholder={placeholder}
                  aria-label={itemLabel(index + 1)}
                  disabled={disabled}
                  rows={2}
                  className="min-h-0 min-w-0 flex-1"
                />
              ) : (
                <Input
                  id={`${id}-${index}`}
                  value={item}
                  onChange={(event) => update(index, event.target.value)}
                  placeholder={placeholder}
                  aria-label={itemLabel(index + 1)}
                  disabled={disabled}
                  className="min-w-0 flex-1"
                />
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  focusAfterChange.current = 'add'
                  onChange(items.filter((_, i) => i !== index))
                }}
                disabled={disabled}
                aria-label={removeLabel(index + 1)}
              >
                <X aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="adm-meta">{emptyText}</p>
      )}

      <Button
        ref={addButton}
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          focusAfterChange.current = 'last'
          onChange([...items, ''])
        }}
        disabled={disabled}
      >
        <Plus aria-hidden="true" />
        {addLabel}
      </Button>
    </div>
  )
}
