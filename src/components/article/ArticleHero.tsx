import Image from 'next/image'
import Link from 'next/link'
import { formatDateLongue } from '@/lib/dates'

interface ArticleHeroProps {
  title: string
  categorie: string
  date: Date
  image: string
  readingTime: number
}

/** En-tête de l'article : catégorie, titre, date, temps de lecture et photo. */
export function ArticleHero({ title, categorie, date, image, readingTime }: ArticleHeroProps) {
  return (
    <header>
      <Link
        href={`/actus?categorie=${encodeURIComponent(categorie)}`}
        className="inline-block rounded-full bg-primary-500 px-3.5 py-1 text-[13px] font-extrabold uppercase leading-normal tracking-wide text-zinc-950 transition-colors hover:bg-primary-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400"
      >
        {categorie}
      </Link>

      <h1 className="mt-3.5 mb-3 font-display text-3xl font-black leading-[1.08] tracking-tight text-white break-words sm:text-4xl lg:text-[44px]">
        {title}
      </h1>

      <p className="font-mono text-xs uppercase tracking-[0.1em] text-neutral-400">
        <time dateTime={date.toISOString()}>{formatDateLongue(date)}</time>
        <span aria-hidden="true"> · </span>
        {readingTime} min de lecture
      </p>

      <div className="relative mt-5 mb-7 aspect-[3/2] overflow-hidden rounded-[14px] bg-zinc-800 sm:aspect-[16/10]">
        <Image
          src={image}
          alt=""
          fill
          preload
          className="object-cover"
          sizes="(min-width: 1024px) 700px, 100vw"
        />
      </div>
    </header>
  )
}
