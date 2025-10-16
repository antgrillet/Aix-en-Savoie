import { list, del } from '@vercel/blob'

async function cleanBlob() {
  console.log('🧹 Listing all blobs...\n')

  try {
    const { blobs } = await list()

    console.log(`Found ${blobs.length} blobs\n`)

    if (blobs.length === 0) {
      console.log('✅ No blobs to delete')
      return
    }

    console.log('Blobs to delete:')
    blobs.forEach((blob, index) => {
      console.log(`  ${index + 1}. ${blob.pathname} (${blob.url})`)
    })

    console.log('\n🗑️  Deleting all blobs...\n')

    for (const blob of blobs) {
      await del(blob.url)
      console.log(`✅ Deleted: ${blob.pathname}`)
    }

    console.log(`\n🎉 Successfully deleted ${blobs.length} blobs`)
  } catch (error) {
    console.error('❌ Error cleaning blob storage:', error)
    process.exit(1)
  }
}

cleanBlob()
