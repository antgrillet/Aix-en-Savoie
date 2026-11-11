import { ListSkeleton, PageHeaderSkeleton } from '@/components/admin/Skeleton'

export default function MatchsLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <ListSkeleton rows={8} />
    </div>
  )
}
