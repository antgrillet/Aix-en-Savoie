import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Calendrier',
  description: 'Calendrier interne des matchs à domicile.',
  path: '/calendrier',
  noindex: true,
  nofollow: true,
})

export default function CalendrierLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
