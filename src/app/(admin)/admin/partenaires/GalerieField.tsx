'use client'

import { Plus, X } from 'lucide-react'
import { Button } from '@/components/admin/Button'
import { Field } from '@/components/admin/Field'
import { ImageUpload } from '@/components/admin/ImageUpload'

interface GalerieFieldProps {
  images: string[]
  onChange: (images: string[]) => void
  /** Erreurs par identifiant de champ : galerie-0, galerie-1… */
  errors: Record<string, string>
  onClearError: (champ: string) => void
  disabled?: boolean
}

/**
 * Photos de la galerie : un emplacement par photo. Un emplacement vide se
 * remplit ou se retire avant l'enregistrement. Pièce locale : le kit n'a pas
 * d'envoi de plusieurs images.
 */
export function GalerieField({ images, onChange, errors, onClearError, disabled }: GalerieFieldProps) {
  const remove = (index: number) => {
    onClearError(`galerie-${index}`)
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {images.length > 0 ? (
        <ul className="grid gap-5 sm:grid-cols-2" aria-label="Photos de la galerie">
          {images.map((image, index) => (
            <li key={index} className="space-y-2">
              <Field
                id={`galerie-${index}`}
                label={`Photo ${index + 1}`}
                error={errors[`galerie-${index}`]}
              >
                <ImageUpload
                  value={image}
                  onChange={(url) => {
                    onClearError(`galerie-${index}`)
                    onChange(images.map((item, i) => (i === index ? url : item)))
                  }}
                  onRemove={() => remove(index)}
                  disabled={disabled}
                  folder="partenaires/galerie"
                  previewAlt={`Photo ${index + 1} de la galerie`}
                />
              </Field>
              {!image && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={disabled}
                >
                  <X aria-hidden="true" />
                  Retirer l'emplacement
                  <span className="sr-only"> de la photo {index + 1}</span>
                </Button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="adm-meta">Aucune photo dans la galerie pour l'instant.</p>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...images, ''])}
        disabled={disabled}
      >
        <Plus aria-hidden="true" />
        Ajouter une photo
      </Button>
    </div>
  )
}
