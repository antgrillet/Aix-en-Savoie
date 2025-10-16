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
    <div className="relative h-[300px] md:h-[450px] w-full overflow-hidden rounded-lg mb-12">
      <Image
        src={image}
        alt={title}
        fill
        priority
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
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
  )
}
