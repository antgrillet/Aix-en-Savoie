import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getPageBackgroundImage } from '@/lib/settings'
import {
  ExternalLink, Globe, Mail, Phone, Calendar,
  ArrowLeft, ArrowRight,
  Target, Users, Trophy, Zap, Shield, Star, Quote,
  Handshake, Lightbulb, CheckCircle
} from 'lucide-react'
import { Icon } from '@iconify/react/offline'
import facebookIcon from '@iconify-icons/simple-icons/facebook'
import instagramIcon from '@iconify-icons/simple-icons/instagram'
import linkedinIcon from '@iconify-icons/simple-icons/linkedin'
import twitterIcon from '@iconify-icons/simple-icons/twitter'
import youtubeIcon from '@iconify-icons/simple-icons/youtube'
import { cn, normalizeImagePath } from '@/lib/utils'
import { PartnerCard } from '@/components/partners/PartnerCard'
import { PromoCard } from '@/components/partners/PromoCard'
import { JoinClubCTA } from '@/components/home/JoinClubCTA'
import { Eyebrow } from '@/components/site/Eyebrow'
import { SectionHeader } from '@/components/site/SectionHeader'
import { container, siteButton, siteCard } from '@/components/site/styles'
import { BreadcrumbSchema } from '@/components/seo/StructuredData'
import { buildMetadata } from '@/lib/seo'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const partenaire = await prisma.partenaire.findUnique({
    where: { slug, published: true },
  })

  if (!partenaire) {
    return buildMetadata({
      title: 'Partenaire introuvable',
      description: 'Ce partenaire est introuvable ou non publié.',
      path: `/partenaires/${slug}`,
      noindex: true,
    })
  }

  const image = normalizeImagePath(
    partenaire.photoCouverture || partenaire.logo || undefined,
    '/img/partenaires/default.png'
  )

  return {
    ...buildMetadata({
      title: `${partenaire.nom} - Partenaire HBC Aix-en-Savoie`,
      description: partenaire.description.substring(0, 160),
      path: `/partenaires/${slug}`,
      image,
    }),
  }
}

/** Titre de bloc : petit libellé orange + titre condensé */
function BlockTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mb-6">
      <Eyebrow className="mb-3">{eyebrow}</Eyebrow>
      <h2 className="font-headline text-3xl text-white sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 max-w-2xl text-neutral-400">{description}</p>}
    </div>
  )
}

const socialLinkClass =
  'flex size-11 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-neutral-300 transition-colors hover:border-primary-500/60 hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'

const contactLinkClass =
  '-mx-2 flex min-h-11 items-center gap-3 rounded-md px-2 text-neutral-300 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'

