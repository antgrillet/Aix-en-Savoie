"use client";

import { Users, Clipboard, Shield, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

interface Inscription {
  id: number;
  nom: string;
  prenom: string;
  role: string;
  createdAt: string;
}

interface InscriptionsDisplayProps {
  inscriptions: Inscription[];
  role: "TABLE_DE_MARQUE" | "ARBITRE" | "RESPONSABLE_SALLE" | "BUVETTE";
  max?: number;
}

const ROLE_CONFIG = {
  TABLE_DE_MARQUE: {
    label: "Table de marque",
    icon: Clipboard,
  },
  ARBITRE: {
    label: "Arbitre",
    icon: Shield,
  },
  RESPONSABLE_SALLE: {
    label: "Responsable de salle",
    icon: Users,
  },
  BUVETTE: {
    label: "Buvette",
    icon: Coffee,
  },
};

export function InscriptionsDisplay({
  inscriptions,
  role,
  max,
}: InscriptionsDisplayProps) {
  const config = ROLE_CONFIG[role];
  const Icon = config.icon;
  const count = inscriptions.length;
  const isFull = max !== undefined && count >= max;
  // Places restantes, matérialisées par des emplacements vides
  const placesLibres = max !== undefined ? Math.max(max - count, 0) : 0;

  return (
    <div className="rounded-lg border border-white/10 bg-neutral-900 p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-500/10 text-primary-400">
            <Icon aria-hidden className="size-4" />
          </span>
          <span className="text-sm font-semibold text-white">{config.label}</span>
        </div>
        <span
          className={cn(
            "rounded-sm px-1.5 py-0.5 text-xs font-semibold tabular-nums",
            isFull
              ? "bg-emerald-500/15 text-emerald-300"
              : "bg-white/[0.04] text-neutral-300 ring-1 ring-inset ring-white/10"
          )}
        >
          {max !== undefined ? `${count}/${max}` : count}
        </span>
      </div>
      {inscriptions.length > 0 || placesLibres > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {inscriptions.map((inscription) => (
            <li
              key={inscription.id}
              className="rounded-md bg-white/[0.07] px-2.5 py-1 text-sm text-neutral-100"
            >
              {inscription.prenom} {inscription.nom}
            </li>
          ))}
          {Array.from({ length: placesLibres }, (_, index) => (
            <li
              key={`libre-${index}`}
              className="rounded-md border border-dashed border-white/15 px-2.5 py-1 text-sm text-neutral-500"
            >
              Place libre
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm italic text-neutral-500">Aucune inscription</p>
      )}
    </div>
  );
}
