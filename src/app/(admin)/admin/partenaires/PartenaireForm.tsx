'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/admin/Button'
import { Field, Input, SwitchField, Textarea } from '@/components/admin/Field'
import { FormSection, SaveBar } from '@/components/admin/FormSection'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { SimpleSelect } from '@/components/admin/Select'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { StatusMark } from '@/components/admin/StatusMark'
import type { Partenaire } from '@/generated/prisma/client'
import { CouleurField } from './CouleurField'
import { GalerieField } from './GalerieField'
import { ListeDeTextes } from './ListeDeTextes'
import {
  ACCROCHE_MAX,
  CHAMPS_PROMO,
  NOM_MAX,
  PROMO_CODE_MAX,
  PROMO_CONDITIONS_MAX,
  PROMO_DESCRIPTION_MAX,
  PROMO_TITRE_MAX,
  RESEAUX,
  validerPartenaire,
  type ErreursPartenaire,
  type Reseau,
} from './validation'

// Catégories prédéfinies pour les partenaires
const PARTNER_CATEGORIES = [
  'Équipementier',
  'Institution',
  'Banque',
  'Assurance',
  'Commerce local',
  'Restauration',
  'Santé',
  'Médias',
  'Services',
  'Transport',
  'Industrie',
  'Autre',
]

const TYPE_PARTENARIAT = [
  'Partenaire',
  'Équipementier',
  'Principal',
  'Institutionnel',
  'Technique',
  'Média',
]

// Couleur d'accent de la page d'un partenaire tant qu'il n'a pas la sienne
const COULEUR_PAR_DEFAUT = '#FF6B35'

const formatModification = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** Liste d'options, avec la valeur enregistrée si elle n'en fait plus partie */
function optionsAvec(liste: string[], actuelle: string) {
  const valeurs = actuelle && !liste.includes(actuelle) ? [...liste, actuelle] : liste
  return valeurs.map((valeur) => ({ value: valeur, label: valeur }))
}

/** `redirect()` dans une Server Action rejette la promesse côté client : ce n'est pas un échec */
function estUneRedirection(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    typeof error.digest === 'string' &&
    error.digest.startsWith('NEXT_REDIRECT')
  )
}

/** « la citation », « la citation et le rôle », « la citation, l'auteur et le rôle » */
function enumerer(mots: string[]) {
  if (mots.length <= 1) return mots.join('')
  return `${mots.slice(0, -1).join(', ')} et ${mots[mots.length - 1]}`
}

interface PartenaireFormProps {
  action: (formData: FormData) => Promise<void>
  initialData?: Partenaire
}

