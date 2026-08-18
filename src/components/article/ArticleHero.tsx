import Image from 'next/image'
import { Calendar, Clock, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ArticleHeroProps {
  title: string
  categorie: string
  date: Date
  image: string
  views: number
  readingTime: number
}

export function ArticleHero({
  title,
  categorie,
  date,
  image,
  views,
  readingTime,
}: ArticleHeroProps) {
  return (
    <div className="relative w-full h-[340px] md:h-[520px] overflow-hidden mb-12">
      <Image
        src={image}
        alt={title}
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-black/60 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-end">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-12">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-500 rounded-full text-sm font-semibold text-white mb-4">
              {categorie}
            </div>

            <h1 className="font-display font-bold text-3xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm md:text-base text-neutral-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-500" />
                <time dateTime={date.toISOString()}>
                  {format(date, 'dd MMMM yyyy', { locale: fr })}
                </time>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-500" />
                <span>{readingTime} min de lecture</span>
              </div>

              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary-500" />
                <span>{views} vues</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
