'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
  disabled?: boolean
  folder?: string
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
  folder = 'uploads',
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 10MB')
      return
    }

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
    } catch (error) {
      console.error('Upload error:', error)
      alert('Erreur lors de l\'upload de l\'image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  const isBlocked = disabled || isUploading

  return (
    <div className={cn('space-y-4', className)}>
      {value ? (
        // Aperçu : l'image entière est visible (logos compris) sur fond neutre
        <div className="relative aspect-video max-h-80 w-full overflow-hidden rounded-lg border bg-neutral-100">
          <Image
            src={value}
            alt="Aperçu de l'image"
            fill
            sizes="(min-width: 1024px) 640px, 100vw"
            className="object-contain"
          />
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            title="Retirer l'image"
            className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-md bg-white/95 text-neutral-700 shadow-sm ring-1 ring-black/10 transition-colors hover:bg-white hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            <X className="size-4" />
            <span className="sr-only">Retirer l&apos;image</span>
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={isBlocked ? -1 : 0}
          aria-disabled={isBlocked || undefined}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              inputRef.current?.click()
            }
          }}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-10 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-input bg-muted/40 hover:border-primary-500/60 hover:bg-primary-50/50',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <span
            aria-hidden
            className="flex size-10 items-center justify-center rounded-full bg-card text-primary-700 shadow-xs ring-1 ring-border"
          >
            {isUploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
          </span>
          {isUploading ? (
            <p className="text-sm font-medium text-muted-foreground">Envoi de l&apos;image…</p>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Cliquez pour choisir</span> ou glissez-déposez une image
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG ou WebP, 10 Mo maximum</p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="hidden"
          />
        </div>
      )}
    </div>
  )
}
