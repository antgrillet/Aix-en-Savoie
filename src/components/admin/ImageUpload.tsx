'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { CircleAlert, Loader2, Trash2, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/admin/Button'
import { Contour } from '@/components/admin/Contour'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
  disabled?: boolean
  folder?: string
  className?: string
  /** Transmis par `Field` : relie le libellé, l'aide et l'erreur à la zone de dépôt */
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  'aria-required'?: boolean
  /** Texte alternatif de l'aperçu */
  previewAlt?: string
}

/**
 * Envoi d'une image. Zone vide : contour en pointillé (rien n'est encore
 * choisi). Image en place : contour plein.
 */
export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
  folder = 'uploads',
  className,
  id,
  'aria-describedby': describedBy,
  previewAlt = "Aperçu de l'image choisie",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Ce fichier n'est pas une image. Choisissez un fichier PNG, JPG ou WebP.")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("L'image dépasse 10 Mo. Réduisez-la, puis réessayez.")
      return
    }

    setError('')
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const { url } = await response.json()
      onChange(url)
    } catch (uploadError) {
      console.error('Upload error:', uploadError)
      setError("L'envoi de l'image a échoué. Vérifiez votre connexion, puis réessayez.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled || isUploading) return

    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    e.target.value = ''
  }

  const errorId = id ? `${id}-envoi-erreur` : undefined

  return (
    <div className={cn('space-y-2', className)}>
      {value ? (
        <div className="space-y-2">
          <div className="relative h-56 w-full overflow-hidden rounded-[3px] text-foreground sm:h-64">
            <Image src={value} alt={previewAlt} fill sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" />
            <Contour />
          </div>
          <Button
            id={id}
            type="button"
            variant="outline"
            size="sm"
            onClick={onRemove}
            disabled={disabled}
            aria-describedby={describedBy}
          >
            <Trash2 aria-hidden="true" />
            Retirer l'image
          </Button>
        </div>
      ) : (
        <button
          id={id}
          type="button"
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            if (!disabled) setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading}
          aria-busy={isUploading || undefined}
          aria-describedby={[describedBy, error ? errorId : undefined].filter(Boolean).join(' ') || undefined}
          className={cn(
            'group relative grid min-h-40 w-full place-content-center justify-items-center gap-1.5 rounded-[3px] px-6 py-8 text-center transition-colors duration-150 ease-out disabled:cursor-not-allowed',
            isDragging ? 'text-primary' : 'text-foreground',
            disabled && 'opacity-50'
          )}
        >
          <Contour dashed={!isDragging} />
          {isUploading ? (
            <>
              <Loader2 className="size-6 animate-spin" aria-hidden="true" />
              <span className="text-[0.9375rem] font-semibold text-foreground">Envoi de l'image…</span>
            </>
          ) : (
            <>
              <Upload className="size-6" aria-hidden="true" />
              <span className="text-[0.9375rem] font-semibold text-foreground underline decoration-transparent underline-offset-4 transition-colors duration-150 group-hover:decoration-current">
                Choisir une image ou la déposer ici
              </span>
              <span className="adm-meta">PNG, JPG ou WebP, 10 Mo au plus</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="hidden"
        tabIndex={-1}
      />

      {error && (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-[0.8125rem] font-medium text-destructive">
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
