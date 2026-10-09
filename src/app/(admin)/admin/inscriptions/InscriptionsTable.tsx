"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Calendar, Clipboard, Shield, Users, Coffee } from "lucide-react";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { formatParis } from "@/lib/match-format";
import { deleteInscription } from "./actions";

interface Inscription {
  id: number;
  nom: string;
  prenom: string;
  role: string;
  createdAt: Date;
  match: {
    id: number;
    date: Date;
    adversaire: string;
    domicile: boolean;
    equipe: {
      id: number;
      nom: string;
      categorie: string;
    };
  };
}

interface InscriptionsTableProps {
  inscriptions: Inscription[];
  hideWeekendHeaders?: boolean;
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

const headCell = "h-10 px-4 text-left align-middle text-xs font-medium uppercase tracking-wide text-muted-foreground";

function RolePill({ role }: { role: string }) {
  const config = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG];
  const Icon = config?.icon;

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
      {Icon && <Icon className="size-3.5 text-primary-700" />}
      {config?.label ?? role}
    </span>
  );
}

function matchDate(date: Date) {
  return `${formatParis(date, { weekday: "short", day: "numeric", month: "short" })} · ${formatParis(date, {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function InscriptionsTable({ inscriptions, hideWeekendHeaders = false }: InscriptionsTableProps) {
  const [filterEquipe, setFilterEquipe] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Extraire les équipes uniques
  const equipes = Array.from(
    new Set(inscriptions.map((i) => JSON.stringify(i.match.equipe)))
  ).map((e) => JSON.parse(e));

  // Filtrer les inscriptions
  const filteredInscriptions = inscriptions.filter((inscription) => {
    // Filtrer uniquement les matchs à domicile
    if (!inscription.match.domicile) {
      return false;
    }
    if (
      filterEquipe !== "all" &&
      inscription.match.equipe.id !== parseInt(filterEquipe)
    ) {
      return false;
    }
    if (filterRole !== "all" && inscription.role !== filterRole) {
      return false;
    }
    return true;
  });

  // Regrouper par weekend
  const inscriptionsByWeekend = filteredInscriptions.reduce((acc, inscription) => {
    const matchDate = new Date(inscription.match.date);
    // Trouver le début du weekend (vendredi)
    const dayOfWeek = matchDate.getDay();
    const friday = new Date(matchDate);
    // Le dimanche appartient au week-end du vendredi précédent
    friday.setDate(matchDate.getDate() - (dayOfWeek === 0 ? 2 : dayOfWeek - 5));
    friday.setHours(0, 0, 0, 0);

    const weekendKey = friday.toISOString().split('T')[0];

    if (!acc[weekendKey]) {
      acc[weekendKey] = [];
    }
    acc[weekendKey].push(inscription);
    return acc;
  }, {} as Record<string, typeof filteredInscriptions>);

  const weekends = Object.keys(inscriptionsByWeekend).sort();

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await deleteInscription(deleteId);
      toast.success("Inscription supprimée");
      setDeleteId(null);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  if (inscriptions.length === 0) {
    return (
      <Card className="flex flex-col items-center px-6 py-12 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <Calendar className="size-5" />
        </span>
        <h3 className="mt-4 font-display text-base font-semibold">Aucune inscription</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Il n&apos;y a pas encore d&apos;inscriptions pour les matchs à venir
        </p>
      </Card>
    );
  }

  const deleteButton = (inscription: Inscription) => (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setDeleteId(inscription.id)}
      title="Supprimer l'inscription"
      className="size-9 text-muted-foreground hover:bg-red-50 hover:text-red-600"
    >
      <Trash2 />
      <span className="sr-only">
        Supprimer l&apos;inscription de {inscription.prenom} {inscription.nom}
      </span>
    </Button>
  );

  // Liste d'inscriptions : tableau sur grand écran, lignes empilées sur mobile
  const renderList = (items: Inscription[]) => (
    <>
      <ul className="divide-y md:hidden">
        {items.map((inscription) => (
          <li key={inscription.id} className="flex items-start gap-3 px-4 py-3">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-medium">
                {inscription.prenom} {inscription.nom}
              </p>
              <RolePill role={inscription.role} />
              <p className="text-xs text-muted-foreground">
                {inscription.match.equipe.nom} vs {inscription.match.adversaire} · {matchDate(inscription.match.date)}
              </p>
            </div>
            {deleteButton(inscription)}
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className={headCell}>Bénévole</th>
              <th className={headCell}>Rôle</th>
              <th className={headCell}>Match</th>
              <th className={`${headCell} hidden lg:table-cell`}>Inscrit le</th>
              <th className={`${headCell} text-right`}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((inscription) => (
              <tr key={inscription.id} className="transition-colors hover:bg-muted/40">
                <td className="px-4 py-3 align-middle font-medium">
                  {inscription.prenom} {inscription.nom}
                </td>
                <td className="px-4 py-3 align-middle">
                  <RolePill role={inscription.role} />
                </td>
                <td className="px-4 py-3 align-middle">
                  <p>
                    {inscription.match.equipe.nom} <span className="text-muted-foreground">vs</span>{" "}
                    {inscription.match.adversaire}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {inscription.match.equipe.categorie} · {matchDate(inscription.match.date)}
                  </p>
                </td>
                <td className="hidden px-4 py-3 align-middle text-xs text-muted-foreground lg:table-cell">
                  {formatParis(inscription.createdAt, {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-2 text-right align-middle">{deleteButton(inscription)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const deleteDialog = (
    <DeleteDialog
      open={deleteId !== null}
      onOpenChange={(open) => !open && setDeleteId(null)}
      onConfirm={handleDelete}
      isLoading={deleting}
      title="Supprimer cette inscription ?"
      description="Le bénévole sera retiré de ce match. Cette action est irréversible."
    />
  );

  // Si hideWeekendHeaders est true, afficher une simple table
  if (hideWeekendHeaders) {
    return (
      <>
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3.5 sm:px-5">
            <h3 className="font-display text-base font-semibold">Inscriptions enregistrées</h3>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium tabular-nums text-neutral-600">
              {filteredInscriptions.length}
            </span>
          </div>
          {renderList(filteredInscriptions)}
        </Card>
        {deleteDialog}
      </>
    );
  }

  // Sinon, afficher la version groupée par weekend
  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={filterEquipe} onValueChange={setFilterEquipe}>
            <SelectTrigger className="bg-card sm:w-56" aria-label="Filtrer par équipe">
              <SelectValue placeholder="Filtrer par équipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les équipes</SelectItem>
              {equipes.map((equipe) => (
                <SelectItem key={equipe.id} value={equipe.id.toString()}>
                  {equipe.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="bg-card sm:w-56" aria-label="Filtrer par rôle">
              <SelectValue placeholder="Filtrer par rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              {Object.entries(ROLE_CONFIG).map(([value, config]) => {
                const Icon = config.icon;
                return (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {config.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <p className="text-sm text-muted-foreground sm:ml-auto">
            {filteredInscriptions.length} inscription
            {filteredInscriptions.length > 1 ? "s" : ""}
          </p>
        </div>

        {weekends.map((weekendKey) => {
          const weekendInscriptions = inscriptionsByWeekend[weekendKey];
          const friday = new Date(weekendKey);
          const sunday = new Date(friday);
          sunday.setDate(friday.getDate() + 2);

          return (
            <Card key={weekendKey} className="overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b px-4 py-3.5 sm:px-5">
                <div className="flex items-center gap-2.5">
                  <Calendar className="size-4 text-primary-700" />
                  <h3 className="font-display text-base font-semibold">
                    Week-end du {formatParis(friday, { day: "numeric", month: "short" })} au{" "}
                    {formatParis(sunday, { day: "numeric", month: "short", year: "numeric" })}
                  </h3>
                </div>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium tabular-nums text-neutral-600">
                  {weekendInscriptions.length}
                </span>
              </div>
              {renderList(weekendInscriptions)}
            </Card>
          );
        })}
      </div>

      {deleteDialog}
    </>
  );
}
