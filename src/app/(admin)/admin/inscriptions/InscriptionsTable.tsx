"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Calendar, Clipboard, Shield, Users, Coffee } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { deleteInscription } from "./actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
    const daysToFriday = dayOfWeek >= 5 ? 0 : (5 - dayOfWeek + 7) % 7;
    const friday = new Date(matchDate);
    friday.setDate(matchDate.getDate() - (dayOfWeek - 5));
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
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Aucune inscription</h3>
        <p className="text-muted-foreground">
          Il n'y a pas encore d'inscriptions pour les matchs à venir
        </p>
      </div>
    );
  }

  // Fonction pour rendre une ligne d'inscription
  const renderInscriptionRow = (inscription: Inscription) => {
    const config = ROLE_CONFIG[inscription.role as keyof typeof ROLE_CONFIG];
    const Icon = config?.icon;

    return (
      <TableRow key={inscription.id}>
        <TableCell>
          <div className="space-y-1">
            <div className="font-medium">
              {inscription.match.equipe.nom} vs {inscription.match.adversaire}
            </div>
            <Badge variant={inscription.match.domicile ? "default" : "secondary"}>
              {inscription.match.domicile ? "Domicile" : "Extérieur"}
            </Badge>
          </div>
        </TableCell>
        <TableCell>
          <div className="text-sm">
            {format(new Date(inscription.match.date), "d MMM yyyy", { locale: fr })}
            <div className="text-xs text-muted-foreground">
              {format(new Date(inscription.match.date), "HH:mm")}
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <div className="font-medium">{inscription.match.equipe.nom}</div>
            <Badge variant="outline" className="text-xs">
              {inscription.match.equipe.categorie}
            </Badge>
          </div>
        </TableCell>
        <TableCell>
          <div className="font-medium">
            {inscription.prenom} {inscription.nom}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4" />}
            {config?.label}
          </div>
        </TableCell>
        <TableCell>
          <div className="text-sm text-muted-foreground">
            {format(new Date(inscription.createdAt), "d MMM yyyy 'à' HH:mm", { locale: fr })}
          </div>
        </TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(inscription.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </TableCell>
      </TableRow>
    );
  };

  // Si hideWeekendHeaders est true, afficher une simple table
  if (hideWeekendHeaders) {
    return (
      <>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Match</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Équipe</TableHead>
                <TableHead>Bénévole</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Inscrit le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInscriptions.map((inscription) => renderInscriptionRow(inscription))}
            </TableBody>
          </Table>
        </div>

        <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer cette inscription ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? "Suppression..." : "Supprimer"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Sinon, afficher la version groupée par weekend
  return (
    <>
      <div className="space-y-4">
        <div className="flex gap-4">
          <Select value={filterEquipe} onValueChange={setFilterEquipe}>
            <SelectTrigger className="w-[250px]">
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
            <SelectTrigger className="w-[250px]">
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
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredInscriptions.length} inscription
          {filteredInscriptions.length > 1 ? "s" : ""}
        </div>

        <div className="space-y-6">
          {weekends.map((weekendKey) => {
            const weekendInscriptions = inscriptionsByWeekend[weekendKey];
            const friday = new Date(weekendKey);
            const sunday = new Date(friday);
            sunday.setDate(friday.getDate() + 2);

            return (
              <div key={weekendKey} className="space-y-2">
                <div className="flex items-center gap-3 bg-gradient-to-r from-primary-100 to-secondary-100 p-3 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary-600" />
                  <h3 className="font-semibold text-lg text-primary-700">
                    Weekend du {format(friday, "d MMM", { locale: fr })} au{" "}
                    {format(sunday, "d MMM yyyy", { locale: fr })}
                  </h3>
                  <Badge variant="secondary" className="ml-auto">
                    {weekendInscriptions.length} inscription
                    {weekendInscriptions.length > 1 ? "s" : ""}
                  </Badge>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Match</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Équipe</TableHead>
                        <TableHead>Bénévole</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Inscrit le</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {weekendInscriptions.map((inscription) => renderInscriptionRow(inscription))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette inscription ? Cette action
              est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
