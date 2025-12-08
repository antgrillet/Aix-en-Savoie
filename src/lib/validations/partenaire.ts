import { z } from 'zod'

// Schéma pour les réseaux sociaux
export const reseauxSociauxSchema = z.object({
  facebook: z.string().url('URL Facebook invalide').optional().or(z.literal('')),
  instagram: z.string().url('URL Instagram invalide').optional().or(z.literal('')),
  twitter: z.string().url('URL Twitter invalide').optional().or(z.literal('')),
  linkedin: z.string().url('URL LinkedIn invalide').optional().or(z.literal('')),
  youtube: z.string().url('URL YouTube invalide').optional().or(z.literal('')),
}).optional().nullable()

// Schéma pour le témoignage
export const temoignageSchema = z.object({
  citation: z.string().min(10, 'La citation doit contenir au moins 10 caractères'),
  auteur: z.string().min(1, 'L\'auteur est requis'),
  role: z.string().min(1, 'Le rôle est requis'),
  photo: z.string().url('URL de photo invalide').optional().or(z.literal('')),
}).optional().nullable()

export const partenaireSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(100),
  slug: z.string().min(1, 'Le slug est requis').max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets').optional(),
  categorie: z.string().min(1, 'La catégorie est requise'),
  typePartenariat: z.string().default('Partenaire'),
  logo: z.string().url('URL de logo invalide'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  site: z.string().url('URL invalide').optional().or(z.literal('')),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  telephone: z.string().optional().or(z.literal('')),

  // Informations complémentaires
  reseauxSociaux: reseauxSociauxSchema,
  anneeDemarrage: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional().nullable(),
  valeurs: z.array(z.string()).default([]),
  galerie: z.array(z.string().url()).default([]),

  // Storytelling & Branding
  accroche: z.string().max(200).optional().or(z.literal('')),
  couleurPrincipale: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur invalide (format hex requis: #RRGGBB)').optional().or(z.literal('')),
  photoCouverture: z.string().url('URL de photo de couverture invalide').optional().or(z.literal('')),
  apports: z.array(z.string()).default([]),
  temoignage: temoignageSchema,
  projetsCommuns: z.array(z.string()).default([]),

  // Offre promotionnelle
  promoActive: z.boolean().default(false),
  promoTitre: z.string().max(100, 'Le titre ne peut pas dépasser 100 caractères').optional().or(z.literal('')),
  promoDescription: z.string().max(500, 'La description ne peut pas dépasser 500 caractères').optional().or(z.literal('')),
  promoCode: z.string().max(50, 'Le code ne peut pas dépasser 50 caractères').optional().or(z.literal('')),
  promoExpiration: z.date().optional().nullable(),
  promoConditions: z.string().max(300, 'Les conditions ne peuvent pas dépasser 300 caractères').optional().or(z.literal('')),

  // Paramètres
  partenaire_majeur: z.boolean().default(false),
  ordre: z.number().int().min(0),
  published: z.boolean().default(true),
})

export type PartenaireFormData = z.infer<typeof partenaireSchema>
export type ReseauxSociaux = z.infer<typeof reseauxSociauxSchema>
export type Temoignage = z.infer<typeof temoignageSchema>
