'use client'

import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { Button } from '@/components/admin/Button'
import { dialogSurfaceClasses, overlayClasses } from '@/components/admin/Dialog'

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  /** Nommer ce qui est supprimé : « Supprimer cet article ? » */
  title?: string
  /** Dire ce qui disparaît avec, et que c'est définitif */
  description?: string
  isLoading?: boolean
  /** Libellé du bouton de confirmation, « Supprimer » par défaut */
  confirmLabel?: string
}

/** Confirmation d'une suppression : le seul endroit où le rouge est un fond. */
export function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Êtes-vous sûr ?',
  description = 'Cette action est irréversible. Les données seront définitivement supprimées.',
  isLoading,
  confirmLabel = 'Supprimer',
}: DeleteDialogProps) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className={overlayClasses} />
        <AlertDialogPrimitive.Content className={dialogSurfaceClasses}>
          <div className="space-y-1.5">
            <AlertDialogPrimitive.Title className="adm-h2">{title}</AlertDialogPrimitive.Title>
            <AlertDialogPrimitive.Description className="adm-meta">
              {description}
            </AlertDialogPrimitive.Description>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialogPrimitive.Cancel asChild>
              <Button type="button" variant="outline" disabled={isLoading}>
                Annuler
              </Button>
            </AlertDialogPrimitive.Cancel>
            <Button
              type="button"
              variant="destructive"
              isLoading={isLoading}
              onClick={(event) => {
                event.preventDefault()
                onConfirm()
              }}
            >
              {isLoading ? 'Suppression…' : confirmLabel}
            </Button>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}
