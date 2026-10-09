"use client";

import { Card } from "@/components/ui/card";
import { Check, CircleCheck, TriangleAlert } from "lucide-react";
import { formatParis } from "@/lib/match-format";
import { cn } from "@/lib/utils";

interface MatchAvecManques {
  id: number;
  date: Date;
  adversaire: string;
  equipe: {
    id: number;
    nom: string;
    categorie: string;
  };
  domicile: boolean;
  inscriptionsParRole: {
    tableDeMarque: number;
    arbitre: number;
    responsableSalle: number;
    buvette: number;
  };
  inscritsParRole: {
    tableDeMarque: string[];
    arbitre: string[];
    responsableSalle: string[];
    buvette: string[];
  };
  manques: {
    tableDeMarque: number;
    arbitre: number;
    responsableSalle: number;
  };
  totalManques: number;
}

interface ManquesResumeProps {
  matchs: MatchAvecManques[];
}

// Postes suivis (la buvette n'a pas de besoin minimum)
const POSTES = [
  { key: "tableDeMarque", label: "Table de marque" },
  { key: "arbitre", label: "Arbitre" },
  { key: "responsableSalle", label: "Resp. de salle" },
] as const;

function MatchRow({ match }: { match: MatchAvecManques }) {
  const inscrits = [
    { label: "Table", noms: match.inscritsParRole.tableDeMarque },
    { label: "Arbitre", noms: match.inscritsParRole.arbitre },
    { label: "Resp. salle", noms: match.inscritsParRole.responsableSalle },
    { label: "Buvette", noms: match.inscritsParRole.buvette },
  ].filter((r) => r.noms.length > 0);

  return (
    <li className="flex gap-4 px-4 py-4 sm:px-5">
      {/* Date */}
      <div className="w-12 shrink-0 text-center sm:w-14">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          {formatParis(match.date, { weekday: "short" }).replace(".", "")}
        </p>
        <p className="font-display text-lg font-bold leading-tight">
          {formatParis(match.date, { day: "numeric" })}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatParis(match.date, { month: "short" }).replace(".", "")}
        </p>
      </div>

      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {match.equipe.nom} <span className="text-muted-foreground">vs</span> {match.adversaire}
            </p>
            <p className="text-xs text-muted-foreground">
              {match.equipe.categorie} · {formatParis(match.date, { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-800 ring-1 ring-inset ring-primary-600/25">
            {match.totalManques} poste{match.totalManques > 1 ? "s" : ""} à pourvoir
          </span>
        </div>

        {/* Postes : inscrits / besoin */}
        <ul className="flex flex-wrap gap-1.5">
          {POSTES.map((poste) => {
            const nbInscrits = match.inscriptionsParRole[poste.key];
            const manque = match.manques[poste.key];
            const complet = manque === 0;
            return (
              <li
                key={poste.key}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs",
                  complet
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-border bg-card text-foreground"
                )}
              >
                {complet ? (
                  <Check className="size-3.5" />
                ) : (
                  <span aria-hidden className="size-1.5 rounded-full bg-primary-500" />
                )}
                {poste.label}
                <span className={cn("font-semibold tabular-nums", !complet && "text-primary-800")}>
                  {nbInscrits}/{nbInscrits + manque}
                </span>
              </li>
            );
          })}
        </ul>

        {inscrits.length > 0 && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {inscrits.map((r, i) => (
              <span key={r.label}>
                {i > 0 && " · "}
                {r.label} : <span className="text-foreground">{r.noms.join(", ")}</span>
              </span>
            ))}
          </p>
        )}
      </div>
    </li>
  );
}

export function ManquesResume({ matchs }: ManquesResumeProps) {
  if (matchs.length === 0) {
    return (
      <Card className="flex items-center gap-3 px-5 py-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          <CircleCheck className="size-5" />
        </span>
        <div>
          <p className="text-sm font-medium">Aucun manque de bénévoles</p>
          <p className="text-sm text-muted-foreground">
            Tous les matchs à venir ont suffisamment de bénévoles inscrits
          </p>
        </div>
      </Card>
    );
  }

  const totalManques = matchs.reduce((sum, m) => sum + m.totalManques, 0);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 border-b px-4 py-3.5 sm:px-5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
          <TriangleAlert className="size-4" />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold">Besoins en bénévoles</h3>
          <p className="text-xs text-muted-foreground">
            {totalManques} poste{totalManques > 1 ? "s" : ""} à pourvoir sur {matchs.length} match
            {matchs.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <ul className="divide-y">
        {matchs.map((match) => (
          <MatchRow key={match.id} match={match} />
        ))}
      </ul>
    </Card>
  );
}
