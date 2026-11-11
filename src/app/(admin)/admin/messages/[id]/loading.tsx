import { PageHeaderSkeleton, SkeletonLine } from '@/components/admin/Skeleton'

const LINE_WIDTHS = ['w-full', 'w-11/12', 'w-full', 'w-4/5', 'w-full', 'w-2/3']

export default function MessageLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <div role="status" className="max-w-[58ch] space-y-5 pt-2">
        <span className="sr-only">Chargement du message…</span>
        {LINE_WIDTHS.map((width, index) => (
          <SkeletonLine key={index} className={width} />
        ))}
      </div>
    </div>
  )
}
