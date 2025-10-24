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
        <>
          {/* Animated Background Elements (fallback) */}
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary-500/10 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-secondary-500/10 rounded-full filter blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full filter blur-3xl" />
        </>
      )}
    </div>
  )
}
