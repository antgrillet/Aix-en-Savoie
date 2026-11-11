import { ListSkeleton, PageHeaderSkeleton, SkeletonLine } from '@/components/admin/Skeleton'

export default function ResultatsLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <div aria-hidden="true" className="space-y-4 pt-2">
        <SkeletonLine className="w-64 max-w-[70vw]" />
        <SkeletonLine className="w-44" />
      </div>
      <ListSkeleton rows={8} className="mt-8" />
    </div>
  )
}
