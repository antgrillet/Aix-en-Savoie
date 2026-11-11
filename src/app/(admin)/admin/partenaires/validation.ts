import { partenaireSchema } from '@/lib/validations/partenaire'

/**
 * Contrôles du formulaire partenaire avant l'envoi. Ils reprennent les bornes
 * de `partenaireSchema` sans en ajouter : une valeur refusée ici le serait
 * aussi par le serveur, mais l'erreur est dite sous le champ.
 */

// Mêmes bornes que `partenaireSchema`
export const NOM_MAX = 100
export const DESCRIPTION_MIN = 10
export const ANNEE_MIN = 1900
export const ANNEE_MAX = new Date().getFullYear() + 1
export const ACCROCHE_MAX = 200
export const CITATION_MIN = 10
export const PROMO_TITRE_MAX = 100
export const PROMO_DESCRIPTION_MAX = 500
export const PROMO_CODE_MAX = 50
export const PROMO_CONDITIONS_MAX = 300

export const RESEAUX = [
  { cle: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/…' },
  { cle: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/…' },
  { cle: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/…' },
  { cle: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/…' },
  { cle: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/…' },
] as const

export type Reseau = (typeof RESEAUX)[number]['cle']

/** Champs de l'offre : masqués tant qu'elle n'est pas active */
export const CHAMPS_PROMO = ['promoTitre', 'promoDescription', 'promoCode', 'promoConditions']

export interface ValeursPartenaire {
  nom: string
  categorie: string
  logo: string
  description: string
  anneeDemarrage: string
  accroche: string
  photoCouverture: string
  site: string
  email: string
  reseaux: Record<Reseau, string>
  galerie: string[]
  temoignage: { citation: string; auteur: string; role: string; photo: string }
  promoTitre: string
  promoDescription: string
  promoCode: string
  promoConditions: string
  ordre: string
}

/** Erreurs par identifiant de champ, dans l'ordre d'affichage du formulaire */
export type ErreursPartenaire = Record<string, string>

// Le schéma lui-même juge les adresses : même verdict qu'à l'enregistrement.
// Une valeur vide est jugée à part, champ par champ.
const estUneAdresseWeb = (valeur: string) =>
  valeur !== '' && partenaireSchema.shape.site.safeParse(valeur).success
const estUnEmail = (valeur: string) => valeur !== '' && partenaireSchema.shape.email.safeParse(valeur).success

const ADRESSE_WEB_INVALIDE =
  "Cette adresse n'est pas reconnue : écrivez-la en entier, par exemple https://exemple.fr."

// Une image envoyée depuis ce formulaire a toujours une adresse complète ; une
// image plus ancienne peut ne pas en avoir, et le serveur la refuse.
const IMAGE_A_RENVOYER = "L'adresse de cette image n'est plus acceptée : retirez-la, puis envoyez-la à nouveau."

export function validerPartenaire(valeurs: ValeursPartenaire): ErreursPartenaire {
  const erreurs: ErreursPartenaire = {}

  // Identité
  if (!valeurs.nom.trim()) {
    erreurs.nom = 'Donnez le nom du partenaire.'
  } else if (valeurs.nom.length > NOM_MAX) {
    erreurs.nom = `Le nom dépasse ${NOM_MAX} caractères : raccourcissez-le.`
  }
  if (!valeurs.categorie) {
    erreurs.categorie = 'Choisissez une catégorie.'
  }
  if (!valeurs.logo) {
    erreurs.logo = 'Ajoutez le logo du partenaire.'
  } else if (!estUneAdresseWeb(valeurs.logo)) {
    erreurs.logo = IMAGE_A_RENVOYER
  }
  if (!valeurs.description.trim()) {
    erreurs.description = 'Présentez le partenaire en quelques lignes.'
  } else if (valeurs.description.length < DESCRIPTION_MIN) {
    erreurs.description = `La description est trop courte : ${DESCRIPTION_MIN} caractères au moins.`
  }
  if (valeurs.anneeDemarrage) {
    const annee = parseInt(valeurs.anneeDemarrage)
    if (Number.isNaN(annee) || annee < ANNEE_MIN || annee > ANNEE_MAX) {
      erreurs.anneeDemarrage = `Indiquez une année entre ${ANNEE_MIN} et ${ANNEE_MAX}.`
    }
  }

  // Page du partenaire
  if (valeurs.accroche.length > ACCROCHE_MAX) {
    erreurs.accroche = `La phrase d'accroche dépasse ${ACCROCHE_MAX} caractères : raccourcissez-la.`
  }
  if (valeurs.photoCouverture && !estUneAdresseWeb(valeurs.photoCouverture)) {
    erreurs.photoCouverture = IMAGE_A_RENVOYER
  }

  // Contact
  if (valeurs.site && !estUneAdresseWeb(valeurs.site)) {
    erreurs.site = ADRESSE_WEB_INVALIDE
  }
  if (valeurs.email && !estUnEmail(valeurs.email)) {
    erreurs.email = "Cette adresse e-mail n'est pas reconnue : vérifiez-la, par exemple contact@partenaire.fr."
  }

  // Réseaux sociaux
  for (const { cle } of RESEAUX) {
    if (valeurs.reseaux[cle] && !estUneAdresseWeb(valeurs.reseaux[cle])) {
      erreurs[cle] = ADRESSE_WEB_INVALIDE
    }
  }

  // Galerie : un emplacement ajouté doit recevoir sa photo
  valeurs.galerie.forEach((image, index) => {
    if (!image) {
      erreurs[`galerie-${index}`] = 'Choisissez une photo, ou retirez cet emplacement.'
    } else if (!estUneAdresseWeb(image)) {
      erreurs[`galerie-${index}`] = IMAGE_A_RENVOYER
    }
  })

  // Témoignage : il n'est envoyé que si ses trois textes sont remplis
  const { citation, auteur, role, photo } = valeurs.temoignage
  if (citation && auteur && role) {
    if (citation.length < CITATION_MIN) {
      erreurs.temoignageCitation = `La citation est trop courte : ${CITATION_MIN} caractères au moins.`
    }
    if (photo && !estUneAdresseWeb(photo)) {
      erreurs.temoignagePhoto = IMAGE_A_RENVOYER
    }
  }

  // Offre partenaire
  if (valeurs.promoTitre.length > PROMO_TITRE_MAX) {
    erreurs.promoTitre = `Le titre de l'offre dépasse ${PROMO_TITRE_MAX} caractères : raccourcissez-le.`
  }
  if (valeurs.promoDescription.length > PROMO_DESCRIPTION_MAX) {
    erreurs.promoDescription = `La description de l'offre dépasse ${PROMO_DESCRIPTION_MAX} caractères : raccourcissez-la.`
  }
  if (valeurs.promoCode.length > PROMO_CODE_MAX) {
    erreurs.promoCode = `Le code promo dépasse ${PROMO_CODE_MAX} caractères : raccourcissez-le.`
  }
  if (valeurs.promoConditions.length > PROMO_CONDITIONS_MAX) {
    erreurs.promoConditions = `Les conditions dépassent ${PROMO_CONDITIONS_MAX} caractères : raccourcissez-les.`
  }

  // Publication : le serveur lit un entier et retient 0 si le champ est vide
  if ((parseInt(valeurs.ordre) || 0) < 0) {
    erreurs.ordre = "L'ordre d'affichage ne peut pas être négatif : indiquez 0 ou plus."
  }

  return erreurs
}
