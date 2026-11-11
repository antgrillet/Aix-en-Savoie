'use client'

import { useState } from 'react'
import { Check, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/admin/Button'
import { DeleteDialog } from '@/components/admin/DeleteDialog'
import { Field } from '@/components/admin/Field'
import { FormSection } from '@/components/admin/FormSection'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { StatusMark } from '@/components/admin/StatusMark'

interface BackgroundSettingProps {
  /** Identifiant du réglage, unique dans la page : « fond-accueil » */
  id: string
  title: string
  description: string
  /** Image en place sur le site à l'ouverture de la page */
  initialImage: string
  /** Ce que le site montre une fois l'image retirée, en une phrase */
  fallback: string
  /** Enregistre l'image choisie */
  onSave: (url: string) => Promise<void>
  /** Retire du site l'image en place */
  onRemove: () => Promise<void>
}

/**
 * Réglage d'une image de fond : une section avec son propre enregistrement.
 * La marque dit ce qui est en place sur le site aujourd'hui ; une image choisie
 * mais pas encore enregistrée ne la change pas.
 */
export function BackgroundSetting({
  id,
  title,
  description,
  initialImage,
  fallback,
  onSave,
  onRemove,
}: BackgroundSettingProps) {
  // `saved` : l'image en place sur le site. `image` : celle que montre le champ.
  const [saved, setSaved] = useState(initialImage)
  const [image, setImage] = useState(initialImage)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [error, setError] = useState('')
  const [justSaved, setJustSaved] = useState(false)

  const isDirty = image !== '' && image !== saved
  const isReplacing = image === '' && saved !== ''
  const busy = isSubmitting || isRemoving

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isDirty) return

    setIsSubmitting(true)
    setError('')

    try {
      await onSave(image)
      setSaved(image)
      setJustSaved(true)
      toast.success('Image de fond enregistrée', { description: title })
    } catch (saveError) {
      console.error('Erreur lors de la mise à jour:', saveError)
      setError("L'image n'a pas pu être enregistrée. Réessayez dans un instant.")
      toast.error("L'image de fond n'a pas pu être enregistrée.", { description: title })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    setError('')

    try {
      await onRemove()
      setSaved('')
      setImage('')
      setJustSaved(false)
      setConfirmRemove(false)
      toast.success('Image de fond retirée du site', { description: title })
    } catch (removeError) {
      console.error('Erreur lors de la suppression:', removeError)
      setConfirmRemove(false)
      setError("L'image n'a pas pu être retirée. Réessayez dans un instant.")
      toast.error("L'image de fond n'a pas pu être retirée.", { description: title })
    } finally {
      setIsRemoving(false)
    }
  }

  // « Retirer l'image » sous l'aperçu ne touche pas au site : une image pas
  // encore enregistrée s'abandonne, une image en place laisse la zone de dépôt
  // pour en choisir une autre. Le retrait du site se confirme à part.
  const handleImageRemove = () => {
    setError('')
    setJustSaved(false)
    setImage(image === saved ? '' : saved)
  }

  return (
    <FormSection
      title={title}
      optional
      description={
        <>
          {description}
          <span className="mt-2 block">
            <StatusMark tone={saved ? 'solid' : 'dashed'}>{saved ? 'En place' : 'Aucune image'}</StatusMark>
          </span>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Field
          id={id}
          label="Image de fond"
          error={error}
          hint="Une image large, 1920 × 1080 px au moins, pour rester nette sur grand écran."
        >
          <ImageUpload
            value={image}
            onChange={(url) => {
              setImage(url)
              setError('')
              setJustSaved(false)
            }}
            onRemove={handleImageRemove}
            disabled={busy}
            folder="settings"
            previewAlt={`${title} : aperçu`}
          />
        </Field>

        {(isDirty || isReplacing || justSaved) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            {isDirty && (
              <Button type="submit" isLoading={isSubmitting}>
                Enregistrer l'image
              </Button>
            )}
            {isReplacing && (
              <>
                <Button type="button" variant="outline" onClick={() => setImage(saved)} disabled={busy}>
                  Garder l'image actuelle
                </Button>
                <Button type="button" variant="outline" onClick={() => setConfirmRemove(true)} disabled={busy}>
                  <Trash2 aria-hidden="true" />
                  Retirer l'image du site
                </Button>
              </>
            )}

            <p role="status" className="adm-meta flex min-w-0 items-center gap-1.5">
              {isDirty &&
                (saved
                  ? "Pas encore enregistrée : le site montre toujours l'image précédente."
                  : 'Pas encore enregistrée : le site ne la montre pas.')}
              {isReplacing && "L'image actuelle est toujours sur le site."}
              {!isDirty && !isReplacing && justSaved && (
                <>
                  <Check className="size-3.5 shrink-0 text-foreground" aria-hidden="true" />
                  Enregistrée : le site montre cette image.
                </>
              )}
            </p>
          </div>
        )}
      </form>

      <DeleteDialog
        open={confirmRemove}
        onOpenChange={(open) => !open && !isRemoving && setConfirmRemove(false)}
        onConfirm={handleRemove}
        isLoading={isRemoving}
        title="Retirer cette image du site ?"
        description={`${fallback} L'image sera définitivement supprimée.`}
        confirmLabel="Retirer l'image"
      />
    </FormSection>
  )
}
