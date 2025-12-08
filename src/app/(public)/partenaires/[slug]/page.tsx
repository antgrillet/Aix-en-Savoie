import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { PageBackground } from '@/components/layout/PageBackground'
import { getPageBackgroundImage } from '@/lib/settings'
import {
  ExternalLink, Globe, Mail, Phone, Calendar, Heart,
  ArrowLeft, Facebook, Instagram, Twitter, Linkedin, Youtube,
  Target, Users, Trophy, Zap, Shield, Star, Quote,
  Handshake, Lightbulb, CheckCircle
} from 'lucide-react'
import { normalizeImagePath } from '@/lib/utils'
import { PartnerCard } from '@/components/partners/PartnerCard'
import { PromoCard } from '@/components/partners/PromoCard'

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
    return {
      title: 'Partenaire introuvable',
    }
  }

  return {
    title: `${partenaire.nom} - Partenaire HBC Aix-en-Savoie`,
    description: partenaire.description.substring(0, 160),
    alternates: {
      canonical: `/partenaires/${slug}`,
    },
  }
}

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
  const brandColor = partenaire.couleurPrincipale || '#FF6B35'

  // Icônes pour les apports (rotation pour varier)
  const apportIcons = [Target, Users, Trophy, Zap, Shield, Star, Handshake, Lightbulb]

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <PageBackground imageUrl={backgroundImage} />

      {/* Gradient overlay pour ajouter de la couleur */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-30"
        style={{
          background: `radial-gradient(circle at 20% 20%, ${brandColor}15 0%, transparent 50%), radial-gradient(circle at 80% 80%, #FF6B3515 0%, transparent 50%)`
        }}
      />

      <div className="relative z-10">
        {/* Bouton retour */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <Link
            href="/partenaires"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux partenaires
          </Link>
        </div>

        {/* 🏁 HERO SECTION DÉDIÉE */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl">
              {/* Background avec image ou dégradé */}
              {partenaire.photoCouverture ? (
                <div className="absolute inset-0 z-0">
                  <Image
                    src={normalizeImagePath(partenaire.photoCouverture || undefined, backgroundImage || undefined)}
                    alt={`Couverture ${partenaire.nom}`}
                    fill
                    className="object-cover opacity-30"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/70 via-zinc-800/60 to-zinc-900/70" />
                </div>
              ) : (
                <div
                  className="absolute inset-0 z-0"
                  style={{
                    background: `linear-gradient(135deg, ${brandColor}15 0%, transparent 50%, ${brandColor}10 100%)`
                  }}
                />
              )}

              {/* Contenu Hero */}
              <div className="relative z-10 px-6 md:px-12 py-10 md:py-14">
                <div className="max-w-4xl mx-auto text-center space-y-5">
                  {/* Logo */}
                  <div className="flex justify-center">
                    <div className="relative w-48 h-24 md:w-64 md:h-32 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <Image
                        src={normalizeImagePath(partenaire.logo, '/img/partenaires/default.png')}
                        alt={partenaire.nom}
                        fill
                        className="object-contain p-4"
                        priority
                      />
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap justify-center gap-3">
                    <span
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold border-2"
                      style={{
                        backgroundColor: `${brandColor}20`,
                        borderColor: `${brandColor}50`,
                        color: brandColor
                      }}
                    >
                      <Heart className="w-4 h-4" />
                      {partenaire.typePartenariat}
                    </span>
                    {partenaire.partenaire_majeur && (
                      <span className="inline-flex items-center gap-1 px-4 py-2 bg-secondary-500/20 border-2 border-secondary-500/50 rounded-full text-secondary-400 text-sm font-semibold">
                        <Star className="w-4 h-4 fill-current" />
                        Partenaire Majeur
                      </span>
                    )}
                  </div>

                  {/* Titre */}
                  <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                    {partenaire.nom}
                  </h1>

                  {/* Accroche personnalisée */}
                  {partenaire.accroche && (
                    <p
                      className="text-lg md:text-xl font-semibold"
                      style={{ color: brandColor }}
                    >
                      {partenaire.accroche}
                    </p>
                  )}

                  {/* Catégorie */}
                  <p className="text-base text-neutral-300">{partenaire.categorie}</p>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap justify-center gap-3 pt-3">
                    {partenaire.site && (
                      <a
                        href={partenaire.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
                        style={{
                          backgroundColor: brandColor,
                          boxShadow: `0 10px 40px ${brandColor}40`
                        }}
                      >
                        <Globe className="w-5 h-5" />
                        Visiter le site
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {partenaire.email && (
                      <a
                        href={`mailto:${partenaire.email}`}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-bold transition-all shadow-lg hover:shadow-xl"
                      >
                        <Mail className="w-4 h-4" />
                        Nous contacter
                      </a>
                    )}
                  </div>

                  {/* Année de partenariat */}
                  {partenaire.anneeDemarrage && (
                    <div className="flex items-center justify-center gap-2 text-neutral-400 pt-2 text-sm">
                      <Calendar className="w-4 h-4" style={{ color: brandColor }} />
                      <span>Partenaire depuis {partenaire.anneeDemarrage}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 📖 SECTION "À PROPOS DU PARTENAIRE" */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Description principale */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-zinc-800/40 backdrop-blur-md border border-zinc-700/50 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <div
                      className="w-1 h-8 rounded-full"
                      style={{ backgroundColor: brandColor }}
                    />
                    À propos de {partenaire.nom}
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-neutral-300 leading-relaxed whitespace-pre-line text-base">
                      {partenaire.description}
                    </p>
                  </div>
                </div>

                {/* Valeurs partagées */}
                {partenaire.valeurs && partenaire.valeurs.length > 0 && (
                  <div className="bg-zinc-800/40 backdrop-blur-md border border-zinc-700/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                      <Heart className="w-5 h-5" style={{ color: brandColor }} />
                      Valeurs partagées
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {partenaire.valeurs.map((valeur, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 rounded-lg font-semibold text-white text-sm border-2 transition-all hover:scale-105"
                          style={{
                            backgroundColor: `${brandColor}15`,
                            borderColor: `${brandColor}40`
                          }}
                        >
                          {valeur}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Contact */}
              <div className="space-y-4">
                <div className="bg-zinc-800/40 backdrop-blur-md border border-zinc-700/50 rounded-xl p-5 space-y-3">
                  <h3 className="text-lg font-bold text-white mb-3">Contact</h3>

                  {partenaire.site && (
                    <a
                      href={partenaire.site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-neutral-300 hover:text-white transition-colors group"
                    >
                      <Globe className="w-5 h-5 flex-shrink-0" style={{ color: brandColor }} />
                      <span className="truncate group-hover:underline">Site web</span>
                      <ExternalLink className="w-4 h-4 ml-auto flex-shrink-0" />
                    </a>
                  )}

                  {partenaire.email && (
                    <a
                      href={`mailto:${partenaire.email}`}
                      className="flex items-center gap-3 text-neutral-300 hover:text-white transition-colors"
                    >
                      <Mail className="w-5 h-5 flex-shrink-0" style={{ color: brandColor }} />
                      <span className="truncate">{partenaire.email}</span>
                    </a>
                  )}

                  {partenaire.telephone && (
                    <a
                      href={`tel:${partenaire.telephone}`}
                      className="flex items-center gap-3 text-neutral-300 hover:text-white transition-colors"
                    >
                      <Phone className="w-5 h-5 flex-shrink-0" style={{ color: brandColor }} />
                      <span>{partenaire.telephone}</span>
                    </a>
                  )}
                </div>

                {/* Réseaux sociaux */}
                {reseaux && Object.values(reseaux).some(v => v) && (
                  <div className="bg-zinc-800/40 backdrop-blur-md border border-zinc-700/50 rounded-xl p-5">
                    <h3 className="text-lg font-bold text-white mb-3">Réseaux sociaux</h3>
                    <div className="flex flex-wrap gap-3">
                      {reseaux.facebook && (
                        <a
                          href={reseaux.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all hover:scale-110"
                          aria-label="Facebook"
                        >
                          <Facebook className="w-5 h-5 text-white" />
                        </a>
                      )}
                      {reseaux.instagram && (
                        <a
                          href={reseaux.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all hover:scale-110"
                          aria-label="Instagram"
                        >
                          <Instagram className="w-5 h-5 text-white" />
                        </a>
                      )}
                      {reseaux.twitter && (
                        <a
                          href={reseaux.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-12 h-12 bg-sky-500 hover:bg-sky-600 rounded-lg transition-all hover:scale-110"
                          aria-label="Twitter"
                        >
                          <Twitter className="w-5 h-5 text-white" />
                        </a>
                      )}
                      {reseaux.linkedin && (
                        <a
                          href={reseaux.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-12 h-12 bg-blue-700 hover:bg-blue-800 rounded-lg transition-all hover:scale-110"
                          aria-label="LinkedIn"
                        >
                          <Linkedin className="w-5 h-5 text-white" />
                        </a>
                      )}
                      {reseaux.youtube && (
                        <a
                          href={reseaux.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-12 h-12 bg-red-600 hover:bg-red-700 rounded-lg transition-all hover:scale-110"
                          aria-label="YouTube"
                        >
                          <Youtube className="w-5 h-5 text-white" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 🎯 SECTION "CE QU'ILS APPORTENT AU CLUB" */}
        {partenaire.apports && partenaire.apports.length > 0 && (
          <section className="py-8 bg-gradient-to-br from-zinc-800/30 to-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Ce qu'ils apportent au club
                </h2>
                <div
                  className="w-20 h-1 rounded-full mx-auto"
                  style={{ backgroundColor: brandColor }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partenaire.apports.map((apport, index) => {
                  const Icon = apportIcons[index % apportIcons.length]
                  return (
                    <div
                      key={index}
                      className="group bg-zinc-800/40 backdrop-blur-md border border-zinc-700/50 rounded-xl p-5 hover:border-opacity-100 transition-all hover:scale-105"
                      style={{
                        borderColor: `${brandColor}40`,
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: `${brandColor}20`,
                          }}
                        >
                          <Icon className="w-5 h-5" style={{ color: brandColor }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium text-base leading-relaxed">
                            {apport}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* 📸 SECTION "EN IMAGES" / GALERIE */}
        {partenaire.galerie && partenaire.galerie.length > 0 && (
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  En images
                </h2>
                <div
                  className="w-20 h-1 rounded-full mx-auto"
                  style={{ backgroundColor: brandColor }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partenaire.galerie.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-video rounded-xl overflow-hidden group border-2 border-transparent hover:border-opacity-100 transition-all"
                    style={{
                      borderColor: `${brandColor}60`
                    }}
                  >
                    <Image
                      src={normalizeImagePath(image, '/img/partenaires/default.png')}
                      alt={`${partenaire.nom} - Image ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 💬 SECTION TÉMOIGNAGE */}
        {temoignage && temoignage.citation && (
          <section className="py-8 bg-gradient-to-br from-zinc-800/30 to-transparent">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div
                className="relative bg-zinc-800/60 backdrop-blur-sm border-2 rounded-2xl p-8 md:p-10"
                style={{
                  borderColor: `${brandColor}40`
                }}
              >
                {/* Quote icon */}
                <Quote
                  className="absolute top-6 left-6 w-12 h-12 opacity-20"
                  style={{ color: brandColor }}
                />

                <div className="relative z-10 space-y-6">
                  {/* Citation */}
                  <blockquote className="text-lg md:text-xl font-semibold text-white leading-relaxed text-center">
                    "{temoignage.citation}"
                  </blockquote>

                  {/* Auteur */}
                  <div className="flex items-center justify-center gap-4 pt-4">
                    {temoignage.photo && (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2" style={{ borderColor: brandColor }}>
                        <Image
                          src={normalizeImagePath(temoignage.photo, '/img/default-avatar.png')}
                          alt={temoignage.auteur}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="text-left">
                      <p className="text-lg font-bold text-white">{temoignage.auteur}</p>
                      <p className="text-neutral-400">{temoignage.role}</p>
                    </div>
                  </div>
                </div>

                {/* Decoration */}
                <div
                  className="absolute bottom-8 right-8 w-32 h-32 rounded-full blur-3xl opacity-20"
                  style={{ backgroundColor: brandColor }}
                />
              </div>
            </div>
          </section>
        )}

        {/* 🤝 SECTION "NOS PROJETS COMMUNS" */}
        {partenaire.projetsCommuns && partenaire.projetsCommuns.length > 0 && (
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Nos projets communs
                </h2>
                <div
                  className="w-20 h-1 rounded-full mx-auto mb-3"
                  style={{ backgroundColor: brandColor }}
                />
                <p className="text-neutral-400 text-base max-w-2xl mx-auto">
                  Ensemble, nous construisons l'avenir du handball à Aix-en-Savoie
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partenaire.projetsCommuns.map((projet, index) => (
                  <div
                    key={index}
                    className="bg-zinc-800/40 backdrop-blur-md border border-zinc-700/50 rounded-xl p-6 hover:border-opacity-100 transition-all group"
                    style={{
                      borderColor: `${brandColor}30`,
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: `${brandColor}20`,
                        }}
                      >
                        <CheckCircle className="w-6 h-6" style={{ color: brandColor }} />
                      </div>
                      <p className="text-white text-base font-medium leading-relaxed flex-1">
                        {projet}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 🎯 SECTION CTA FINALE */}
        <section className="py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="relative overflow-hidden rounded-2xl p-8 md:p-10 text-center"
              style={{
                background: `linear-gradient(135deg, ${brandColor}20 0%, ${brandColor}05 100%)`
              }}
            >
              {/* Background decoration */}
              <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20"
                style={{ backgroundColor: brandColor }}
              />
              <div
                className="absolute bottom-0 left-0 w-36 h-36 rounded-full blur-3xl opacity-20"
                style={{ backgroundColor: brandColor }}
              />

              <div className="relative z-10 space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Intéressé par {partenaire.nom} ?
                </h2>
                <p className="text-base md:text-lg text-neutral-300 max-w-2xl mx-auto">
                  Découvrez comment ce partenaire contribue au développement du handball
                </p>

                <div className="flex flex-wrap justify-center gap-3 pt-3">
                  {partenaire.site && (
                    <a
                      href={partenaire.site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
                      style={{
                        backgroundColor: brandColor,
                        boxShadow: `0 10px 40px ${brandColor}40`
                      }}
                    >
                      <Globe className="w-5 h-5" />
                      Visiter leur site web
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {partenaire.email && (
                    <a
                      href={`mailto:${partenaire.email}`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-bold transition-all shadow-lg hover:shadow-xl"
                    >
                      <Mail className="w-4 h-4" />
                      Les contacter
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 🎁 SECTION OFFRE PROMOTIONNELLE */}
        {partenaire.promoActive && partenaire.promoTitre && (
          <section className="py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Offre Exclusive
                </h2>
                <div
                  className="w-20 h-1 rounded-full mx-auto"
                  style={{ backgroundColor: brandColor }}
                />
              </div>

              <PromoCard
                titre={partenaire.promoTitre}
                description={partenaire.promoDescription}
                code={partenaire.promoCode}
                expiration={partenaire.promoExpiration}
                conditions={partenaire.promoConditions}
                brandColor={brandColor}
              />
            </div>
          </section>
        )}

        {/* Autres partenaires */}
        {autresPartenaires.length > 0 && (
          <section className="py-10 border-t border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-white mb-6">Autres partenaires</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {autresPartenaires.map((p) => (
                  <PartnerCard key={p.id} partenaire={p} featured={p.partenaire_majeur} />
                ))}
              </div>
              <div className="text-center mt-8">
                <Link
                  href="/partenaires"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg font-semibold transition-all"
                >
                  Voir tous les partenaires
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
