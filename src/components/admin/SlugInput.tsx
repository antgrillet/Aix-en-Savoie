'use client'

import { useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SlugInputProps {
  value: string
  onChange: (value: string) => void
  sourceValue?: string
  label?: string
  disabled?: boolean
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function SlugInput({
  value,
  onChange,
  sourceValue,
  label = 'Slug (URL)',
  disabled,
}: SlugInputProps) {
  useEffect(() => {
    if (sourceValue && !value) {
      onChange(generateSlug(sourceValue))
    }
  }, [sourceValue, value, onChange])

  return (
    <div className="space-y-2">
      <Label htmlFor="slug">{label}</Label>
      <Input
        id="slug"
        value={value}
        onChange={(e) => onChange(generateSlug(e.target.value))}
        disabled={disabled}
        placeholder="mon-super-article"
      />
      <p className="text-xs text-muted-foreground">
        Le slug est généré automatiquement à partir du titre
      </p>
    </div>
  )
}
