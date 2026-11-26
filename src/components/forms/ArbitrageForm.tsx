'use client'

import { useId, useMemo, useRef, useState } from 'react'
import { CheckCircle2, FileText, ImageIcon, Paperclip, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  MAX_JUSTIFICATIFS,
  MAX_TAILLE_JUSTIFICATIF,
  MAX_TAILLE_TOTALE_JUSTIFICATIFS,
  eurosEnCentimes,
  formatCentimes,
  formatTaille,
  formaterIban,
  fraisKilometriques,
  totalCentimes,
} from '@/lib/arbitrage'
import { noteArbitrageSchema, type NoteArbitrageSaisie } from '@/lib/validations/arbitrage'

export interface MatchProposable {
  id: number
  /** AAAA-MM-JJ, heure de Paris */
  jour: string
  /** HH:MM, heure de Paris */
  heure: string
  categorie: string
  adversaire: string
  salle: string
}

interface ArbitrageFormProps {
  matchs: MatchProposable[]
  baremeKmCentimes: number
  baremeLibelle: string
}

type Champ = keyof NoteArbitrageSaisie | 'justificatifs' | 'formulaire'
type Erreurs = Partial<Record<Champ, string>>

/** Bouton secondaire lisible sur le fond sombre du site */
const boutonSecondaire = 'border-zinc-600 bg-transparent text-white hover:bg-white/10 hover:text-white'

const EQUIPE_CLUB = 'HBC Aix-en-Savoie'
const AUCUN_MATCH = 'autre'

const VIDE: Omit<NoteArbitrageSaisie, 'certification' | 'leurre'> = {
  dateMatch: '',
  heureMatch: '',
  categorie: '',
  equipeLocale: EQUIPE_CLUB,
  equipeVisiteur: '',
  salle: '',
  nom: '',
  prenom: '',
  licence: '',
  adresse: '',
  telephone: '',
  email: '',
  titulaireCompte: '',
  iban: '',
  bic: '',
  indemnite: '',
  kilometres: '',
  fraisAnnexes: '',
}

/** Ordre des champs à l'écran : la première erreur reçoit le focus. */
const ORDRE: Champ[] = [
  'dateMatch', 'heureMatch', 'categorie', 'equipeLocale', 'equipeVisiteur', 'salle',
  'nom', 'prenom', 'licence', 'adresse', 'telephone', 'email',
  'titulaireCompte', 'iban', 'bic',
  'indemnite', 'kilometres', 'fraisAnnexes', 'justificatifs', 'certification',
]

const libelleJour = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'UTC',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

/**
 * Photo de téléphone (3 à 5 Mo) → JPEG de 1 600 px de côté au plus, quelques
 * centaines de Ko : assez net pour lire un ticket, assez léger pour l'envoi.
 * Si le navigateur ne sait pas lire l'image (HEIC sous Chrome), le fichier
 * d'origine est gardé et le serveur dira s'il l'accepte.
 */
async function alleger(fichier: File): Promise<File> {
  if (!fichier.type.startsWith('image/')) return fichier
  try {
    const image = await createImageBitmap(fichier)
    const echelle = Math.min(1, 1600 / Math.max(image.width, image.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(image.width * echelle)
    canvas.height = Math.round(image.height * echelle)
    const ctx = canvas.getContext('2d')
    if (!ctx) return fichier
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    image.close()
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82))
    if (!blob) return fichier
    const accepte = ['image/jpeg', 'image/png', 'image/webp'].includes(fichier.type)
    if (accepte && blob.size >= fichier.size) return fichier
    const nom = fichier.name.replace(/\.[^.]*$/, '') || 'justificatif'
    return new File([blob], `${nom}.jpg`, { type: 'image/jpeg' })
  } catch {
    return fichier
  }
}

function typeAccepte(fichier: File): boolean {
  return ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(fichier.type)
}

const panneau = 'rounded-2xl border border-white/10 bg-zinc-900/70 p-5 backdrop-blur-sm sm:p-8'
const champErreur = 'border-red-400 focus-visible:ring-red-400'

