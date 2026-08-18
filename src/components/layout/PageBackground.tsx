import Image from 'next/image'

interface PageBackgroundProps {
  imageUrl?: string | null
  className?: string
}

export function PageBackground({ imageUrl, className = '' }: PageBackgroundProps) {
  return (
    <div className={`fixed inset-0 z-0 ${className}`}>
      {imageUrl ? (
        <>
          {/* Image de fond */}
          <Image
            src={imageUrl}
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/80 via-zinc-900/60 to-zinc-900/80" />
        </>
      ) : (
        /* Fond statique de repli : dégradé sobre aux couleurs du club */
        <div className="absolute inset-0 bg-zinc-900 bg-[radial-gradient(circle_at_top_right,var(--color-primary-900)_0%,transparent_55%)]" />
      )}
    </div>
  )
}
