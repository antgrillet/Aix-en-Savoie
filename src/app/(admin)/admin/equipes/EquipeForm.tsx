'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/admin/Button'
import { Field, Input, SwitchField, Textarea } from '@/components/admin/Field'
import { FormSection, SaveBar } from '@/components/admin/FormSection'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { SimpleSelect } from '@/components/admin/Select'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { EntrainementRow, type Creneau } from './EntrainementRow'
import type { Equipe, Entrainement } from '@/generated/prisma/client'

const GENRE_OPTIONS = [
  { value: 'MASCULIN', label: 'Masculin' },
  { value: 'FEMININ', label: 'Féminin' },
] as const

// Mêmes bornes que `equipeSchema` : l'erreur est dite ici, avant l'envoi
const NOM_MAX = 100
const DESCRIPTION_MIN = 10

const formatModification = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

// Ordre d'affichage des champs : la première erreur est celle du haut.
// Les créneaux s'intercalent entre la photo et le lien des matchs.
const CHAMPS_AVANT_CRENEAUX = ['nom', 'categorie', 'entraineur', 'description', 'photo']
const CHAMPS_APRES_CRENEAUX = ['matches', 'ordre']

// `redirect()` dans une Server Action lance une erreur NEXT_REDIRECT : ce n'est pas un échec
function isRedirect(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    typeof error.digest === 'string' &&
    error.digest.startsWith('NEXT_REDIRECT')
  )
}

interface EquipeFormProps {
  action: (formData: FormData) => Promise<void>
  initialData?: Equipe & { entrainements: Entrainement[] }
}

