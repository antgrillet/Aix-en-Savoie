import { PageHeader } from '@/components/admin/PageHeader'
import { HeroBackgroundForm } from './HeroBackgroundForm'
import { PageBackgroundForm } from './PageBackgroundForm'
import { CalendrierPasswordForm } from './CalendrierPasswordForm'
import { getHeroBackground, getPageBackground, getCalendrierPassword } from './actions'

export const metadata = {
  title: 'Paramètres - Admin',
  description: 'Gérer les paramètres du site',
}

// Espaces insécables : dans la colonne des titres, la coupure tombe avant le nom de la page
const FOND_DE_LA_PAGE = 'Fond\u00a0de\u00a0la\u00a0page'

export default async function ParametresPage() {
  const [
    heroBackgroundSetting,
    partnersBackground,
    newsBackground,
    teamsBackground,
    contactBackground,
    calendrierPassword,
  ] = await Promise.all([
    getHeroBackground(),
    getPageBackground('partenaires'),
    getPageBackground('actus'),
    getPageBackground('equipes'),
    getPageBackground('contact'),
    getCalendrierPassword(),
  ])

  return (
    <div>
      <PageHeader
        title="Paramètres"
        description="L'accès au calendrier des bénévoles et les images de fond du site. Chaque réglage s'enregistre séparément."
      />

      {/* Une section par réglage : le trait de l'en-tête tient lieu de premier filet */}
      <div>
        {/* Le mot de passe reste sur le serveur : la page ne reçoit que son existence */}
        <CalendrierPasswordForm isDefined={calendrierPassword !== ''} />

        <HeroBackgroundForm initialImage={heroBackgroundSetting?.value || ''} />

        <PageBackgroundForm
          page="partenaires"
          title={`${FOND_DE_LA_PAGE} Partenaires`}
          description="L'image derrière la page Partenaires et la page de chaque partenaire. Sans image, le fond reste sombre."
          initialImage={partnersBackground || ''}
        />

        <PageBackgroundForm
          page="actus"
          title={`${FOND_DE_LA_PAGE} Actualités`}
          description="L'image derrière la liste des actualités. Sans image, le fond reste sombre."
          initialImage={newsBackground || ''}
        />

        <PageBackgroundForm
          page="equipes"
          title={`${FOND_DE_LA_PAGE} Équipes`}
          description="L'image derrière la liste des équipes. Sans image, le fond reste sombre."
          initialImage={teamsBackground || ''}
        />

        <PageBackgroundForm
          page="contact"
          title={`${FOND_DE_LA_PAGE} Contact`}
          description="L'image derrière le formulaire de contact. Sans image, le fond reste sombre."
          initialImage={contactBackground || ''}
        />
      </div>
    </div>
  )
}
