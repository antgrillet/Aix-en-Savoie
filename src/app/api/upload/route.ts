import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-utils'

const MAX_FILE_SIZE = 10 * 1024 * 1024

// Le SVG est exclu : il peut embarquer du script et le stockage est public.
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
]

const ALLOWED_FOLDERS = [
  'uploads',
  'articles',
  'equipes',
  'partenaires',
  'partenaires/temoignages',
  'partenaires/galerie',
  'settings',
]

function nomSur(nom: string): string {
  const propre = nom
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^[-.]+/, '')
    .slice(-80)
  return propre || 'image'
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (session?.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const folderValue = formData.get('folder')
    const folder = typeof folderValue === 'string' && folderValue ? folderValue : 'uploads'

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    if (!ALLOWED_FOLDERS.includes(folder)) {
      return NextResponse.json({ error: 'Dossier non autorisé' }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format non pris en charge. Utilisez JPEG, PNG, WebP, AVIF ou GIF.' },
        { status: 415 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Image trop lourde (10 Mo maximum).' },
        { status: 413 }
      )
    }

    const pathname = `${folder}/${Date.now()}-${nomSur(file.name)}`

    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: true,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
