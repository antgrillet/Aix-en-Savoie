'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/admin/Button'
import { Field, Input } from '@/components/admin/Field'
import { FormSection } from '@/components/admin/FormSection'
import { enregistrerReglagesArbitrage } from '../arbitrage/actions'

interface ArbitrageReglagesFormProps {
  lienPublic: string
  emailComptable: string
  /** Barème en saisie (« 0,32 ») */
  bareme: string
}

type Champ = 'emailComptable' | 'bareme'

/** Le lien à envoyer aux arbitres, le destinataire des notes validées et le barème kilométrique. */
export function ArbitrageReglagesForm({ lienPublic, emailComptable, bareme }: ArbitrageReglagesFormProps) {
  const [enregistre, setEnregistre] = useState({ emailComptable, bareme })
  const [email, setEmail] = useState(emailComptable)
  const [valeurBareme, setValeurBareme] = useState(bareme)
  const [erreurs, setErreurs] = useState<Partial<Record<Champ, string>>>({})
  const [loading, setLoading] = useState(false)
  const [copie, setCopie] = useState(false)

  const modifie = email.trim() !== enregistre.emailComptable || valeurBareme.trim() !== enregistre.bareme

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(lienPublic)
      setCopie(true)
      toast.success('Lien copié')
      setTimeout(() => setCopie(false), 2000)
    } catch {
      toast.error('Copie impossible : sélectionnez le lien à la main.')
    }
  }

  const enregistrer = async () => {
    setLoading(true)
    try {
      const resultat = await enregistrerReglagesArbitrage({ emailComptable: email, bareme: valeurBareme })
      if (!resultat.ok) {
        setErreurs((resultat.champs ?? {}) as Partial<Record<Champ, string>>)
        toast.error(resultat.erreur)
        return
      }
      setErreurs({})
      toast.dismiss()
      setEnregistre({ emailComptable: email.trim(), bareme: valeurBareme.trim() })
      toast.success(resultat.message)
    } catch {
      toast.error("Les réglages n'ont pas pu être enregistrés. Réessayez dans un instant.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormSection
      id="arbitrage"
      title="Notes d'arbitrage"
      description="Les arbitres déclarent leurs frais sur une page discrète du site. Le bureau valide dans Arbitrage, puis la note signée part au comptable."
    >
      <Field id="arbitrage-lien" label="Lien à envoyer aux arbitres" hint="La page n'est pas référencée par les moteurs de recherche ; un lien discret est aussi en pied de page.">
        <div className="flex gap-2">
          <Input id="arbitrage-lien" aria-describedby="arbitrage-lien-aide" readOnly value={lienPublic} onFocus={(e) => e.currentTarget.select()} className="font-mono" />
          <Button type="button" variant="outline" onClick={copier} aria-label="Copier le lien">
            {copie ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            Copier
          </Button>
        </div>
      </Field>

      <Field id="arbitrage-email-comptable" label="E-mail du comptable" required error={erreurs.emailComptable} hint="Reçoit chaque note validée : PDF signé et justificatifs en pièces jointes.">
        <Input
          type="email"
          autoComplete="off"
          value={email}
          disabled={loading}
          onChange={(e) => {
            setEmail(e.target.value)
            setErreurs((x) => ({ ...x, emailComptable: undefined }))
          }}
        />
      </Field>

      <Field id="arbitrage-bareme" label="Barème kilométrique (€/km)" required error={erreurs.bareme} hint="S'applique aux nouvelles notes ; les notes déjà déposées gardent leur barème.">
        <Input
          inputMode="decimal"
          value={valeurBareme}
          disabled={loading}
          className="sm:max-w-[10rem]"
          onChange={(e) => {
            setValeurBareme(e.target.value)
            setErreurs((x) => ({ ...x, bareme: undefined }))
          }}
        />
      </Field>

      <Button type="button" variant={modifie ? 'default' : 'outline'} isLoading={loading} disabled={!modifie} onClick={enregistrer}>
        Enregistrer les réglages
      </Button>
    </FormSection>
  )
}
