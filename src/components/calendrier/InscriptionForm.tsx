"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { siteButton } from "@/components/site/styles";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Clipboard, Shield, Users, Coffee, Loader2 } from "lucide-react";

// Champs sombres, cohérents avec les formulaires du site
const fieldClass =
  "h-11 border-white/10 bg-neutral-950/60 text-base text-white shadow-none placeholder:text-neutral-500 focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/40 md:text-sm";

interface InscriptionFormProps {
  matchId: number;
  stats: {
    tableDeMarque: number;
    arbitre: number;
    responsableSalle: number;
    buvette: number;
  };
  onSuccess: () => void;
}

const ROLES = [
  {
    value: "TABLE_DE_MARQUE",
    label: "Table de marque",
    icon: Clipboard,
    max: 2,
  },
  { value: "ARBITRE", label: "Arbitre", icon: Shield, max: 2 },
  {
    value: "RESPONSABLE_SALLE",
    label: "Responsable de salle",
    icon: Users,
    max: 1,
  },
  { value: "BUVETTE", label: "Buvette", icon: Coffee, max: null },
];

export function InscriptionForm({
  matchId,
  stats,
  onSuccess,
}: InscriptionFormProps) {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/calendrier/inscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matchId,
          nom: nom.trim(),
          prenom: prenom.trim(),
          role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Inscription réussie !");
        setNom("");
        setPrenom("");
        setRole("");
        onSuccess();
      } else {
        toast.error(data.error || "Erreur lors de l'inscription");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si un rôle est complet
  const isRoleFull = (roleValue: string, max: number | null) => {
    if (max === null) return false;
    const statsKey = roleValue.toLowerCase().replace(/_/g, "") as
      | "tableDeMarque"
      | "arbitre"
      | "responsableSalle"
      | "buvette";
    const statsMapping: Record<string, keyof typeof stats> = {
      TABLE_DE_MARQUE: "tableDeMarque",
      ARBITRE: "arbitre",
      RESPONSABLE_SALLE: "responsableSalle",
      BUVETTE: "buvette",
    };
    return stats[statsMapping[roleValue]] >= max;
  };

  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900 p-5 sm:p-6">
      <h3 className="font-display text-lg font-bold text-white">S&apos;inscrire pour ce match</h3>
      <p className="mt-1 text-sm text-neutral-400">Choisissez un rôle encore disponible.</p>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="prenom" className="text-sm font-medium text-neutral-200">Prénom *</Label>
            <Input
              id="prenom"
              type="text"
              placeholder="Prénom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              required
              disabled={loading}
              className={fieldClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nom" className="text-sm font-medium text-neutral-200">Nom *</Label>
            <Input
              id="nom"
              type="text"
              placeholder="Nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              disabled={loading}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-medium text-neutral-200">Rôle *</Label>
          <Select value={role} onValueChange={setRole} disabled={loading}>
            <SelectTrigger
              id="role"
              className={cn(fieldClass, "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40 data-[placeholder]:text-neutral-500")}
            >
              <SelectValue placeholder="Choisir un rôle" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isFull = isRoleFull(r.value, r.max);
                const statsMapping: Record<string, keyof typeof stats> = {
                  TABLE_DE_MARQUE: "tableDeMarque",
                  ARBITRE: "arbitre",
                  RESPONSABLE_SALLE: "responsableSalle",
                  BUVETTE: "buvette",
                };
                const count = stats[statsMapping[r.value]];

                return (
                  <SelectItem
                    key={r.value}
                    value={r.value}
                    disabled={isFull}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary-400" />
                      <span>{r.label}</span>
                      {r.max !== null && (
                        <span className="text-xs tabular-nums text-neutral-400">
                          ({count}/{r.max})
                        </span>
                      )}
                      {isFull && (
                        <span className="text-xs text-emerald-300">(Complet)</span>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <button
          type="submit"
          className={cn(siteButton({ size: "md" }), "w-full focus-visible:ring-offset-neutral-900")}
          disabled={loading || !role}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Inscription...
            </>
          ) : (
            "S'inscrire"
          )}
        </button>
      </form>
    </div>
  );
}