export function PartenaireForm({ action, initialData }: PartenaireFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<ErreursPartenaire>({})

  // Identité
  const [nom, setNom] = useState(initialData?.nom || '')
  const [logo, setLogo] = useState(initialData?.logo || '')
  const [categorie, setCategorie] = useState(initialData?.categorie || '')
  const [typePartenariat, setTypePartenariat] = useState(initialData?.typePartenariat || 'Partenaire')

  // Page du partenaire
  const [accroche, setAccroche] = useState(initialData?.accroche || '')
  const [photoCouverture, setPhotoCouverture] = useState(initialData?.photoCouverture || '')

  // Réseaux sociaux
  const initialReseaux = (initialData?.reseauxSociaux ?? {}) as Partial<Record<Reseau, string>>
  const [reseaux, setReseaux] = useState<Record<Reseau, string>>({
    facebook: initialReseaux.facebook || '',
    instagram: initialReseaux.instagram || '',
    twitter: initialReseaux.twitter || '',
    linkedin: initialReseaux.linkedin || '',
    youtube: initialReseaux.youtube || '',
  })

  // Listes
  const [valeurs, setValeurs] = useState<string[]>(initialData?.valeurs || [])
  const [galerie, setGalerie] = useState<string[]>(initialData?.galerie || [])
  const [apports, setApports] = useState<string[]>(initialData?.apports || [])
  const [projetsCommuns, setProjetsCommuns] = useState<string[]>(initialData?.projetsCommuns || [])

  // Témoignage
  const initialTemoignage = (initialData?.temoignage ?? {}) as Partial<
    Record<'citation' | 'auteur' | 'role' | 'photo', string>
  >
  const [temoignageCitation, setTemoignageCitation] = useState(initialTemoignage.citation || '')
  const [temoignageAuteur, setTemoignageAuteur] = useState(initialTemoignage.auteur || '')
  const [temoignageRole, setTemoignageRole] = useState(initialTemoignage.role || '')
  const [temoignagePhoto, setTemoignagePhoto] = useState(initialTemoignage.photo || '')

  // Offre partenaire
  const [promoActive, setPromoActive] = useState(initialData?.promoActive || false)
  const [promoTitre, setPromoTitre] = useState(initialData?.promoTitre || '')
  const [promoDescription, setPromoDescription] = useState(initialData?.promoDescription || '')
  const [promoCode, setPromoCode] = useState(initialData?.promoCode || '')
  const [promoExpiration, setPromoExpiration] = useState(
    initialData?.promoExpiration ? new Date(initialData.promoExpiration).toISOString().split('T')[0] : ''
  )
  const [promoConditions, setPromoConditions] = useState(initialData?.promoConditions || '')

  // Publication
  const [published, setPublished] = useState(initialData?.published ?? true)
  const [majeur, setMajeur] = useState(initialData?.partenaire_majeur ?? false)

  const clearError = (champ: string) => {
    if (errors[champ]) {
      setErrors((current) => {
        const next = { ...current }
        delete next[champ]
        return next
      })
    }
  }

  // Le témoignage n'est envoyé que si ses trois textes sont remplis
  const temoignageManquants = [
    !temoignageCitation && 'la citation',
    !temoignageAuteur && "l'auteur",
    !temoignageRole && 'le rôle',
  ].filter((mot): mot is string => Boolean(mot))
  const temoignageCommence = Boolean(
    temoignageCitation || temoignageAuteur || temoignageRole || temoignagePhoto
  )
  const temoignageIncomplet = temoignageCommence && temoignageManquants.length > 0

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const lire = (name: string) => (formData.get(name) as string | null) ?? ''

    // Validation avec messages utilisateur
    const found = validerPartenaire({
      nom,
      categorie,
      logo,
      description: lire('description'),
      anneeDemarrage: lire('anneeDemarrage'),
      accroche,
      photoCouverture,
      site: lire('site'),
      email: lire('email'),
      reseaux,
      galerie,
      temoignage: {
        citation: temoignageCitation,
        auteur: temoignageAuteur,
        role: temoignageRole,
        photo: temoignagePhoto,
      },
      promoTitre,
      promoDescription,
      promoCode,
      promoConditions,
      ordre: lire('ordre'),
    })

    setErrors(found)

    // Les erreurs sont rangées dans l'ordre des champs : la première est celle du haut
    const premierChamp = Object.keys(found)[0]
    if (premierChamp) {
      const champMasque = !promoActive && CHAMPS_PROMO.includes(premierChamp)
      toast.error(
        found[premierChamp],
        champMasque
          ? { description: "Ce champ fait partie de l'offre partenaire : activez-la pour le corriger." }
          : undefined
      )
      document.getElementById(premierChamp)?.focus()
      return
    }

    setIsSubmitting(true)

    try {
      formData.set('nom', nom)
      formData.set('logo', logo)
      formData.set('categorie', categorie)
      formData.set('typePartenariat', typePartenariat)
      formData.set('accroche', accroche)

      // Photo de couverture
      if (photoCouverture) {
        formData.set('photoCouverture', photoCouverture)
      }

      // Réseaux sociaux (JSON)
      const reseauxSociaux = Object.fromEntries(
        RESEAUX.filter(({ cle }) => reseaux[cle]).map(({ cle }) => [cle, reseaux[cle]])
      )
      if (Object.keys(reseauxSociaux).length > 0) {
        formData.set('reseauxSociaux', JSON.stringify(reseauxSociaux))
      }

      // Listes
      formData.set('valeurs', JSON.stringify(valeurs))
      formData.set('galerie', JSON.stringify(galerie))
      formData.set('apports', JSON.stringify(apports))
      formData.set('projetsCommuns', JSON.stringify(projetsCommuns))

      // Témoignage (JSON)
      if (temoignageCitation && temoignageAuteur && temoignageRole) {
        const temoignage = {
          citation: temoignageCitation,
          auteur: temoignageAuteur,
          role: temoignageRole,
          ...(temoignagePhoto && { photo: temoignagePhoto }),
        }
        formData.set('temoignage', JSON.stringify(temoignage))
      }

      // Offre partenaire
      formData.set('promoActive', promoActive.toString())
      if (promoTitre) formData.set('promoTitre', promoTitre)
      if (promoDescription) formData.set('promoDescription', promoDescription)
      if (promoCode) formData.set('promoCode', promoCode)
      if (promoExpiration) formData.set('promoExpiration', promoExpiration)
      if (promoConditions) formData.set('promoConditions', promoConditions)

      // Publication : une bascule envoie « on », l'action attend « true »
      formData.set('published', published.toString())
      formData.set('partenaire_majeur', majeur.toString())

      await action(formData)
      toast.success(initialData ? 'Partenaire modifié' : 'Partenaire ajouté')
    } catch (error) {
      // L'action se termine par un retour à la liste : l'enregistrement a réussi
      if (estUneRedirection(error)) {
        toast.success(initialData ? 'Partenaire modifié' : 'Partenaire ajouté')
        return
      }
      console.error(error)
      toast.error("Le partenaire n'a pas pu être enregistré.", {
        description: 'Vérifiez votre connexion, puis réessayez.',
      })
      setIsSubmitting(false)
    }
  }

  const submitLabel = initialData
    ? 'Enregistrer'
    : published
      ? 'Publier le partenaire'
      : 'Enregistrer le brouillon'

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSection
        title="Identité"
        description="Le nom, le logo et la présentation du partenaire, tels que les visiteurs les voient."
      >
        <Field
          id="nom"
          label="Nom"
          required
          error={errors.nom}
          counter={{ value: nom.length, max: NOM_MAX }}
        >
          <Input
            name="nom"
            value={nom}
            onChange={(e) => {
              setNom(e.target.value)
              clearError('nom')
            }}
            placeholder="Boulangerie du Lac"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="categorie" label="Catégorie" required error={errors.categorie}>
            <SimpleSelect
              value={categorie}
              onValueChange={(value) => {
                setCategorie(value)
                clearError('categorie')
              }}
              options={optionsAvec(PARTNER_CATEGORIES, initialData?.categorie || '')}
              placeholder="Choisir une catégorie"
            />
          </Field>

          <Field id="typePartenariat" label="Type de partenariat">
            <SimpleSelect
              value={typePartenariat}
              onValueChange={setTypePartenariat}
              options={optionsAvec(TYPE_PARTENARIAT, initialData?.typePartenariat || '')}
            />
          </Field>
        </div>

        <Field
          id="logo"
          label="Logo"
          required
          error={errors.logo}
          hint="Affiché en entier sur la page Partenaires, et sur l'accueil pour un partenaire majeur."
        >
          <ImageUpload
            value={logo}
            onChange={(url) => {
              setLogo(url)
              clearError('logo')
            }}
            onRemove={() => setLogo('')}
            disabled={isSubmitting}
            folder="partenaires"
            previewAlt="Aperçu du logo"
            // Un logo se montre en entier : l'aperçu du kit recadre, on le corrige ici
            className="[&_img]:object-contain [&_img]:p-6"
          />
        </Field>

        <Field
          id="description"
          label="Description"
          required
          error={errors.description}
          hint="Qui est ce partenaire et ce qui le lie au club."
        >
          <Textarea
            name="description"
            defaultValue={initialData?.description}
            onChange={() => clearError('description')}
            rows={6}
          />
        </Field>

        <Field
          id="anneeDemarrage"
          label="Année de démarrage du partenariat"
          optional
          error={errors.anneeDemarrage}
          hint="Affichée sur sa page : « Partenaire depuis 2019 »."
        >
          <Input
            name="anneeDemarrage"
            type="number"
            inputMode="numeric"
            defaultValue={initialData?.anneeDemarrage || ''}
            onChange={() => clearError('anneeDemarrage')}
            placeholder="2024"
            className="sm:max-w-32"
          />
        </Field>
      </FormSection>

      <FormSection
        title="Page du partenaire"
        description="La phrase, la couleur et la photo du haut de sa page sur le site."
        optional
      >
        <Field
          id="accroche"
          label="Phrase d'accroche"
          error={errors.accroche}
          counter={{ value: accroche.length, max: ACCROCHE_MAX }}
          hint="Mise en avant en haut de sa page."
        >
          <Input
            name="accroche"
            value={accroche}
            onChange={(e) => {
              setAccroche(e.target.value)
              clearError('accroche')
            }}
            placeholder="L'innovation au service des coachs de handball"
          />
        </Field>

        <CouleurField initialValue={initialData?.couleurPrincipale || COULEUR_PAR_DEFAUT} />

        <Field
          id="photoCouverture"
          label="Photo de couverture"
          error={errors.photoCouverture}
          hint="Image de fond du haut de sa page."
        >
          <ImageUpload
            value={photoCouverture}
            onChange={(url) => {
              setPhotoCouverture(url)
              clearError('photoCouverture')
            }}
            onRemove={() => setPhotoCouverture('')}
            disabled={isSubmitting}
            folder="partenaires"
            previewAlt="Aperçu de la photo de couverture"
          />
        </Field>
      </FormSection>

      <FormSection
        title="Contact"
        description="Les moyens de joindre le partenaire, affichés sur sa page."
        optional
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="site" label="Site web" error={errors.site}>
            <Input
              name="site"
              type="url"
              inputMode="url"
              defaultValue={initialData?.site || ''}
              onChange={() => clearError('site')}
              placeholder="https://exemple.fr"
            />
          </Field>

          <Field id="email" label="E-mail" error={errors.email}>
            <Input
              name="email"
              type="email"
              defaultValue={initialData?.email || ''}
              onChange={() => clearError('email')}
              placeholder="contact@partenaire.fr"
            />
          </Field>
        </div>

        <Field id="telephone" label="Téléphone">
          <Input
            name="telephone"
            type="tel"
            defaultValue={initialData?.telephone || ''}
            placeholder="04 79 00 00 00"
            className="sm:max-w-56"
          />
        </Field>
      </FormSection>

      <FormSection
        title="Réseaux sociaux"
        description="L'adresse complète de chaque page, en commençant par https://."
        optional
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {RESEAUX.map(({ cle, label, placeholder }) => (
            <Field key={cle} id={cle} label={label} error={errors[cle]}>
              <Input
                type="url"
                inputMode="url"
                value={reseaux[cle]}
                onChange={(e) => {
                  setReseaux({ ...reseaux, [cle]: e.target.value })
                  clearError(cle)
                }}
                placeholder={placeholder}
              />
            </Field>
          ))}
        </div>
      </FormSection>

      <FormSection
        title="Valeurs partagées"
        description="Quelques mots qui rapprochent le partenaire et le club."
        optional
      >
        <ListeDeTextes
          id="valeur"
          label="Valeurs partagées"
          items={valeurs}
          onChange={setValeurs}
          itemLabel={(numero) => `Valeur ${numero}`}
          removeLabel={(numero) => `Retirer la valeur ${numero}`}
          addLabel="Ajouter une valeur"
          emptyText="Aucune valeur pour l'instant : Innovation, Local, Jeunesse…"
          placeholder="Jeunesse"
          disabled={isSubmitting}
        />
      </FormSection>

      <FormSection
        title="Galerie photos"
        description="Des photos du partenaire ou de ce qu'il fait avec le club."
        optional
      >
        <GalerieField
          images={galerie}
          onChange={setGalerie}
          errors={errors}
          onClearError={clearError}
          disabled={isSubmitting}
        />
      </FormSection>

      <FormSection
        title="Apports au club"
        description="Ce que le partenaire apporte au club, une ligne par apport."
        optional
      >
        <ListeDeTextes
          id="apport"
          label="Apports au club"
          items={apports}
          onChange={setApports}
          itemLabel={(numero) => `Apport ${numero}`}
          removeLabel={(numero) => `Retirer l'apport ${numero}`}
          addLabel="Ajouter un apport"
          emptyText="Aucun apport pour l'instant : équipement des joueurs, formation des entraîneurs…"
          placeholder="Équipement des joueurs"
          multiline
          disabled={isSubmitting}
        />
      </FormSection>

      <FormSection
        title="Témoignage"
        description="Une citation affichée sur sa page. Elle n'est enregistrée que si la citation, l'auteur et le rôle sont tous les trois remplis."
        optional
      >
        <Field id="temoignageCitation" label="Citation" error={errors.temoignageCitation}>
          <Textarea
            value={temoignageCitation}
            onChange={(e) => {
              setTemoignageCitation(e.target.value)
              clearError('temoignageCitation')
            }}
            placeholder="Ce partenaire nous accompagne depuis le début et…"
            rows={4}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="temoignageAuteur" label="Auteur">
            <Input
              value={temoignageAuteur}
              onChange={(e) => setTemoignageAuteur(e.target.value)}
              placeholder="Jean Dupont"
            />
          </Field>

          <Field id="temoignageRole" label="Rôle">
            <Input
              value={temoignageRole}
              onChange={(e) => setTemoignageRole(e.target.value)}
              placeholder="Président du club"
            />
          </Field>
        </div>

        <Field id="temoignagePhoto" label="Photo de l'auteur" optional error={errors.temoignagePhoto}>
          <ImageUpload
            value={temoignagePhoto}
            onChange={(url) => {
              setTemoignagePhoto(url)
              clearError('temoignagePhoto')
            }}
            onRemove={() => setTemoignagePhoto('')}
            disabled={isSubmitting}
            folder="partenaires/temoignages"
            previewAlt="Aperçu de la photo de l'auteur"
          />
        </Field>

        {temoignageIncomplet && (
          <p role="status" className="flex items-start gap-2.5">
            <StatusMark tone="action">À compléter</StatusMark>
            <span className="adm-meta pt-0.5">
              Il manque {enumerer(temoignageManquants)} : sans cela, le témoignage ne sera pas enregistré.
            </span>
          </p>
        )}
      </FormSection>

      <FormSection
        title="Projets communs"
        description="Ce que le club et le partenaire font ensemble, une ligne par projet."
        optional
      >
        <ListeDeTextes
          id="projet"
          label="Projets communs"
          items={projetsCommuns}
          onChange={setProjetsCommuns}
          itemLabel={(numero) => `Projet ${numero}`}
          removeLabel={(numero) => `Retirer le projet ${numero}`}
          addLabel="Ajouter un projet"
          emptyText="Aucun projet pour l'instant : formation des jeunes, tournoi annuel…"
          placeholder="Tournoi annuel"
          multiline
          disabled={isSubmitting}
        />
      </FormSection>

      <FormSection
        title="Offre partenaire"
        description="Une réduction ou un avantage réservé aux membres du club."
        optional
      >
        <div className="border-t border-border">
          <SwitchField
            id="promoActive"
            label="Offre active"
            description={
              promoActive
                ? "Affichée sur le site si elle a un titre et n'a pas expiré."
                : "Aucune offre n'est affichée sur le site."
            }
            checked={promoActive}
            onCheckedChange={setPromoActive}
            aside={
              <StatusMark tone={promoActive ? 'solid' : 'dashed'}>
                {promoActive ? 'Active' : 'Inactive'}
              </StatusMark>
            }
          />
        </div>

        {promoActive && (
          <>
            <Field
              id="promoTitre"
              label="Titre de l'offre"
              error={errors.promoTitre}
              counter={{ value: promoTitre.length, max: PROMO_TITRE_MAX }}
              hint="Sans titre, l'offre n'est pas affichée."
            >
              <Input
                value={promoTitre}
                onChange={(e) => {
                  setPromoTitre(e.target.value)
                  clearError('promoTitre')
                }}
                placeholder="-10 % sur votre première commande"
              />
            </Field>

            <Field
              id="promoDescription"
              label="Description"
              error={errors.promoDescription}
              counter={{ value: promoDescription.length, max: PROMO_DESCRIPTION_MAX }}
            >
              <Textarea
                value={promoDescription}
                onChange={(e) => {
                  setPromoDescription(e.target.value)
                  clearError('promoDescription')
                }}
                placeholder="Une réduction réservée aux membres du HBC Aix-en-Savoie…"
                rows={3}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="promoCode"
                label="Code promo"
                optional
                error={errors.promoCode}
                counter={{ value: promoCode.length, max: PROMO_CODE_MAX }}
                hint="Sans code, le membre cite le club en magasin."
              >
                <Input
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase())
                    clearError('promoCode')
                  }}
                  placeholder="HBCAIX10"
                  autoCapitalize="characters"
                  spellCheck={false}
                />
              </Field>

              <Field id="promoExpiration" label="Date d'expiration" optional>
                <Input
                  type="date"
                  value={promoExpiration}
                  onChange={(e) => setPromoExpiration(e.target.value)}
                />
              </Field>
            </div>

            <Field
              id="promoConditions"
              label="Conditions d'utilisation"
              error={errors.promoConditions}
              counter={{ value: promoConditions.length, max: PROMO_CONDITIONS_MAX }}
            >
              <Textarea
                value={promoConditions}
                onChange={(e) => {
                  setPromoConditions(e.target.value)
                  clearError('promoConditions')
                }}
                placeholder="Non cumulable avec d'autres offres. Valable en magasin uniquement."
                rows={2}
                className="min-h-0"
              />
            </Field>
          </>
        )}
      </FormSection>

      <FormSection title="Publication" description="Ce que le site montre de ce partenaire.">
        <Field
          id="ordre"
          label="Ordre d'affichage"
          error={errors.ordre}
          hint="Les plus petits nombres passent en premier. L'ordre se règle aussi dans la liste des partenaires, en déplaçant les lignes."
        >
          <Input
            name="ordre"
            type="number"
            inputMode="numeric"
            min="0"
            defaultValue={initialData?.ordre || 0}
            onChange={() => clearError('ordre')}
            className="sm:max-w-32"
          />
        </Field>

        <div className="border-t border-border">
          <SwitchField
            id="published"
            label="Publié"
            description={
              published
                ? "Visible sur le site dès l'enregistrement."
                : 'Gardé en brouillon : invisible sur le site.'
            }
            checked={published}
            onCheckedChange={setPublished}
            aside={<StatusBadge status={published ? 'published' : 'draft'} />}
          />
          <SwitchField
            id="partenaire_majeur"
            label="Partenaire majeur"
            description="Présenté en premier sur la page Partenaires et sur l'accueil du site."
            checked={majeur}
            onCheckedChange={setMajeur}
          />
        </div>
      </FormSection>

      <SaveBar
        status={
          initialData &&
          `Dernière modification le ${formatModification.format(new Date(initialData.updatedAt))}`
        }
      >
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </SaveBar>
    </form>
  )
}
