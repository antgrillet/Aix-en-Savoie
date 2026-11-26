'use client'

import { useEffect, useRef, useState } from 'react'
import { Eraser, PenLine } from 'lucide-react'
import { Button } from '@/components/admin/Button'

/** Taille interne fixe : le dessin suit la largeur affichée sans jamais être effacé. */
const LARGEUR = 900
const HAUTEUR = 300

interface SignaturePadProps {
  id: string
  /** Nom écrit dans le cadre par le bouton « Signer avec mon nom » */
  nom: string
  onChange: (dataUrl: string | null) => void
  invalid?: boolean
  describedBy?: string
}

/**
 * Cadre de signature à la souris, au doigt ou au stylet. Pour qui ne peut pas
 * dessiner, « Signer avec mon nom » écrit le nom du validateur à la main.
 */
export function SignaturePad({ id, nom, onChange, invalid, describedBy }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dessin = useRef<{ actif: boolean; x: number; y: number }>({ actif: false, x: 0, y: 0 })
  const [vide, setVide] = useState(true)

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 4
    ctx.strokeStyle = '#1f1e1b'
  }, [])

  const position = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      y: ((e.clientY - rect.top) * canvas.height) / rect.height,
    }
  }

  const exporter = () => {
    const canvas = canvasRef.current
    if (canvas) onChange(canvas.toDataURL('image/png'))
  }

  const debut = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    const p = position(e)
    dessin.current = { actif: true, ...p }
    // Un simple appui laisse un point
    const ctx = e.currentTarget.getContext('2d')
    if (ctx) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2)
      ctx.fillStyle = '#1f1e1b'
      ctx.fill()
    }
    setVide(false)
  }

  const trace = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dessin.current.actif) return
    e.preventDefault()
    const ctx = e.currentTarget.getContext('2d')
    if (!ctx) return
    const p = position(e)
    ctx.beginPath()
    ctx.moveTo(dessin.current.x, dessin.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    dessin.current = { actif: true, ...p }
  }

  const fin = () => {
    if (!dessin.current.actif) return
    dessin.current.actif = false
    exporter()
  }

  const effacer = () => {
    const canvas = canvasRef.current
    canvas?.getContext('2d')?.clearRect(0, 0, LARGEUR, HAUTEUR)
    setVide(true)
    onChange(null)
  }

  const signerAvecNom = () => {
    const ctx = canvasRef.current?.getContext('2d')
    const texte = nom.trim()
    if (!ctx || !texte) return
    ctx.clearRect(0, 0, LARGEUR, HAUTEUR)
    let taille = 110
    ctx.font = `italic ${taille}px "Brush Script MT", "Segoe Script", "Snell Roundhand", cursive`
    while (taille > 40 && ctx.measureText(texte).width > LARGEUR - 80) {
      taille -= 6
      ctx.font = `italic ${taille}px "Brush Script MT", "Segoe Script", "Snell Roundhand", cursive`
    }
    ctx.fillStyle = '#1f1e1b'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(texte, LARGEUR / 2, HAUTEUR / 2)
    setVide(false)
    exporter()
  }

  return (
    <div>
      <div
        className="relative overflow-hidden rounded-lg border bg-background"
        style={{ borderColor: invalid ? 'var(--adm-bad)' : undefined }}
      >
        <canvas
          ref={canvasRef}
          id={id}
          width={LARGEUR}
          height={HAUTEUR}
          role="img"
          aria-label={vide ? 'Cadre de signature, vide' : 'Cadre de signature, signé'}
          aria-describedby={describedBy}
          className="block aspect-[3/1] w-full cursor-crosshair touch-none"
          onPointerDown={debut}
          onPointerMove={trace}
          onPointerUp={fin}
          onPointerCancel={fin}
          onLostPointerCapture={fin}
        />
        {vide && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-muted-foreground">
            Signez ici, à la souris ou au doigt
          </span>
        )}
        <span className="pointer-events-none absolute inset-x-6 bottom-[22%] border-b border-border" aria-hidden="true" />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={effacer} disabled={vide}>
          <Eraser aria-hidden="true" />
          Effacer
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={signerAvecNom} disabled={!nom.trim()}>
          <PenLine aria-hidden="true" />
          Signer avec mon nom
        </Button>
      </div>
    </div>
  )
}
