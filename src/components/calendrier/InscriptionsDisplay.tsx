"use client";

import { Badge } from "@/components/ui/badge";
import { Users, Clipboard, Shield, Coffee } from "lucide-react";

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
    color: "bg-blue-500/10 text-blue-700 border-blue-200",
  },
  ARBITRE: {
    label: "Arbitre",
    icon: Shield,
    color: "bg-green-500/10 text-green-700 border-green-200",
  },
  RESPONSABLE_SALLE: {
    label: "Responsable de salle",
    icon: Users,
    color: "bg-purple-500/10 text-purple-700 border-purple-200",
  },
  BUVETTE: {
    label: "Buvette",
    icon: Coffee,
    color: "bg-orange-500/10 text-orange-700 border-orange-200",
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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="font-medium text-sm">{config.label}</span>
        </div>
        <Badge
          variant={isFull ? "default" : "outline"}
          className={isFull ? "bg-green-500" : ""}
        >
          {max !== undefined ? `${count}/${max}` : count}
        </Badge>
      </div>
      {inscriptions.length > 0 ? (
        <div className="space-y-1.5 pl-6">
          {inscriptions.map((inscription) => (
            <div
              key={inscription.id}
              className={`text-sm p-2 rounded-md border ${config.color}`}
            >
              {inscription.prenom} {inscription.nom}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground pl-6 italic">
          Aucune inscription
        </div>
      )}
    </div>
  );
}
