'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
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
import { Plus, X, Ticket } from 'lucide-react'
import type { Partenaire } from '@prisma/client'

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

interface PartenaireFormProps {
  action: (formData: FormData) => Promise<void>
  initialData?: Partenaire
}

export function PartenaireForm({ action, initialData }: PartenaireFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logo, setLogo] = useState(initialData?.logo || '')
  const [photoCouverture, setPhotoCouverture] = useState(initialData?.photoCouverture || '')
  const [categorie, setCategorie] = useState(initialData?.categorie || '')
  const [typePartenariat, setTypePartenariat] = useState(initialData?.typePartenariat || 'Partenaire')

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
      return
    }

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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* INFORMATIONS GÉNÉRALES */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <h3 className="text-lg font-semibold">Informations générales</h3>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom *</Label>
            <Input
              id="nom"
              name="nom"
              defaultValue={initialData?.nom}
              placeholder="Nom du partenaire"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categorie">Catégorie *</Label>
            <Select
              value={categorie}
              onValueChange={setCategorie}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {PARTNER_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="categorie" value={categorie} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="typePartenariat">Type de partenariat</Label>
          <Select
            value={typePartenariat}
            onValueChange={setTypePartenariat}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_PARTENARIAT.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="typePartenariat" value={typePartenariat} />
        </div>

        <div className="space-y-2">
          <Label>Logo *</Label>
          <ImageUpload
            value={logo}
            onChange={setLogo}
            onRemove={() => setLogo('')}
            disabled={isSubmitting}
            folder="partenaires"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={initialData?.description}
            placeholder="Description du partenaire"
            rows={6}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="anneeDemarrage">Année de démarrage du partenariat</Label>
          <Input
            id="anneeDemarrage"
            name="anneeDemarrage"
            type="number"
            min="1900"
            max="2100"
            defaultValue={initialData?.anneeDemarrage || ''}
            placeholder="2024"
          />
        </div>
      </div>

      {/* STORYTELLING HERO */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <h3 className="text-lg font-semibold">Storytelling - Hero section</h3>

        <div className="space-y-2">
          <Label htmlFor="accroche">Phrase d'accroche</Label>
          <Input
            id="accroche"
            name="accroche"
            defaultValue={initialData?.accroche || ''}
            placeholder="L'innovation au service des coachs de handball"
          />
          <p className="text-sm text-muted-foreground">
            Phrase mise en avant sur la page du partenaire
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="couleurPrincipale">Couleur de marque</Label>
          <div className="flex gap-2">
            <Input
              id="couleurPrincipale"
              name="couleurPrincipale"
              type="color"
              defaultValue={initialData?.couleurPrincipale || '#FF6B35'}
              className="w-20 h-10"
            />
            <Input
              type="text"
              defaultValue={initialData?.couleurPrincipale || '#FF6B35'}
              placeholder="#FF6B35"
              pattern="^#[0-9A-Fa-f]{6}$"
              onChange={(e) => {
                const colorInput = document.getElementById('couleurPrincipale') as HTMLInputElement
                if (colorInput && /^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                  colorInput.value = e.target.value
                }
              }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Couleur utilisée pour les accents sur la page du partenaire
          </p>
        </div>

        <div className="space-y-2">
          <Label>Photo de couverture</Label>
          <ImageUpload
            value={photoCouverture}
            onChange={setPhotoCouverture}
            onRemove={() => setPhotoCouverture('')}
            disabled={isSubmitting}
            folder="partenaires"
          />
          <p className="text-sm text-muted-foreground">
            Image de fond pour la section hero
          </p>
        </div>
      </div>

      {/* CONTACT */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <h3 className="text-lg font-semibold">Informations de contact</h3>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="site">Site web</Label>
            <Input
              id="site"
              name="site"
              type="url"
              defaultValue={initialData?.site || ''}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={initialData?.email || ''}
              placeholder="contact@partenaire.fr"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="telephone">Téléphone</Label>
          <Input
            id="telephone"
            name="telephone"
            type="tel"
            defaultValue={initialData?.telephone || ''}
            placeholder="01 23 45 67 89"
          />
        </div>

        <div className="space-y-4">
          <Label>Réseaux sociaux</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebook" className="text-sm">Facebook</Label>
              <Input
                id="facebook"
                type="url"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-sm">Instagram</Label>
              <Input
                id="instagram"
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter" className="text-sm">Twitter</Label>
              <Input
                id="twitter"
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://twitter.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-sm">LinkedIn</Label>
              <Input
                id="linkedin"
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube" className="text-sm">YouTube</Label>
              <Input
                id="youtube"
                type="url"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* VALEURS PARTAGÉES */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Valeurs partagées</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addToArray(setValeurs)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>

        <div className="space-y-3">
          {valeurs.map((valeur, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={valeur}
                onChange={(e) => updateArrayItem(setValeurs, index, e.target.value)}
                placeholder="Innovation, Local, Jeunesse..."
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFromArray(setValeurs, index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {valeurs.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucune valeur ajoutée. Cliquez sur "Ajouter" pour commencer.
            </p>
          )}
        </div>
      </div>

      {/* GALERIE */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Galerie photos</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addToArray(setGalerie)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une image
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {galerie.map((image, index) => (
            <div key={index} className="space-y-2">
              <ImageUpload
                value={image}
                onChange={(url) => updateArrayItem(setGalerie, index, url)}
                onRemove={() => removeFromArray(setGalerie, index)}
                disabled={isSubmitting}
                folder="partenaires/galerie"
              />
            </div>
          ))}
        </div>
        {galerie.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Aucune image dans la galerie. Cliquez sur "Ajouter une image" pour commencer.
          </p>
        )}
      </div>

      {/* APPORTS AU CLUB */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Ce qu'ils apportent au club</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addToArray(setApports)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>

        <div className="space-y-3">
          {apports.map((apport, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={apport}
                onChange={(e) => updateArrayItem(setApports, index, e.target.value)}
                placeholder="Équipement des joueurs, Formation des coachs..."
                rows={2}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFromArray(setApports, index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {apports.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucun apport ajouté. Cliquez sur "Ajouter" pour commencer.
            </p>
          )}
        </div>
      </div>

      {/* TÉMOIGNAGE */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <h3 className="text-lg font-semibold">Témoignage</h3>

        <div className="space-y-2">
          <Label htmlFor="temoignageCitation">Citation</Label>
          <Textarea
            id="temoignageCitation"
            value={temoignageCitation}
            onChange={(e) => setTemoignageCitation(e.target.value)}
            placeholder="Ce partenaire nous accompagne depuis le début et..."
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="temoignageAuteur">Auteur</Label>
            <Input
              id="temoignageAuteur"
              value={temoignageAuteur}
              onChange={(e) => setTemoignageAuteur(e.target.value)}
              placeholder="Jean Dupont"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="temoignageRole">Rôle</Label>
            <Input
              id="temoignageRole"
              value={temoignageRole}
              onChange={(e) => setTemoignageRole(e.target.value)}
              placeholder="Président du club"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Photo de l'auteur (optionnel)</Label>
          <ImageUpload
            value={temoignagePhoto}
            onChange={setTemoignagePhoto}
            onRemove={() => setTemoignagePhoto('')}
            disabled={isSubmitting}
            folder="partenaires/temoignages"
          />
        </div>
      </div>

      {/* PROJETS COMMUNS */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Nos projets communs</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addToArray(setProjetsCommuns)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>

        <div className="space-y-3">
          {projetsCommuns.map((projet, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={projet}
                onChange={(e) => updateArrayItem(setProjetsCommuns, index, e.target.value)}
                placeholder="Formation des jeunes joueurs, Tournoi annuel..."
                rows={2}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFromArray(setProjetsCommuns, index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {projetsCommuns.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucun projet ajouté. Cliquez sur "Ajouter" pour commencer.
            </p>
          )}
        </div>
      </div>

      {/* OFFRE PARTENAIRE */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            Offre Partenaire
          </h3>
          <div className="flex items-center gap-2">
            <Label htmlFor="promoActive" className="text-sm">Activer l'offre</Label>
            <Switch
              id="promoActive"
              checked={promoActive}
              onCheckedChange={setPromoActive}
            />
          </div>
        </div>

        {promoActive && (
          <div className="space-y-4 pt-2 border-t">
            <div className="space-y-2">
              <Label htmlFor="promoTitre">Titre de l'offre *</Label>
              <Input
                id="promoTitre"
                value={promoTitre}
                onChange={(e) => setPromoTitre(e.target.value)}
                placeholder="-10% sur votre première commande"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="promoDescription">Description</Label>
              <Textarea
                id="promoDescription"
                value={promoDescription}
                onChange={(e) => setPromoDescription(e.target.value)}
                placeholder="Bénéficiez d'une réduction exclusive en tant que membre du HBC Aix-en-Savoie..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="promoCode">Code promo (optionnel)</Label>
                <Input
                  id="promoCode"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="HBCAIX10"
                  className="font-mono uppercase"
                />
                <p className="text-xs text-muted-foreground">
                  Si vide, le client devra mentionner le club en magasin
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="promoExpiration">Date d'expiration (optionnelle)</Label>
                <Input
                  id="promoExpiration"
                  type="date"
                  value={promoExpiration}
                  onChange={(e) => setPromoExpiration(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promoConditions">Conditions d'utilisation</Label>
              <Textarea
                id="promoConditions"
                value={promoConditions}
                onChange={(e) => setPromoConditions(e.target.value)}
                placeholder="Non cumulable avec d'autres offres. Valable en magasin uniquement."
                rows={2}
              />
            </div>
          </div>
        )}
      </div>

      {/* PARAMÈTRES */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <h3 className="text-lg font-semibold">Paramètres</h3>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="ordre">Ordre d'affichage</Label>
            <Input
              id="ordre"
              name="ordre"
              type="number"
              min="0"
              defaultValue={initialData?.ordre || 0}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="partenaire_majeur">Partenaire majeur</Label>
              <Switch
                id="partenaire_majeur"
                name="partenaire_majeur"
                defaultChecked={initialData?.partenaire_majeur}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="published">Publié</Label>
              <Switch
                id="published"
                name="published"
                defaultChecked={initialData?.published ?? true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-4">
        <LoadingButton
          type="submit"
          isLoading={isSubmitting}
        >
          {initialData ? 'Modifier' : 'Créer'}
        </LoadingButton>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}
