'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { LoadingButton } from '@/components/admin/LoadingButton'
import { toast } from 'sonner'
import {
  AtSign,
  Building2,
  CircleAlert,
  Eye,
  ImageIcon,
  Plus,
  Sparkles,
  Ticket,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Partenaire } from '@/generated/prisma/client'

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
] as const

const TYPE_PARTENARIAT = [
  'Partenaire',
  'Équipementier',
  'Principal',
  'Institutionnel',
  'Technique',
  'Média',
] as const

// Sections du formulaire (navigation interne)
const SECTIONS = [
  { id: 'identite', label: 'Identité', icon: Building2 },
  { id: 'visuels', label: 'Logo & visuels', icon: ImageIcon },
  { id: 'contact', label: 'Contact & réseaux', icon: AtSign },
  { id: 'storytelling', label: 'Storytelling', icon: Sparkles },
  { id: 'offre', label: 'Offre promo', icon: Ticket },
  { id: 'publication', label: 'Publication', icon: Eye },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

interface PartenaireFormProps {
  action: (formData: FormData) => Promise<void>
  initialData?: Partenaire
}

/* ---------- Éléments de mise en page ---------- */

function FormSection({
  id,
  title,
  description,
  action,
  children,
}: {
  id: SectionId
  title: string
  description: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  const Icon = SECTIONS.find((s) => s.id === id)!.icon

  return (
    <Card id={id} className="scroll-mt-32 lg:scroll-mt-8">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 border-b px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
            <Icon className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-base font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="space-y-6 p-5 sm:p-6">{children}</div>
    </Card>
  )
}

function Field({
  label,
  htmlFor,
  required,
  hint,
  className,
  children,
}: {
  label: string
  htmlFor?: string
  required?: boolean
  hint?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-0.5 text-primary-700">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

/** Sous-bloc avec titre, aide et bouton « Ajouter » (listes de valeurs, galerie…) */
function SubBlock({
  title,
  hint,
  onAdd,
  addLabel = 'Ajouter',
  children,
}: {
  title: string
  hint?: string
  onAdd?: () => void
  addLabel?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3 border-t pt-6 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-normal">{title}</h3>
          {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {onAdd && (
          <Button type="button" variant="outline" size="sm" onClick={onAdd}>
            <Plus />
            {addLabel}
          </Button>
        )}
      </div>
      {children}
    </div>
  )
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">{children}</p>
  )
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      title={label}
      className="shrink-0 text-muted-foreground hover:bg-red-50 hover:text-red-600"
    >
      <X />
      <span className="sr-only">{label}</span>
    </Button>
  )
}

function SwitchRow({
  id,
  label,
  description,
  children,
}: {
  id: string
  label: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3.5">
      <div className="min-w-0">
        <Label htmlFor={id} className="cursor-pointer">
          {label}
        </Label>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}

/* ---------- Formulaire ---------- */

export function PartenaireForm({ action, initialData }: PartenaireFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<SectionId>('identite')
  const [logo, setLogo] = useState(initialData?.logo || '')
  const [photoCouverture, setPhotoCouverture] = useState(initialData?.photoCouverture || '')
  const [categorie, setCategorie] = useState(initialData?.categorie || '')
  const [typePartenariat, setTypePartenariat] = useState(initialData?.typePartenariat || 'Partenaire')

  // Couleur de marque (sélecteur + saisie hexadécimale synchronisés)
  const [couleur, setCouleur] = useState(initialData?.couleurPrincipale || '#FF6B35')
  const [couleurTexte, setCouleurTexte] = useState(initialData?.couleurPrincipale || '#FF6B35')

  // Réseaux sociaux
  const initialReseaux = initialData?.reseauxSociaux as any || {}
  const [facebook, setFacebook] = useState(initialReseaux.facebook || '')
  const [instagram, setInstagram] = useState(initialReseaux.instagram || '')
  const [twitter, setTwitter] = useState(initialReseaux.twitter || '')
  const [linkedin, setLinkedin] = useState(initialReseaux.linkedin || '')
  const [youtube, setYoutube] = useState(initialReseaux.youtube || '')

  // Arrays
  const [valeurs, setValeurs] = useState<string[]>(initialData?.valeurs || [])
  const [galerie, setGalerie] = useState<string[]>(initialData?.galerie || [])
  const [apports, setApports] = useState<string[]>(initialData?.apports || [])
  const [projetsCommuns, setProjetsCommuns] = useState<string[]>(initialData?.projetsCommuns || [])

  // Témoignage
  const initialTemoignage = initialData?.temoignage as any || {}
  const [temoignageCitation, setTemoignageCitation] = useState(initialTemoignage.citation || '')
  const [temoignageAuteur, setTemoignageAuteur] = useState(initialTemoignage.auteur || '')
  const [temoignageRole, setTemoignageRole] = useState(initialTemoignage.role || '')
  const [temoignagePhoto, setTemoignagePhoto] = useState(initialTemoignage.photo || '')

  // Offre promotionnelle
  const [promoActive, setPromoActive] = useState(initialData?.promoActive || false)
  const [promoTitre, setPromoTitre] = useState(initialData?.promoTitre || '')
  const [promoDescription, setPromoDescription] = useState(initialData?.promoDescription || '')
  const [promoCode, setPromoCode] = useState(initialData?.promoCode || '')
  const [promoExpiration, setPromoExpiration] = useState(initialData?.promoExpiration ? new Date(initialData.promoExpiration).toISOString().split('T')[0] : '')
  const [promoConditions, setPromoConditions] = useState(initialData?.promoConditions || '')

  // Une valeur existante hors liste (données anciennes) reste visible et sélectionnable
  const categoryOptions: string[] = [...PARTNER_CATEGORIES]
  if (initialData?.categorie && !categoryOptions.includes(initialData.categorie)) {
    categoryOptions.push(initialData.categorie)
  }
  const typeOptions: string[] = [...TYPE_PARTENARIAT]
  if (initialData?.typePartenariat && !typeOptions.includes(initialData.typePartenariat)) {
    typeOptions.push(initialData.typePartenariat)
  }

  // Section visible à l'écran, pour la navigation interne
  useEffect(() => {
    const onScroll = () => {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      let current: SectionId = SECTIONS[0].id
      if (atBottom) {
        current = SECTIONS[SECTIONS.length - 1].id
      } else {
        for (const section of SECTIONS) {
          const el = document.getElementById(section.id)
          if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.3) {
            current = section.id
          }
        }
      }
      setActiveSection(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const nom = formData.get('nom') as string
    const description = formData.get('description') as string

    // Validation avec messages utilisateur
    const errors: string[] = []

    if (!nom?.trim()) {
      errors.push('Le nom du partenaire est requis')
    }
    if (!categorie) {
      errors.push('La catégorie est requise')
    }
    if (!logo) {
      errors.push('Le logo est requis')
    }
    if (!description?.trim()) {
      errors.push('La description est requise')
    }

    if (errors.length > 0) {
      toast.error(errors[0])
      setFormError(errors[0])
      return
    }

    setFormError(null)
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.set('logo', logo)
      formData.set('categorie', categorie)
      formData.set('typePartenariat', typePartenariat)

      // Photo de couverture
      if (photoCouverture) {
        formData.set('photoCouverture', photoCouverture)
      }

      // Réseaux sociaux (JSON)
      const reseauxSociaux = {
        ...(facebook && { facebook }),
        ...(instagram && { instagram }),
        ...(twitter && { twitter }),
        ...(linkedin && { linkedin }),
        ...(youtube && { youtube }),
      }
      if (Object.keys(reseauxSociaux).length > 0) {
        formData.set('reseauxSociaux', JSON.stringify(reseauxSociaux))
      }

      // Arrays
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

      // Offre promotionnelle
      formData.set('promoActive', promoActive.toString())
      if (promoTitre) formData.set('promoTitre', promoTitre)
      if (promoDescription) formData.set('promoDescription', promoDescription)
      if (promoCode) formData.set('promoCode', promoCode)
      if (promoExpiration) formData.set('promoExpiration', promoExpiration)
      if (promoConditions) formData.set('promoConditions', promoConditions)

      await action(formData)
      // Le redirect se fait automatiquement, pas besoin de toast ici
    } catch (error: any) {
      // Next.js redirect lance une erreur NEXT_REDIRECT, ce n'est pas une vraie erreur
      if (error?.digest?.startsWith('NEXT_REDIRECT')) {
        return
      }
      console.error(error)
      toast.error('Une erreur est survenue')
      setFormError('Une erreur est survenue lors de l\'enregistrement')
      setIsSubmitting(false)
    }
  }

  // Helper functions pour les arrays
  const addToArray = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, ''])
  }

  const updateArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter((prev) => {
      const newArray = [...prev]
      newArray[index] = value
      return newArray
    })
  }

  const removeFromArray = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter((prev) => prev.filter((_, i) => i !== index))
  }

  const reseaux = [
    { id: 'facebook', label: 'Facebook', value: facebook, setter: setFacebook, placeholder: 'https://facebook.com/...' },
    { id: 'instagram', label: 'Instagram', value: instagram, setter: setInstagram, placeholder: 'https://instagram.com/...' },
    { id: 'linkedin', label: 'LinkedIn', value: linkedin, setter: setLinkedin, placeholder: 'https://linkedin.com/...' },
    { id: 'twitter', label: 'X (Twitter)', value: twitter, setter: setTwitter, placeholder: 'https://twitter.com/...' },
    { id: 'youtube', label: 'YouTube', value: youtube, setter: setYoutube, placeholder: 'https://youtube.com/...' },
  ]

  return (
    <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-8 xl:gap-10">
      {/* Navigation interne (bureau) */}
      <nav aria-label="Sections du formulaire" className="hidden lg:block">
        <ul className="sticky top-8 space-y-0.5">
          {SECTIONS.map((section) => {
            const Icon = section.icon
            const active = activeSection === section.id
            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={() => setActiveSection(section.id)}
                  aria-current={active ? 'true' : undefined}
                  className={cn(
                    'relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active ? 'bg-card text-foreground shadow-xs ring-1 ring-border' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className={cn('size-4', active ? 'text-primary-700' : 'text-muted-foreground')} />
                  <span className="flex-1">{section.label}</span>
                  {section.id === 'offre' && promoActive && (
                    <span className="size-1.5 rounded-full bg-primary-500" aria-label="Offre active" />
                  )}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="min-w-0 space-y-6">
        {/* Navigation interne (mobile / tablette) */}
        <nav
          aria-label="Sections du formulaire"
          className="sticky top-14 z-30 -mx-4 overflow-x-auto border-b bg-background/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden"
        >
          <ul className="flex w-max gap-1.5">
            {SECTIONS.map((section) => {
              const active = activeSection === section.id
              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'inline-flex h-9 items-center rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      active ? 'border-neutral-900 bg-neutral-900 text-white' : 'bg-card text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {section.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* IDENTITÉ */}
        <FormSection id="identite" title="Identité" description="Nom, catégorie et présentation du partenaire.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nom" htmlFor="nom" required>
              <Input
                id="nom"
                name="nom"
                defaultValue={initialData?.nom}
                placeholder="Nom du partenaire"
              />
            </Field>

            <Field label="Catégorie" htmlFor="categorie" required>
              <Select
                value={categorie}
                onValueChange={setCategorie}
              >
                <SelectTrigger id="categorie">
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="categorie" value={categorie} />
            </Field>

            <Field label="Type de partenariat" htmlFor="typePartenariat">
              <Select
                value={typePartenariat}
                onValueChange={setTypePartenariat}
              >
                <SelectTrigger id="typePartenariat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="typePartenariat" value={typePartenariat} />
            </Field>

            <Field label="Partenaire depuis" htmlFor="anneeDemarrage" hint="Année de démarrage du partenariat">
              <Input
                id="anneeDemarrage"
                name="anneeDemarrage"
                type="number"
                min="1900"
                max="2100"
                defaultValue={initialData?.anneeDemarrage || ''}
                placeholder="2024"
              />
            </Field>
          </div>

          <Field label="Description" htmlFor="description" required hint="Présentation affichée sur la fiche publique du partenaire.">
            <Textarea
              id="description"
              name="description"
              defaultValue={initialData?.description}
              placeholder="Description du partenaire"
              rows={6}
            />
          </Field>
        </FormSection>

        {/* LOGO & VISUELS */}
        <FormSection id="visuels" title="Logo & visuels" description="Logo, image d'en-tête, couleur de marque et galerie photos.">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Logo" required hint="PNG à fond transparent ou blanc de préférence.">
              <ImageUpload
                value={logo}
                onChange={setLogo}
                onRemove={() => setLogo('')}
                disabled={isSubmitting}
                folder="partenaires"
              />
            </Field>

            <Field label="Photo de couverture" hint="Image de fond de l'en-tête de la fiche partenaire.">
              <ImageUpload
                value={photoCouverture}
                onChange={setPhotoCouverture}
                onRemove={() => setPhotoCouverture('')}
                disabled={isSubmitting}
                folder="partenaires"
              />
            </Field>
          </div>

          <Field
            label="Couleur de marque"
            htmlFor="couleurPrincipale"
            hint="Couleur utilisée pour les accents sur la page du partenaire."
          >
            <div className="flex max-w-xs gap-2">
              <Input
                id="couleurPrincipale"
                name="couleurPrincipale"
                type="color"
                value={couleur}
                onChange={(e) => {
                  setCouleur(e.target.value)
                  setCouleurTexte(e.target.value)
                }}
                className="w-14 shrink-0 cursor-pointer p-1"
              />
              <Input
                type="text"
                aria-label="Code hexadécimal de la couleur"
                value={couleurTexte}
                placeholder="#FF6B35"
                pattern="^#[0-9A-Fa-f]{6}$"
                onChange={(e) => {
                  setCouleurTexte(e.target.value)
                  if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                    setCouleur(e.target.value)
                  }
                }}
                className="font-mono uppercase"
              />
            </div>
          </Field>

          <SubBlock
            title="Galerie photos"
            hint="Photos affichées sur la fiche du partenaire."
            onAdd={() => addToArray(setGalerie)}
            addLabel="Ajouter une image"
          >
            {galerie.length === 0 ? (
              <EmptyHint>Aucune image dans la galerie.</EmptyHint>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {galerie.map((image, index) => (
                  <ImageUpload
                    key={index}
                    value={image}
                    onChange={(url) => updateArrayItem(setGalerie, index, url)}
                    onRemove={() => removeFromArray(setGalerie, index)}
                    disabled={isSubmitting}
                    folder="partenaires/galerie"
                  />
                ))}
              </div>
            )}
          </SubBlock>
        </FormSection>

        {/* CONTACT & RÉSEAUX */}
        <FormSection id="contact" title="Contact & réseaux" description="Coordonnées et liens vers les réseaux sociaux.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Site web" htmlFor="site">
              <Input
                id="site"
                name="site"
                type="url"
                defaultValue={initialData?.site || ''}
                placeholder="https://example.com"
              />
            </Field>

            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={initialData?.email || ''}
                placeholder="contact@partenaire.fr"
              />
            </Field>

            <Field label="Téléphone" htmlFor="telephone">
              <Input
                id="telephone"
                name="telephone"
                type="tel"
                defaultValue={initialData?.telephone || ''}
                placeholder="01 23 45 67 89"
              />
            </Field>
          </div>

          <SubBlock title="Réseaux sociaux" hint="Adresses complètes des pages du partenaire. Laissez vide si non concerné.">
            <div className="grid gap-5 sm:grid-cols-2">
              {reseaux.map((reseau) => (
                <Field key={reseau.id} label={reseau.label} htmlFor={reseau.id}>
                  <Input
                    id={reseau.id}
                    type="url"
                    value={reseau.value}
                    onChange={(e) => reseau.setter(e.target.value)}
                    placeholder={reseau.placeholder}
                  />
                </Field>
              ))}
            </div>
          </SubBlock>
        </FormSection>

        {/* STORYTELLING */}
        <FormSection id="storytelling" title="Storytelling" description="Contenus qui racontent le partenariat sur la fiche publique.">
          <Field label="Phrase d'accroche" htmlFor="accroche" hint="Phrase mise en avant en haut de la page du partenaire.">
            <Input
              id="accroche"
              name="accroche"
              defaultValue={initialData?.accroche || ''}
              placeholder="L'innovation au service des coachs de handball"
            />
          </Field>

          <SubBlock title="Valeurs partagées" hint="Quelques mots-clés : Innovation, Local, Jeunesse…" onAdd={() => addToArray(setValeurs)}>
            {valeurs.length === 0 ? (
              <EmptyHint>Aucune valeur ajoutée.</EmptyHint>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {valeurs.map((valeur, index) => (
                  <div key={index} className="flex gap-1.5">
                    <Input
                      value={valeur}
                      aria-label={`Valeur ${index + 1}`}
                      onChange={(e) => updateArrayItem(setValeurs, index, e.target.value)}
                      placeholder="Innovation, Local, Jeunesse..."
                    />
                    <RemoveButton onClick={() => removeFromArray(setValeurs, index)} label="Retirer cette valeur" />
                  </div>
                ))}
              </div>
            )}
          </SubBlock>

          <SubBlock title="Ce qu'ils apportent au club" hint="Équipements, formations, soutien financier…" onAdd={() => addToArray(setApports)}>
            {apports.length === 0 ? (
              <EmptyHint>Aucun apport ajouté.</EmptyHint>
            ) : (
              <div className="space-y-2">
                {apports.map((apport, index) => (
                  <div key={index} className="flex gap-1.5">
                    <Textarea
                      value={apport}
                      aria-label={`Apport ${index + 1}`}
                      onChange={(e) => updateArrayItem(setApports, index, e.target.value)}
                      placeholder="Équipement des joueurs, Formation des coachs..."
                      rows={2}
                    />
                    <RemoveButton onClick={() => removeFromArray(setApports, index)} label="Retirer cet apport" />
                  </div>
                ))}
              </div>
            )}
          </SubBlock>

          <SubBlock title="Nos projets communs" hint="Actions menées ensemble avec le club." onAdd={() => addToArray(setProjetsCommuns)}>
            {projetsCommuns.length === 0 ? (
              <EmptyHint>Aucun projet ajouté.</EmptyHint>
            ) : (
              <div className="space-y-2">
                {projetsCommuns.map((projet, index) => (
                  <div key={index} className="flex gap-1.5">
                    <Textarea
                      value={projet}
                      aria-label={`Projet ${index + 1}`}
                      onChange={(e) => updateArrayItem(setProjetsCommuns, index, e.target.value)}
                      placeholder="Formation des jeunes joueurs, Tournoi annuel..."
                      rows={2}
                    />
                    <RemoveButton onClick={() => removeFromArray(setProjetsCommuns, index)} label="Retirer ce projet" />
                  </div>
                ))}
              </div>
            )}
          </SubBlock>

          <SubBlock title="Témoignage" hint="Affiché si la citation, l'auteur et le rôle sont renseignés.">
            <div className="space-y-5">
              <Field label="Citation" htmlFor="temoignageCitation">
                <Textarea
                  id="temoignageCitation"
                  value={temoignageCitation}
                  onChange={(e) => setTemoignageCitation(e.target.value)}
                  placeholder="Ce partenaire nous accompagne depuis le début et..."
                  rows={4}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Auteur" htmlFor="temoignageAuteur">
                  <Input
                    id="temoignageAuteur"
                    value={temoignageAuteur}
                    onChange={(e) => setTemoignageAuteur(e.target.value)}
                    placeholder="Jean Dupont"
                  />
                </Field>

                <Field label="Rôle" htmlFor="temoignageRole">
                  <Input
                    id="temoignageRole"
                    value={temoignageRole}
                    onChange={(e) => setTemoignageRole(e.target.value)}
                    placeholder="Président du club"
                  />
                </Field>
              </div>

              <Field label="Photo de l'auteur" hint="Optionnelle." className="sm:max-w-xs">
                <ImageUpload
                  value={temoignagePhoto}
                  onChange={setTemoignagePhoto}
                  onRemove={() => setTemoignagePhoto('')}
                  disabled={isSubmitting}
                  folder="partenaires/temoignages"
                />
              </Field>
            </div>
          </SubBlock>
        </FormSection>

        {/* OFFRE PROMO */}
        <FormSection
          id="offre"
          title="Offre partenaire"
          description="Avantage réservé aux membres du club."
          action={
            <div className="flex items-center gap-2.5 rounded-md border bg-muted/40 px-3 py-1.5">
              <Label htmlFor="promoActive" className="cursor-pointer text-sm">
                {promoActive ? 'Offre active' : 'Offre désactivée'}
              </Label>
              <Switch
                id="promoActive"
                checked={promoActive}
                onCheckedChange={setPromoActive}
              />
            </div>
          }
        >
          {promoActive ? (
            <>
              <Field label="Titre de l'offre" htmlFor="promoTitre" required>
                <Input
                  id="promoTitre"
                  value={promoTitre}
                  onChange={(e) => setPromoTitre(e.target.value)}
                  placeholder="-10% sur votre première commande"
                />
              </Field>

              <Field label="Description" htmlFor="promoDescription">
                <Textarea
                  id="promoDescription"
                  value={promoDescription}
                  onChange={(e) => setPromoDescription(e.target.value)}
                  placeholder="Bénéficiez d'une réduction exclusive en tant que membre du HBC Aix-en-Savoie..."
                  rows={3}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Code promo"
                  htmlFor="promoCode"
                  hint="Optionnel. Si vide, le client devra mentionner le club en magasin."
                >
                  <Input
                    id="promoCode"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="HBCAIX10"
                    className="font-mono uppercase"
                  />
                </Field>

                <Field label="Date d'expiration" htmlFor="promoExpiration" hint="Optionnelle.">
                  <Input
                    id="promoExpiration"
                    type="date"
                    value={promoExpiration}
                    onChange={(e) => setPromoExpiration(e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Conditions d'utilisation" htmlFor="promoConditions">
                <Textarea
                  id="promoConditions"
                  value={promoConditions}
                  onChange={(e) => setPromoConditions(e.target.value)}
                  placeholder="Non cumulable avec d'autres offres. Valable en magasin uniquement."
                  rows={2}
                />
              </Field>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Activez l&apos;offre pour proposer une réduction ou un avantage aux licenciés et à leurs familles.
            </p>
          )}
        </FormSection>

        {/* PUBLICATION */}
        <FormSection id="publication" title="Publication" description="Visibilité et position sur le site.">
          <div className="grid gap-3 sm:grid-cols-2">
            <SwitchRow id="published" label="Publié" description="Visible sur la page Partenaires du site.">
              <Switch
                id="published"
                name="published"
                value="true"
                defaultChecked={initialData?.published ?? true}
              />
            </SwitchRow>

            <SwitchRow id="partenaire_majeur" label="Partenaire majeur" description="Mis en avant parmi les partenaires.">
              <Switch
                id="partenaire_majeur"
                name="partenaire_majeur"
                value="true"
                defaultChecked={initialData?.partenaire_majeur}
              />
            </SwitchRow>
          </div>

          <Field
            label="Ordre d'affichage"
            htmlFor="ordre"
            hint="Les plus petits nombres s'affichent en premier. Modifiable aussi par glisser-déposer dans la liste."
          >
            <Input
              id="ordre"
              name="ordre"
              type="number"
              min="0"
              defaultValue={initialData?.ordre || 0}
              className="w-32"
            />
          </Field>
        </FormSection>

        {/* ACTIONS */}
        <div className="sticky bottom-0 z-20 -mx-4 flex flex-col gap-3 border-t bg-card/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:bottom-4 lg:mx-0 lg:rounded-xl lg:border lg:shadow-sm">
          <p
            role={formError ? 'alert' : undefined}
            className={cn('items-center gap-2 text-sm', formError ? 'flex font-medium text-red-600' : 'hidden text-muted-foreground sm:flex')}
          >
            {formError ? (
              <>
                <CircleAlert className="size-4 shrink-0" />
                {formError}
              </>
            ) : (
              <span>
                Champs obligatoires marqués d&apos;un <span className="text-primary-700">*</span>
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              Annuler
            </Button>
            <LoadingButton
              type="submit"
              isLoading={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              {initialData ? 'Enregistrer' : 'Créer le partenaire'}
            </LoadingButton>
          </div>
        </div>
      </div>
    </form>
  )
}
