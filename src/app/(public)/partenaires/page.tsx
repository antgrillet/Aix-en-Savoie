import { prisma } from '@/lib/prisma'
import { PartnerCard } from '@/components/partners/PartnerCard'

export const revalidate = 1800

export default async function PartenairesPage() {
  const partenaires = await prisma.partenaire.findMany({
    orderBy: { nom: 'asc' },
  })

  // Grouper par catégorie
  const categories = ['Platine', 'Or', 'Argent', 'Bronze']
  const groupedPartenaires = categories.map((cat) => ({
    categorie: cat,
    partenaires: partenaires.filter((p) => p.categorie === cat),
  }))

  return (
    <div className="pt-24 min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="section-spacing bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <div className="container-padding text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
            Nos Partenaires
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Merci à tous nos partenaires pour leur soutien
          </p>
        </div>
      </section>

      {/* Partners by Category */}
      <div className="container-padding py-16">
        {groupedPartenaires.map((group) => (
          group.partenaires.length > 0 && (
            <div key={group.categorie} className="mb-16">
              <h2 className="text-3xl font-display font-bold mb-8 text-center">
                Partenaires {group.categorie}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {group.partenaires.map((partenaire) => (
                  <PartnerCard key={partenaire.id} partenaire={partenaire} />
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      {/* CTA */}
      <section className="container-padding pb-20">
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-display font-bold mb-4">
            Devenez partenaire
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Rejoignez nos partenaires et soutenez le handball local
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-lg font-bold hover:bg-neutral-100 transition-colors"
          >
            Contactez-nous
          </a>
        </div>
      </section>
    </div>
  )
}
