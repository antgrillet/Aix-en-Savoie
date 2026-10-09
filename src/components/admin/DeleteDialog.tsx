'use client'

import { Loader2, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
  isLoading?: boolean
}

export function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Êtes-vous sûr ?',
  description = 'Cette action est irréversible. Les données seront définitivement supprimées.',
  isLoading,
}: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md gap-6 bg-card sm:rounded-xl">
        <AlertDialogHeader className="items-center gap-1 space-y-0 sm:flex-row sm:items-start sm:gap-4">
          <span
            aria-hidden
            className="mb-3 flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 sm:mb-0"
          >
            <Trash2 className="size-5" />
          </span>
          <div className="space-y-1.5">
            <AlertDialogTitle className="font-display text-base font-semibold">{title}</AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">{description}</AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:space-x-0">
          <AlertDialogCancel disabled={isLoading} className="mt-0">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isLoading}
            className={cn(buttonVariants({ variant: 'destructive' }))}
          >
            {isLoading && <Loader2 className="animate-spin" />}
            {isLoading ? 'Suppression…' : 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