export function EquipeForm({ action, initialData }: EquipeFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [nom, setNom] = useState(initialData?.nom || '')
  const [photo, setPhoto] = useState(initialData?.photo || '')
  const [banniere, setBanniere] = useState(initialData?.banniere || '')
  const [published, setPublished] = useState(initialData?.published ?? true)
  const [featured, setFeatured] = useState(initialData?.featured ?? false)
  const [genre, setGenre] = useState(initialData?.genre || 'MASCULIN')
  const [entrainements, setEntrainements] = useState<Creneau[]>(
    initialData?.entrainements.map((e) => ({ ...e, lieu: e.lieu || '' })) || [
      { jour: '', horaire: '', lieu: '' },
    ]
  )
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  const clearError = (champ: string) => {
    if (errors[champ]) setErrors({ ...errors, [champ]: undefined })
  }

  const addEntrainement = () => {
    setEntrainements([...entrainements, { jour: '', horaire: '', lieu: '' }])
  }

  const removeEntrainement = (index: number) => {
    setEntrainements(entrainements.filter((_, i) => i !== index))
    // Les erreurs de créneaux sont repérées par leur rang : on les efface toutes
    setErrors(
      Object.fromEntries(Object.entries(errors).filter(([champ]) => !champ.startsWith('creneau-')))
    )
  }

  const updateEntrainement = (index: number, field: 'jour' | 'horaire' | 'lieu', value: string) => {
    const updated = [...entrainements]
    updated[index] = { ...updated[index], [field]: value }
    setEntrainements(updated)
    clearError(`creneau-${index}-${field}`)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = e.currentTarget
    const formData = new FormData(form)
    const categorie = formData.get('categorie') as string
    const description = formData.get('description') as string
    const entraineur = formData.get('entraineur') as string

    // Validation avec messages utilisateur
    const found: Record<string, string> = {}

    if (!nom.trim()) {
      found.nom = "Donnez un nom à l'équipe."
    } else if (nom.length > NOM_MAX) {
      found.nom = `Le nom dépasse ${NOM_MAX} caractères : raccourcissez-le.`
    }
    if (!categorie?.trim()) {
      found.categorie = 'Indiquez la catégorie, par exemple N2F.'
    }
    if (!entraineur?.trim()) {
      found.entraineur = "Indiquez le nom de l'entraîneur."
    }
    if (!description?.trim()) {
      found.description = "Écrivez quelques mots de présentation de l'équipe."
    } else if (description.length < DESCRIPTION_MIN) {
      found.description = `La description est trop courte : ${DESCRIPTION_MIN} caractères au moins.`
    }
    if (!photo) {
      found.photo = "Ajoutez la photo de l'équipe."
    }
    entrainements.forEach((entrainement, index) => {
      if (!entrainement.jour?.trim()) {
        found[`creneau-${index}-jour`] = 'Choisissez un jour.'
      }
      if (!entrainement.horaire?.trim()) {
        found[`creneau-${index}-horaire`] = "Indiquez l'horaire."
      }
    })
    // Le navigateur contrôlait déjà ces deux champs (`type="url"`, `type="number" min="0"`) :
    // même contrôle, mais dit sous le champ
    const lien = form.elements.namedItem('matches')
    if (lien instanceof HTMLInputElement && !lien.validity.valid) {
      found.matches = 'Ce lien est incomplet : collez l\'adresse entière, elle commence par https://.'
    }
    const ordre = form.elements.namedItem('ordre')
    if (ordre instanceof HTMLInputElement && !ordre.validity.valid) {
      found.ordre = "L'ordre est un nombre entier, 0 ou plus."
    }

    setErrors(found)

    const ordreChamps = [
      ...CHAMPS_AVANT_CRENEAUX,
      ...entrainements.flatMap((_, index) => [`creneau-${index}-jour`, `creneau-${index}-horaire`]),
      ...CHAMPS_APRES_CRENEAUX,
    ]
    const premierChamp = ordreChamps.find((champ) => found[champ])
    if (premierChamp) {
      const creneau = premierChamp.match(/^creneau-(\d+)-/)
      toast.error(
        creneau ? `Créneau ${Number(creneau[1]) + 1} : ${found[premierChamp]}` : found[premierChamp]
      )
      document.getElementById(premierChamp)?.focus()
      return
    }

    setIsSubmitting(true)

    try {
      formData.set('nom', nom)
      formData.set('photo', photo)
      if (banniere) {
        formData.set('banniere', banniere)
      }
      formData.set('published', published.toString())
      formData.set('featured', featured.toString())
      formData.set('genre', genre)
      formData.set('entrainements', JSON.stringify(entrainements))

      await action(formData)
      // Le redirect se fait automatiquement, pas besoin de toast ici
    } catch (error) {
      // Next.js redirect lance une erreur NEXT_REDIRECT, ce n'est pas une vraie erreur
      if (isRedirect(error)) {
        return
      }
      console.error(error)
      toast.error("L'équipe n'a pas pu être enregistrée.", {
        description: 'Si une autre équipe porte déjà ce nom, changez-le, puis réessayez.',
      })
      setIsSubmitting(false)
    }
  }

  const submitLabel = initialData
    ? 'Enregistrer'
    : published
      ? "Publier l'équipe"
      : 'Enregistrer le brouillon'

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSection title="Identité" description="Ce que les visiteurs lisent sur la page de l'équipe.">
        <Field
          id="nom"
          label="Nom de l'équipe"
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
            placeholder="N2 Féminin"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="categorie" label="Catégorie" required error={errors.categorie}>
            <Input
              name="categorie"
              defaultValue={initialData?.categorie}
              onChange={() => clearError('categorie')}
              placeholder="N2F, Élite, Moins de 15…"
            />
          </Field>

          <Field id="genre" label="Genre" required>
            <SimpleSelect
              value={genre}
              onValueChange={setGenre}
              options={GENRE_OPTIONS}
              placeholder="Choisir un genre"
            />
          </Field>
        </div>

        <Field id="entraineur" label="Entraîneur" required error={errors.entraineur}>
          <Input
            name="entraineur"
            defaultValue={initialData?.entraineur}
            onChange={() => clearError('entraineur')}
            placeholder="Prénom et nom"
          />
        </Field>

        <Field
          id="description"
          label="Description"
          required
          error={errors.description}
          hint="Quelques phrases de présentation, affichées sous le nom de l'équipe."
        >
          <Textarea
            name="description"
            defaultValue={initialData?.description}
            onChange={() => clearError('description')}
            rows={4}
          />
        </Field>
      </FormSection>

      <FormSection title="Photos" description="La photo sert de vignette dans les listes et sur la page de l'équipe.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="photo" label="Photo de l'équipe" required error={errors.photo}>
            <ImageUpload
              value={photo}
              onChange={(url) => {
                setPhoto(url)
                clearError('photo')
              }}
              onRemove={() => setPhoto('')}
              disabled={isSubmitting}
              folder="equipes"
              previewAlt="Aperçu de la photo de l'équipe"
            />
          </Field>

          <Field
            id="banniere"
            label="Bannière"
            optional
            hint="Image de fond en tête de la page de l'équipe."
          >
            <ImageUpload
              value={banniere}
              onChange={setBanniere}
              onRemove={() => setBanniere('')}
              disabled={isSubmitting}
              folder="equipes"
              previewAlt="Aperçu de la bannière"
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Entraînements"
        description="Les créneaux affichés sur la page de l'équipe : jour, horaire et gymnase."
      >
        {entrainements.length > 0 ? (
          <div>
            <div
              aria-hidden="true"
              className="hidden gap-x-3 pb-1.5 text-[0.9375rem] font-semibold leading-snug sm:grid sm:grid-cols-[9rem_10rem_minmax(0,1fr)_2.75rem] md:grid-cols-[9rem_10rem_minmax(0,1fr)_2.5rem]"
            >
              <span>Jour *</span>
              <span>Horaire *</span>
              <span>
                Lieu <span className="ml-1 font-normal text-muted-foreground">facultatif</span>
              </span>
            </div>
            <ul className="max-sm:divide-y max-sm:divide-border sm:space-y-3">
              {entrainements.map((entrainement, index) => (
                <EntrainementRow
                  key={index}
                  index={index}
                  creneau={entrainement}
                  errors={errors}
                  onChange={(field, value) => updateEntrainement(index, field, value)}
                  onRemove={() => removeEntrainement(index)}
                  canRemove={entrainements.length !== 1}
                />
              ))}
            </ul>
          </div>
        ) : (
          <p className="adm-meta">Aucun créneau enregistré pour cette équipe.</p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Button type="button" onClick={addEntrainement} size="sm" variant="outline">
            <Plus aria-hidden="true" />
            Ajouter un créneau
          </Button>
          {entrainements.length === 1 && (
            <p className="adm-meta">Le dernier créneau ne se retire pas.</p>
          )}
        </div>
      </FormSection>

      <FormSection
        title="Matchs"
        optional
        description="Avec le lien FFHANDBALL de l'équipe, ses matchs, leurs dates, heures et scores sont importés sur le site."
      >
        <Field
          id="matches"
          label="Lien du calendrier des matchs"
          error={errors.matches}
          hint={
            initialData?.matches ? (
              <>
                <a
                  href={initialData.matches}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="adm-link inline-flex items-center gap-1"
                >
                  Ouvrir le lien enregistré
                  <ExternalLink className="size-3" aria-hidden="true" />
                  <span className="sr-only"> (nouvel onglet)</span>
                </a>
                . « Synchroniser les matchs », en haut de la page, importe les matchs depuis ce lien.
              </>
            ) : (
              "Collez l'adresse de la page de l'équipe sur ffhandball.fr, puis enregistrez : la synchronisation des matchs s'active."
            )
          }
        >
          <Input
            name="matches"
            type="url"
            inputMode="url"
            defaultValue={initialData?.matches || ''}
            onChange={() => clearError('matches')}
            placeholder="https://www.ffhandball.fr/competitions/…"
          />
        </Field>
      </FormSection>

      <FormSection title="Publication" description="Ce que le site montre de cette équipe.">
        <Field
          id="ordre"
          label="Ordre d'affichage"
          error={errors.ordre}
          hint="Les équipes s'affichent du plus petit au plus grand. L'ordre se règle aussi dans la liste, en déplaçant les lignes."
        >
          <Input
            name="ordre"
            type="number"
            min="0"
            inputMode="numeric"
            defaultValue={initialData?.ordre || 0}
            onChange={() => clearError('ordre')}
            className="max-w-28"
          />
        </Field>

        <div className="border-t border-border">
          <SwitchField
            id="published"
            label="Publié"
            description={
              published
                ? 'Visible sur le site dès l\'enregistrement.'
                : 'Gardée en brouillon : invisible sur le site.'
            }
            checked={published}
            onCheckedChange={setPublished}
            aside={<StatusBadge status={published ? 'published' : 'draft'} />}
          />
          <SwitchField
            id="featured"
            label="Afficher sur la page d'accueil"
            description="Les matchs de cette équipe seront affichés."
            checked={featured}
            onCheckedChange={setFeatured}
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
