import { put, del, list } from '@vercel/blob'

export async function uploadImage(file: File, folder: string = 'uploads') {
  const pathname = `${folder}/${Date.now()}-${file.name}`

  const blob = await put(pathname, file, {
    access: 'public',
    addRandomSuffix: true,
  })

  return blob.url
}

export async function deleteImage(url: string) {
  try {
    await del(url)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete image:', error)
    return { success: false, error }
  }
}

export async function listImages(prefix?: string) {
  try {
    const { blobs } = await list({
      prefix: prefix || '',
      limit: 1000,
    })
    return blobs
  } catch (error) {
    console.error('Failed to list images:', error)
    return []
  }
}
