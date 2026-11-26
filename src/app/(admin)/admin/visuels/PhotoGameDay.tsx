'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/admin/Button'

// Une photo de téléphone dépasse souvent la limite de corps des fonctions Vercel (4,5 Mo) :
// on la réduit dans le navigateur avant l'envoi. 2160 px de haut suffisent pour une affiche 1080 × 1350.
const COTE_MAX = 2160

async function reduire(fichier: File): Promise<Blob> {
  const image = await createImageBitmap(fichier, { imageOrientation: 'from-image' })
  const echelle = Math.min(1, COTE_MAX / Math.max(image.width, image.height))
  const toile = document.createElement('canvas')
  toile.width = Math.round(image.width * echelle)
  toile.height = Math.round(image.height * echelle)
  toile.getContext('2d')?.drawImage(image, 0, 0, toile.width, toile.height)
  image.close()
  return new Promise((resolve, reject) =>
    toile.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Image illisible'))), 'image/jpeg', 0.88)
  )
}

/**
 * Dépose la photo de l'affiche sur le stockage du site, puis renvoie le formulaire
 * de la carte avec son adresse : l'aperçu se régénère avec la nouvelle photo.
 */
export function PhotoGameDay({ nom, valeur }: { nom: string; valeur: string }) {
  const champ = useRef<HTMLInputElement>(null)
  const fichier = useRef<HTMLInputElement>(null)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')

  async function deposer(choisi: File) {
    setEnvoi(true)
    setErreur('')
    try {
      const donnees = new FormData()
      donnees.append('file', new File([await reduire(choisi)], 'gameday.jpg', { type: 'image/jpeg' }))
      donnees.append('folder', 'gameday')
      const reponse = await fetch('/api/upload', { method: 'POST', body: donnees })
      const resultat = (await reponse.json().catch(() => ({}))) as { url?: string; error?: string }
      if (!reponse.ok || !resultat.url) throw new Error(resultat.error || 'Envoi impossible')
      if (champ.current) {
        champ.current.value = resultat.url
        champ.current.form?.requestSubmit()
      }
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Envoi impossible')
      setEnvoi(false)
    }
  }

  return (
    <div className="col-span-2 flex flex-col gap-1">
      <input ref={champ} type="hidden" name={nom} defaultValue={valeur} />
      <input
        ref={fichier}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(evenement) => {
          const choisi = evenement.target.files?.[0]
          if (choisi) void deposer(choisi)
        }}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={envoi} onClick={() => fichier.current?.click()}>
          {envoi ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ImagePlus aria-hidden="true" />}
          {envoi ? 'Envoi de la photo…' : valeur ? 'Changer la photo' : 'Mettre la photo'}
        </Button>
        {valeur && !envoi ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (champ.current) {
                champ.current.value = ''
                champ.current.form?.requestSubmit()
              }
            }}
          >
            Remettre la photo d’équipe
          </Button>
        ) : null}
      </div>
      {erreur ? (
        <p role="alert" className="text-[0.8125rem] text-destructive">
          {erreur}
        </p>
      ) : null}
    </div>
  )
}