export default async function PartenaireDetailPage({ params }: PageProps) {
  const { slug } = await params

  const partenaire = await prisma.partenaire.findUnique({
    where: { slug, published: true },
  })

  if (!partenaire) {
    notFound()
  }

  // Récupérer les réseaux sociaux depuis le JSON
  const reseaux = partenaire.reseauxSociaux as {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
    youtube?: string
  } | null

  // Récupérer le témoignage depuis le JSON
  const temoignage = partenaire.temoignage as {
    citation: string
    auteur: string
    role: string
    photo?: string
  } | null

  // Récupérer d'autres partenaires similaires (même catégorie)
  const autresPartenaires = await prisma.partenaire.findMany({
    where: {
      published: true,
      id: { not: partenaire.id },
      categorie: partenaire.categorie,
    },
    take: 3,
    orderBy: [
      { partenaire_majeur: 'desc' },
      { ordre: 'asc' },
    ],
  })

  const backgroundImage = await getPageBackgroundImage('partenaires')

  // Couleur de marque : simple accent discret (liseré du logo), la page reste aux couleurs du club
  const brandColor =
    partenaire.couleurPrincipale && /^#[0-9a-f]{3,8}$/i.test(partenaire.couleurPrincipale)
      ? partenaire.couleurPrincipale
      : null

  // Icônes pour les apports (rotation pour varier)
  const apportIcons = [Target, Users, Trophy, Zap, Shield, Star, Handshake, Lightbulb]

  const socials = [
    { name: 'Facebook', href: reseaux?.facebook, icon: facebookIcon },
    { name: 'Instagram', href: reseaux?.instagram, icon: instagramIcon },
    { name: 'Twitter', href: reseaux?.twitter, icon: twitterIcon },
    { name: 'LinkedIn', href: reseaux?.linkedin, icon: linkedinIcon },
    { name: 'YouTube', href: reseaux?.youtube, icon: youtubeIcon },
  ].filter((social) => social.href)

  const hasContact = Boolean(partenaire.site || partenaire.email || partenaire.telephone)
  const hasValeurs = partenaire.valeurs && partenaire.valeurs.length > 0
  const hasAside = hasContact || socials.length > 0 || hasValeurs

  const typeLabel =
    !partenaire.typePartenariat || partenaire.typePartenariat === 'Partenaire'
      ? 'Partenaire'
      : `Partenaire ${partenaire.typePartenariat.toLowerCase()}`

  // Même règle d'expiration que PromoCard, pour ne pas laisser de bloc vide
  const showPromo = Boolean(
    partenaire.promoActive &&
      partenaire.promoTitre &&
      (!partenaire.promoExpiration || partenaire.promoExpiration >= new Date())
  )

  // Photo de couverture du partenaire, sinon l'image de fond de la page Partenaires
  const heroImage = partenaire.photoCouverture
    ? normalizeImagePath(partenaire.photoCouverture, backgroundImage || undefined)
    : backgroundImage

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: '/' },
          { name: 'Partenaires', url: '/partenaires' },
          { name: partenaire.nom, url: `/partenaires/${partenaire.slug}` },
        ]}
      />

      {/* En-tête : photo de couverture du partenaire si présente */}
      <section className="relative isolate overflow-hidden border-b border-white/10 bg-neutral-950">
        <div aria-hidden className="absolute inset-0 -z-10">
          {heroImage ? (
            <>
              <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-neutral-950/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/60" />
            </>
          ) : (
            <div className="absolute inset-0 bg-stripes" />
          )}
        </div>

        <div className={cn(container, 'pb-12 pt-28 md:pb-16 md:pt-36')}>
          <Link
            href="/partenaires"
            className="inline-flex w-fit items-center gap-2 rounded-sm text-sm font-medium text-neutral-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Tous les partenaires
          </Link>

          <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-center md:gap-12">
            {/* Logo sur tuile blanche, liseré à la couleur du partenaire */}
            <div className="relative flex h-36 w-full max-w-xs shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-7 md:h-44 md:w-80 md:max-w-none">
              <span
                aria-hidden
                className={cn('absolute inset-x-0 top-0 h-1.5', !brandColor && 'bg-primary-500')}
                style={brandColor ? { backgroundColor: brandColor } : undefined}
              />
              <div className="relative size-full">
                <Image
                  src={normalizeImagePath(partenaire.logo, '/img/partenaires/default.png')}
                  alt={partenaire.nom}
                  fill
                  priority
                  sizes="320px"
                  className="object-contain"
                />
              </div>
            </div>

            <div className="min-w-0">
              <Eyebrow className="mb-4">{typeLabel}</Eyebrow>
              <h1 className="font-headline text-5xl text-white sm:text-6xl lg:text-7xl">{partenaire.nom}</h1>
              {partenaire.accroche && (
                <p className="mt-4 max-w-2xl text-lg text-neutral-200 md:text-xl">{partenaire.accroche}</p>
              )}

              <ul className="mt-5 flex flex-wrap gap-2 text-sm">
                <li className="rounded-md border border-white/10 bg-neutral-950/60 px-3 py-1.5 font-medium text-neutral-200">
                  {partenaire.categorie}
                </li>
                {partenaire.anneeDemarrage && (
                  <li className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-neutral-950/60 px-3 py-1.5 font-medium text-neutral-200">
                    <Calendar className="size-3.5 text-primary-400" aria-hidden />
                    Partenaire depuis {partenaire.anneeDemarrage}
                  </li>
                )}
                {partenaire.partenaire_majeur && (
                  <li className="inline-flex items-center gap-1.5 rounded-md border border-primary-500/40 bg-primary-500/10 px-3 py-1.5 font-semibold text-primary-300">
                    <Star className="size-3.5 fill-current" aria-hidden />
                    Partenaire majeur
                  </li>
                )}
              </ul>

              {(partenaire.site || partenaire.email) && (
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  {partenaire.site && (
                    <a
                      href={partenaire.site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={siteButton()}
                    >
                      <Globe />
                      Visiter le site
                      <ExternalLink />
                    </a>
                  )}
                  {partenaire.email && (
                    <a href={`mailto:${partenaire.email}`} className={siteButton({ variant: 'outline' })}>
                      <Mail />
                      Les contacter
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className={container}>
          {/* Offre réservée aux licenciés */}
          {showPromo && partenaire.promoTitre && (
            <div className="mb-16 md:mb-20">
              <PromoCard
                titre={partenaire.promoTitre}
                description={partenaire.promoDescription}
                code={partenaire.promoCode}
                expiration={partenaire.promoExpiration}
                conditions={partenaire.promoConditions}
                brandColor={brandColor ?? undefined}
              />
            </div>
          )}

          <div className={cn('grid gap-14', hasAside && 'lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_24rem]')}>
            <div className="min-w-0 space-y-16">
              {/* À propos */}
              <section>
                <BlockTitle eyebrow="Le partenaire" title={`À propos de ${partenaire.nom}`} />
                <p className="max-w-3xl whitespace-pre-line text-base leading-relaxed text-neutral-300 md:text-lg">
                  {partenaire.description}
                </p>
              </section>

              {/* Ce qu'ils apportent au club */}
              {partenaire.apports && partenaire.apports.length > 0 && (
                <section>
                  <BlockTitle eyebrow="Engagement" title="Ce qu'ils apportent au club" />
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {partenaire.apports.map((apport, index) => {
                      const ApportIcon = apportIcons[index % apportIcons.length]
                      return (
                        <li key={index} className={cn(siteCard, 'flex items-start gap-4 p-5')}>
                          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary-500/25 bg-primary-500/10 text-primary-400">
                            <ApportIcon className="size-5" aria-hidden />
                          </span>
                          <p className="self-center font-medium leading-relaxed text-white">{apport}</p>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              )}

              {/* Nos projets communs */}
              {partenaire.projetsCommuns && partenaire.projetsCommuns.length > 0 && (
                <section>
                  <BlockTitle
                    eyebrow="Ensemble"
                    title="Nos projets communs"
                    description="Ensemble, nous construisons l'avenir du handball à Aix-en-Savoie."
                  />
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {partenaire.projetsCommuns.map((projet, index) => (
                      <li key={index} className={cn(siteCard, 'flex items-start gap-3 p-5')}>
                        <CheckCircle className="mt-0.5 size-5 shrink-0 text-primary-500" aria-hidden />
                        <p className="font-medium leading-relaxed text-white">{projet}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {hasAside && (
              <aside className="min-w-0 space-y-6 lg:sticky lg:top-28 lg:self-start">
                {hasContact && (
                  <div className={cn(siteCard, 'p-5 sm:p-6')}>
                    <h2 className="mb-3 font-eyebrow text-xs text-neutral-500">Coordonnées</h2>
                    <ul className="space-y-1">
                      {partenaire.site && (
                        <li>
                          <a href={partenaire.site} target="_blank" rel="noopener noreferrer" className={contactLinkClass}>
                            <Globe className="size-4 shrink-0 text-primary-500" aria-hidden />
                            <span className="truncate">Site web</span>
                            <ExternalLink className="ml-auto size-4 shrink-0 text-neutral-500" aria-hidden />
                          </a>
                        </li>
                      )}
                      {partenaire.email && (
                        <li>
                          <a href={`mailto:${partenaire.email}`} className={contactLinkClass}>
                            <Mail className="size-4 shrink-0 text-primary-500" aria-hidden />
                            <span className="truncate">{partenaire.email}</span>
                          </a>
                        </li>
                      )}
                      {partenaire.telephone && (
                        <li>
                          <a href={`tel:${partenaire.telephone}`} className={contactLinkClass}>
                            <Phone className="size-4 shrink-0 text-primary-500" aria-hidden />
                            <span>{partenaire.telephone}</span>
                          </a>
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {socials.length > 0 && (
                  <div className={cn(siteCard, 'p-5 sm:p-6')}>
                    <h2 className="mb-4 font-eyebrow text-xs text-neutral-500">Réseaux sociaux</h2>
                    <div className="flex flex-wrap gap-2">
                      {socials.map((social) => (
                        <a
                          key={social.name}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.name}
                          className={socialLinkClass}
                        >
                          <Icon icon={social.icon} className="size-5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {hasValeurs && (
                  <div className={cn(siteCard, 'p-5 sm:p-6')}>
                    <h2 className="mb-4 font-eyebrow text-xs text-neutral-500">Valeurs partagées</h2>
                    <ul className="flex flex-wrap gap-2">
                      {partenaire.valeurs.map((valeur, index) => (
                        <li
                          key={index}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-sm font-semibold text-neutral-200"
                        >
                          {valeur}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </aside>
            )}
          </div>
        </div>
      </section>

      {/* Témoignage */}
      {temoignage && temoignage.citation && (
        <section className="border-y border-white/10 bg-neutral-900 py-16 md:py-24">
          <figure className={cn(container, 'max-w-4xl')}>
            <Quote className="size-10 text-primary-500" aria-hidden />
            <blockquote className="mt-6 font-display text-2xl font-semibold leading-snug text-white md:text-3xl">
              «&nbsp;{temoignage.citation}&nbsp;»
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-4">
              {temoignage.photo && (
                <div className="relative size-14 shrink-0 overflow-hidden rounded-full border border-white/10">
                  <Image
                    src={normalizeImagePath(temoignage.photo, '/img/default-avatar.png')}
                    alt={temoignage.auteur}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <p className="font-display text-lg font-bold text-white">{temoignage.auteur}</p>
                {temoignage.role && <p className="text-sm text-neutral-400">{temoignage.role}</p>}
              </div>
            </figcaption>
          </figure>
        </section>
      )}

      {/* Galerie */}
      {partenaire.galerie && partenaire.galerie.length > 0 && (
        <section className="py-16 md:py-24">
          <div className={container}>
            <BlockTitle eyebrow="Galerie" title="En images" />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {partenaire.galerie.map((image, index) => (
                <li
                  key={index}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-neutral-900"
                >
                  <Image
                    src={normalizeImagePath(image, '/img/partenaires/default.png')}
                    alt={`${partenaire.nom} - Image ${index + 1}`}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Autres partenaires */}
      {autresPartenaires.length > 0 && (
        <section className="border-t border-white/10 py-16 md:py-24">
          <div className={container}>
            <SectionHeader
              eyebrow={partenaire.categorie}
              title="Autres partenaires"
              action={
                <Link href="/partenaires" className={cn(siteButton({ variant: 'outline' }), 'group')}>
                  Tous nos partenaires
                  <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>
              }
            />
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {autresPartenaires.map((p) => (
                <li key={p.id}>
                  <PartnerCard partenaire={p} featured={p.partenaire_majeur} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <JoinClubCTA
        title="Vous aussi, soutenez le club"
        description={`Comme ${partenaire.nom}, associez votre entreprise au HBC Aix-en-Savoie et contribuez au développement du handball local.`}
        primary={{ href: '/contact?sujet=partenariat', label: 'Contactez-nous' }}
        secondary={{ href: '/equipes', label: 'Découvrir nos équipes' }}
      />
    </>
  )
}