export function ArbitrageForm({ matchs, baremeKmCentimes, baremeLibelle }: ArbitrageFormProps) {
  const uid = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const fichierRef = useRef<HTMLInputElement>(null)

  const [valeurs, setValeurs] = useState(VIDE)
  const [matchChoisi, setMatchChoisi] = useState('')
  const [certification, setCertification] = useState(false)
  const [justificatifs, setJustificatifs] = useState<File[]>([])
  const [preparation, setPreparation] = useState(false)
  const [erreurs, setErreurs] = useState<Erreurs>({})
  const [envoi, setEnvoi] = useState(false)
  const [reference, setReference] = useState<string | null>(null)

  const id = (champ: string) => `${uid}-${champ}`

  const maj = (champ: keyof typeof VIDE, valeur: string) => {
    setValeurs((v) => ({ ...v, [champ]: valeur }))
    if (erreurs[champ]) setErreurs((e) => ({ ...e, [champ]: undefined }))
  }

  const choisirMatch = (valeur: string) => {
    setMatchChoisi(valeur)
    const match = matchs.find((m) => String(m.id) === valeur)
    if (match) {
      setValeurs((v) => ({
        ...v,
        dateMatch: match.jour,
        heureMatch: match.heure,
        categorie: match.categorie,
        equipeLocale: EQUIPE_CLUB,
        equipeVisiteur: match.adversaire,
        salle: match.salle,
      }))
      setErreurs((e) => ({
        ...e,
        dateMatch: undefined,
        heureMatch: undefined,
        categorie: undefined,
        equipeLocale: undefined,
        equipeVisiteur: undefined,
        salle: undefined,
      }))
    }
  }

  // Le total suit la saisie ; une saisie illisible compte pour 0 et sera signalée à l'envoi.
  const apercu = useMemo(() => {
    const km = /^\d{1,4}$/.test(valeurs.kilometres.trim()) ? Number(valeurs.kilometres.trim()) : 0
    const frais = {
      indemniteCentimes: eurosEnCentimes(valeurs.indemnite) ?? 0,
      kilometres: km,
      baremeKmCentimes,
      fraisAnnexesCentimes: eurosEnCentimes(valeurs.fraisAnnexes) ?? 0,
    }
    return { km: fraisKilometriques(frais), total: totalCentimes(frais) }
  }, [valeurs.indemnite, valeurs.kilometres, valeurs.fraisAnnexes, baremeKmCentimes])

  const ajouterFichiers = async (liste: FileList | null) => {
    if (!liste || liste.length === 0) return
    setPreparation(true)
    setErreurs((e) => ({ ...e, justificatifs: undefined }))
    try {
      const prepares = await Promise.all(Array.from(liste).map(alleger))
      const refuse = prepares.find((f) => !typeAccepte(f))
      const tropLourd = prepares.find((f) => f.size > MAX_TAILLE_JUSTIFICATIF)
      const tous = [...justificatifs, ...prepares.filter((f) => typeAccepte(f) && f.size <= MAX_TAILLE_JUSTIFICATIF)]
      let message: string | undefined
      if (refuse) message = `« ${refuse.name} » n'est pas accepté : envoyez une photo (JPEG, PNG) ou un PDF.`
      else if (tropLourd) message = `« ${tropLourd.name} » dépasse ${formatTaille(MAX_TAILLE_JUSTIFICATIF)}.`
      let retenus = tous.slice(0, MAX_JUSTIFICATIFS)
      if (tous.length > MAX_JUSTIFICATIFS) message = `${MAX_JUSTIFICATIFS} justificatifs au plus.`
      while (retenus.reduce((s, f) => s + f.size, 0) > MAX_TAILLE_TOTALE_JUSTIFICATIFS) {
        retenus = retenus.slice(0, -1)
        message = `Les justificatifs dépassent ${formatTaille(MAX_TAILLE_TOTALE_JUSTIFICATIFS)} au total.`
      }
      setJustificatifs(retenus)
      if (message) setErreurs((e) => ({ ...e, justificatifs: message }))
    } finally {
      setPreparation(false)
      if (fichierRef.current) fichierRef.current.value = ''
    }
  }

  const retirerFichier = (index: number) => {
    setJustificatifs((liste) => liste.filter((_, i) => i !== index))
    setErreurs((e) => ({ ...e, justificatifs: undefined }))
  }

  const focaliserPremiereErreur = (liste: Erreurs) => {
    const premier = ORDRE.find((champ) => liste[champ])
    if (!premier) return
    const cible = formRef.current?.querySelector<HTMLElement>(`[data-champ="${premier}"]`)
    cible?.focus()
    cible?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }

  const envoyer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (envoi || preparation) return

    const leurre = String(new FormData(e.currentTarget).get('leurre') ?? '')
    const saisie: NoteArbitrageSaisie = { ...valeurs, certification: certification as true, leurre }

    // Mêmes règles que le serveur : on évite un aller-retour pour une faute de frappe.
    const verifie = noteArbitrageSchema.safeParse(saisie)
    if (!verifie.success) {
      const liste: Erreurs = {}
      for (const issue of verifie.error.issues) {
        const champ = String(issue.path[0] ?? 'formulaire') as Champ
        liste[champ] ??= issue.message
      }
      setErreurs(liste)
      focaliserPremiereErreur(liste)
      return
    }

    setEnvoi(true)
    setErreurs({})
    try {
      const corps = new FormData()
      corps.set('note', JSON.stringify(saisie))
      for (const fichier of justificatifs) corps.append('justificatifs', fichier, fichier.name)

      const reponse = await fetch('/api/arbitrage', { method: 'POST', body: corps })
      const resultat = (await reponse.json().catch(() => ({}))) as {
        reference?: string
        error?: string
        champs?: Erreurs
      }
      if (reponse.ok && resultat.reference) {
        setReference(resultat.reference)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      const liste: Erreurs = {
        ...(resultat.champs ?? {}),
        formulaire: resultat.error ?? 'La note n’a pas pu être envoyée. Réessayez dans un instant.',
      }
      setErreurs(liste)
      focaliserPremiereErreur(liste)
    } catch {
      setErreurs({ formulaire: 'Connexion impossible. Vérifiez votre réseau et réessayez.' })
    } finally {
      setEnvoi(false)
    }
  }

  /** Nouvelle note pour un autre match : l'identité et le RIB restent remplis. */
  const nouvelleNote = () => {
    setValeurs((v) => ({
      ...v,
      dateMatch: '',
      heureMatch: '',
      categorie: '',
      equipeLocale: EQUIPE_CLUB,
      equipeVisiteur: '',
      salle: '',
      indemnite: '',
      kilometres: v.kilometres,
      fraisAnnexes: '',
    }))
    setMatchChoisi('')
    setCertification(false)
    setJustificatifs([])
    setErreurs({})
    setReference(null)
  }

  if (reference) {
    return (
      <div className={`${panneau} text-center`} role="status">
        <CheckCircle2 className="mx-auto mb-4 size-14 text-green-400" aria-hidden="true" />
        <h2 className="font-display text-3xl font-bold text-white">Note envoyée au club</h2>
        <p className="mt-3 text-neutral-300">
          Référence <strong className="font-mono text-white">{reference}</strong>
        </p>
        <p className="mx-auto mt-4 max-w-lg text-neutral-400">
          Le bureau va vérifier votre note. Vous recevrez un e-mail à{' '}
          <span className="text-white">{valeurs.email}</span> dès qu&apos;elle sera validée et
          transmise à la trésorerie.
        </p>
        <Button type="button" variant="outline" className={`mt-8 ${boutonSecondaire}`} onClick={nouvelleNote}>
          Déclarer un autre match
        </Button>
      </div>
    )
  }

  const champTexte = (
    champ: keyof typeof VIDE,
    libelle: string,
    options: {
      requis?: boolean
      type?: string
      placeholder?: string
      autoComplete?: string
      inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
      aide?: string
      suffixe?: string
      className?: string
      /** Classes du champ lui-même (le libellé n'en hérite pas) */
      classeChamp?: string
      transformer?: (valeur: string) => string
    } = {}
  ) => {
    const erreur = erreurs[champ]
    const decrit = [options.aide ? `${id(champ)}-aide` : null, erreur ? `${id(champ)}-erreur` : null]
      .filter(Boolean)
      .join(' ')
    return (
      <div className={options.className}>
        <Label htmlFor={id(champ)}>
          {libelle}
          {options.requis ? (
            <span className="text-primary-500" aria-hidden="true">
              {' '}*
            </span>
          ) : (
            <span className="font-normal text-neutral-400"> (facultatif)</span>
          )}
        </Label>
        <div className="relative mt-1">
          <Input
            id={id(champ)}
            data-champ={champ}
            name={champ}
            type={options.type ?? 'text'}
            value={valeurs[champ]}
            onChange={(e) => maj(champ, options.transformer ? options.transformer(e.target.value) : e.target.value)}
            placeholder={options.placeholder}
            autoComplete={options.autoComplete ?? 'off'}
            inputMode={options.inputMode}
            aria-required={options.requis || undefined}
            aria-invalid={erreur ? true : undefined}
            aria-describedby={decrit || undefined}
            className={`${options.suffixe ? 'pr-12' : ''} ${options.classeChamp ?? ''} ${erreur ? champErreur : ''}`}
          />
          {options.suffixe && (
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-neutral-400">
              {options.suffixe}
            </span>
          )}
        </div>
        {options.aide && (
          <p id={`${id(champ)}-aide`} className="mt-1 text-sm text-neutral-400">
            {options.aide}
          </p>
        )}
        {erreur && (
          <p id={`${id(champ)}-erreur`} className="mt-1 text-sm text-red-300">
            {erreur}
          </p>
        )}
      </div>
    )
  }

  const titre = (numero: string, texte: string, aide?: string) => (
    <div className="mb-6">
      <h2 className="flex items-center gap-3 font-display text-2xl font-bold text-white">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-base text-zinc-950">
          {numero}
        </span>
        {texte}
      </h2>
      {aide && <p className="mt-2 text-sm text-neutral-400">{aide}</p>}
    </div>
  )

  return (
    <form ref={formRef} onSubmit={envoyer} noValidate className="space-y-6 text-neutral-100">
      {/* Champ leurre contre les robots : hors écran, hors tabulation, ignoré des lecteurs d'écran */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id('leurre')}>Ne pas remplir ce champ</label>
        <input id={id('leurre')} name="leurre" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <p className="text-sm text-neutral-400">
        Les champs marqués <span className="text-primary-500">*</span> sont obligatoires.
      </p>

      {/* 1. Rencontre */}
      <section className={panneau} aria-labelledby={id('titre-match')}>
        <div id={id('titre-match')}>
          {titre('1', 'La rencontre', 'Choisissez le match dans la liste pour remplir les champs, ou saisissez-le.')}
        </div>

        {matchs.length > 0 && (
          <div className="mb-6">
            <Label htmlFor={id('match')}>Match du club</Label>
            <Select value={matchChoisi} onValueChange={choisirMatch}>
              <SelectTrigger id={id('match')} className="mt-1 w-full">
                <SelectValue placeholder="Choisir un match à domicile" />
              </SelectTrigger>
              {/* Hauteur bornée : la liste compte souvent une trentaine de matchs */}
              <SelectContent className="max-h-[min(20rem,var(--radix-select-content-available-height))]">
                {matchs.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {libelleJour.format(new Date(`${m.jour}T00:00:00Z`))} · {m.heure.replace(':', 'h')} · {m.categorie} contre {m.adversaire}
                  </SelectItem>
                ))}
                <SelectItem value={AUCUN_MATCH}>Mon match n&apos;est pas dans la liste</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {champTexte('dateMatch', 'Date du match', { requis: true, type: 'date' })}
          {champTexte('heureMatch', 'Heure', { requis: true, type: 'time' })}
          {champTexte('categorie', 'Catégorie ou compétition', {
            requis: true,
            placeholder: 'Seniors M · N3, -15 F…',
            className: 'sm:col-span-2',
          })}
          {champTexte('equipeLocale', 'Équipe qui reçoit', { requis: true })}
          {champTexte('equipeVisiteur', 'Équipe visiteuse', { requis: true, placeholder: 'Nom du club adverse' })}
          {champTexte('salle', 'Gymnase', { requis: true, className: 'sm:col-span-2', placeholder: 'Nom et ville du gymnase' })}
        </div>
      </section>

      {/* 2. Arbitre */}
      <section className={panneau} aria-labelledby={id('titre-arbitre')}>
        <div id={id('titre-arbitre')}>{titre('2', 'Vous')}</div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {champTexte('nom', 'Nom', { requis: true, autoComplete: 'family-name', placeholder: 'DUPONT' })}
          {champTexte('prenom', 'Prénom', { requis: true, autoComplete: 'given-name', placeholder: 'Jean' })}
          {champTexte('licence', 'N° de licence FFHandball', { requis: true, placeholder: '5173001…', inputMode: 'numeric' })}
          {champTexte('telephone', 'Téléphone', { requis: true, type: 'tel', autoComplete: 'tel', placeholder: '06 12 34 56 78' })}
          {champTexte('email', 'E-mail', {
            requis: true,
            type: 'email',
            autoComplete: 'email',
            placeholder: 'jean.dupont@exemple.fr',
            aide: 'Vous y recevrez la validation de votre note.',
            className: 'sm:col-span-2',
          })}
          {champTexte('adresse', 'Adresse postale', {
            requis: true,
            autoComplete: 'street-address',
            placeholder: '12 avenue de Savoie, 73000 Chambéry',
            aide: 'Point de départ du trajet.',
            className: 'sm:col-span-2',
          })}
        </div>

        <div className="mt-8 rounded-lg border border-zinc-700 bg-zinc-900/50 p-4 sm:p-5">
          <h3 className="font-sans text-base font-semibold text-white">Coordonnées bancaires</h3>
          <p className="mt-1 text-sm text-neutral-400">
            Seulement si le club n&apos;a pas encore votre RIB ou s&apos;il a changé. Elles ne
            sont visibles que du bureau et du comptable.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {champTexte('titulaireCompte', 'Titulaire du compte', { autoComplete: 'cc-name', className: 'sm:col-span-2' })}
            {champTexte('iban', 'IBAN', {
              placeholder: 'FR76 …',
              transformer: (v) => formaterIban(v.slice(0, 42)),
              classeChamp: 'font-mono',
            })}
            {champTexte('bic', 'BIC', { placeholder: 'AGRIFRPPXXX', transformer: (v) => v.toUpperCase().slice(0, 11) })}
          </div>
        </div>
      </section>

      {/* 3. Frais */}
      <section className={panneau} aria-labelledby={id('titre-frais')}>
        <div id={id('titre-frais')}>
          {titre('3', 'Vos frais', `Déplacement remboursé au barème du club : ${baremeLibelle}.`)}
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {champTexte('indemnite', "Indemnité d'arbitrage", { inputMode: 'decimal', placeholder: '0,00', suffixe: '€', requis: true })}
          {champTexte('kilometres', 'Distance aller-retour', { inputMode: 'numeric', placeholder: '0', suffixe: 'km' })}
          {champTexte('fraisAnnexes', 'Péage et parking', { inputMode: 'decimal', placeholder: '0,00', suffixe: '€' })}
        </div>

        <dl className="mt-6 space-y-2 rounded-lg border border-zinc-700 bg-zinc-900/60 p-4 text-sm">
          <div className="flex justify-between gap-4 text-neutral-300">
            <dt>Déplacement</dt>
            <dd className="tabular-nums">{formatCentimes(apercu.km)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t border-zinc-700 pt-2">
            <dt className="font-semibold text-white">Total demandé</dt>
            <dd className="font-display text-3xl font-bold tabular-nums text-white" aria-live="polite">
              {formatCentimes(apercu.total)}
            </dd>
          </div>
        </dl>

        {/* Justificatifs */}
        <div className="mt-8">
          <p className="font-semibold text-white" id={id('titre-pj')}>
            Justificatifs <span className="font-normal text-neutral-400">(facultatif)</span>
          </p>
          <p className="mt-1 text-sm text-neutral-400" id={id('aide-pj')}>
            Tickets de péage ou de parking, en photo ou en PDF : {MAX_JUSTIFICATIFS} fichiers au plus.
            Sans ticket, ces frais peuvent être refusés.
          </p>

          {justificatifs.length > 0 && (
            <ul className="mt-3 space-y-2">
              {justificatifs.map((fichier, index) => (
                <li
                  key={`${fichier.name}-${index}`}
                  className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm"
                >
                  {fichier.type === 'application/pdf' ? (
                    <FileText className="size-4 shrink-0 text-neutral-400" aria-hidden="true" />
                  ) : (
                    <ImageIcon className="size-4 shrink-0 text-neutral-400" aria-hidden="true" />
                  )}
                  <span className="min-w-0 flex-1 truncate">{fichier.name}</span>
                  <span className="shrink-0 text-neutral-400">{formatTaille(fichier.size)}</span>
                  <button
                    type="button"
                    onClick={() => retirerFichier(index)}
                    className="-m-1 flex size-9 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    aria-label={`Retirer ${fichier.name}`}
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {justificatifs.length < MAX_JUSTIFICATIFS && (
            <>
              <input
                ref={fichierRef}
                id={id('justificatifs')}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
                className="sr-only"
                onChange={(e) => ajouterFichiers(e.target.files)}
                aria-describedby={`${id('aide-pj')}${erreurs.justificatifs ? ` ${id('erreur-pj')}` : ''}`}
              />
              <Button
                type="button"
                variant="outline"
                data-champ="justificatifs"
                className={`mt-3 ${boutonSecondaire}`}
                disabled={preparation}
                onClick={() => fichierRef.current?.click()}
              >
                <Paperclip className="size-4" aria-hidden="true" />
                {preparation ? 'Préparation…' : 'Ajouter un justificatif'}
              </Button>
            </>
          )}
          {erreurs.justificatifs && (
            <p id={id('erreur-pj')} className="mt-2 text-sm text-red-300" role="alert">
              {erreurs.justificatifs}
            </p>
          )}
        </div>
      </section>

      {/* Déclaration et envoi */}
      <section className={panneau}>
        <div className="flex items-start gap-3">
          <Checkbox
            id={id('certification')}
            data-champ="certification"
            checked={certification}
            onCheckedChange={(c) => {
              setCertification(c === true)
              setErreurs((e) => ({ ...e, certification: undefined }))
            }}
            aria-invalid={erreurs.certification ? true : undefined}
            aria-describedby={erreurs.certification ? id('erreur-certif') : undefined}
            className="mt-0.5 size-5"
          />
          <label htmlFor={id('certification')} className="cursor-pointer text-sm leading-relaxed text-neutral-300">
            Je certifie sur l&apos;honneur l&apos;exactitude de ces renseignements et avoir arbitré
            cette rencontre pour le compte du HBC Aix-en-Savoie.
          </label>
        </div>
        {erreurs.certification && (
          <p id={id('erreur-certif')} className="mt-2 text-sm text-red-300">
            {erreurs.certification}
          </p>
        )}

        {erreurs.formulaire && (
          <p className="mt-6 rounded-lg border border-red-400/40 bg-red-950/40 p-3 text-sm text-red-200" role="alert">
            {erreurs.formulaire}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-neutral-400">
            Total demandé : <strong className="text-white">{formatCentimes(apercu.total)}</strong>
          </p>
          <Button type="submit" size="lg" disabled={envoi || preparation} className="w-full sm:w-auto">
            <Send className="size-4" aria-hidden="true" />
            {envoi ? 'Envoi en cours…' : 'Envoyer ma note au club'}
          </Button>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-neutral-500">
          Vos informations servent uniquement au remboursement de vos frais : elles sont lues par le
          bureau et le comptable du club. Voir la{' '}
          <a href="/politique-confidentialite" className="underline hover:text-neutral-300">
            politique de confidentialité
          </a>
          .
        </p>
      </section>
    </form>
  )
}
