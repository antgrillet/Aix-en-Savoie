import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Squelette clair affiché dans le contenu de l'admin (le menu latéral reste en place)
export default function AdminLoading() {
  return (
    <div role="status" aria-label="Chargement">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Card className="divide-y overflow-hidden">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="size-10 shrink-0 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
