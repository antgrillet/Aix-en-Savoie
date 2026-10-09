'use client'

import { Trash2 } from 'lucide-react'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { LoadingButton } from '@/components/admin/LoadingButton'
import { DeleteDialog } from '@/components/admin/DeleteDialog'
import { Button } from '@/components/ui/button'

interface BackgroundTileProps {
  title: string
  description: string
  image: string
  /** Image actuellement enregistrée (pour signaler une modification en attente) */
  savedImage: string
  onImageChange: (url: string) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isSubmitting: boolean
  isRemoving: boolean
  confirmOpen: boolean
  onConfirmOpenChange: (open: boolean) => void
  onConfirmRemove: () => void
}

/** Vignette d'image de fond : aperçu, envoi et suppression */
export function BackgroundTile({
  title,
  description,
  image,
  savedImage,
  onImageChange,
  onSubmit,
  isSubmitting,
  isRemoving,
  confirmOpen,
  onConfirmOpenChange,
  onConfirmRemove,
}: BackgroundTileProps) {
  const isDirty = image !== savedImage

  return (
    <form onSubmit={onSubmit} className="flex flex-col rounded-lg border bg-card p-3">
      <ImageUpload
        value={image}
        onChange={onImageChange}
        onRemove={() => onImageChange('')}
        disabled={isSubmitting || isRemoving}
        folder="settings"
        className="[&>div]:aspect-video [&>div]:py-4 [&_img]:object-cover"
      />

      <div className="mt-3 flex flex-1 items-start justify-between gap-2 px-1">
        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {isDirty ? (
          <span className="shrink-0 rounded-full bg-primary-50 px-2 py-0.5 text-[0.7rem] font-medium text-primary-800 ring-1 ring-inset ring-primary-600/25">
            Non enregistré
          </span>
        ) : (
          !image && (
            <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[0.7rem] font-medium text-neutral-600 ring-1 ring-inset ring-neutral-500/20">
              Aucune image
            </span>
          )
        )}
      </div>

      {/* Actions disponibles dès qu'une image est choisie */}
      {image && (
        <div className="mt-3 flex items-center gap-2 px-1 pb-1">
          <LoadingButton
            type="submit"
            size="sm"
            variant={isDirty ? 'default' : 'outline'}
            isLoading={isSubmitting}
            disabled={!image || isRemoving}
          >
            Enregistrer
          </LoadingButton>

          {/* Suppression de l'image enregistrée sur le site */}
          {savedImage && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onConfirmOpenChange(true)}
              disabled={isSubmitting || isRemoving}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 />
              Supprimer
            </Button>
          )}
        </div>
      )}

      <DeleteDialog
        open={confirmOpen}
        onOpenChange={onConfirmOpenChange}
        onConfirm={onConfirmRemove}
        isLoading={isRemoving}
        title="Supprimer l'image de fond ?"
        description={`L'image de fond « ${title} » sera supprimée du site.`}
      />
    </form>
  )
}
