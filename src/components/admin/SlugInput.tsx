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
    .replace(/[̀-ͯ]/g, '')
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
      <div className="flex h-10 items-center overflow-hidden rounded-md border border-input bg-transparent shadow-sm focus-within:ring-1 focus-within:ring-ring">
        <span aria-hidden className="flex h-full shrink-0 items-center border-r bg-muted/50 px-3 text-sm text-muted-foreground">
          /
        </span>
        <Input
          id="slug"
          value={value}
          onChange={(e) => onChange(generateSlug(e.target.value))}
          disabled={disabled}
          placeholder="mon-super-article"
          aria-describedby="slug-aide"
          className="h-full rounded-none border-0 font-mono shadow-none focus-visible:ring-0"
        />
      </div>
      <p id="slug-aide" className="text-xs text-muted-foreground">
        Généré automatiquement à partir du titre : lettres minuscules, chiffres et tirets.
      </p>
    </div>
  )
}
