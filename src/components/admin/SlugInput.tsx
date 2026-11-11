'use client'

import { useEffect } from 'react'
import { Field, Input } from '@/components/admin/Field'

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
    <Field
      id="slug"
      label={label}
      hint="Rempli automatiquement à partir du titre. Lettres minuscules, chiffres et tirets."
    >
      <Input
        value={value}
        onChange={(e) => onChange(generateSlug(e.target.value))}
        disabled={disabled}
        placeholder="mon-super-article"
      />
    </Field>
  )
}
