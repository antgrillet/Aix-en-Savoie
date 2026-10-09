import Image from 'next/image'

// Rendue hors du layout public : on pose nous-mêmes le thème sombre du site
export default function Loading() {
  return (
    <div
      role="status"
      className="theme-site dark relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden bg-neutral-950 px-4 text-neutral-100"
    >
      <div aria-hidden className="absolute inset-0 -z-10 bg-stripes" />

      <div className="relative flex size-28 items-center justify-center">
        <span aria-hidden className="absolute inset-0 animate-spin rounded-full border-2 border-white/10 border-t-primary-500" />
        <Image src="/img/home/logo.png" alt="" width={80} height={80} priority className="size-18 object-contain" />
      </div>
      <p className="mt-6 font-eyebrow text-xs text-neutral-400">Chargement…</p>
    </div>
  )
}
