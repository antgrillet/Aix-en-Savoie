export function calculateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, '')
  const words = text.trim().split(/\s+/).length
  const wordsPerMinute = 200
  const minutes = Math.ceil(words / wordsPerMinute)
  return minutes
}
