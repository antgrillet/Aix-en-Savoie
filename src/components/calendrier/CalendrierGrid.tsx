"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Home,
  Plane,
} from "lucide-react";
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InscriptionForm } from "./InscriptionForm";
import { InscriptionsDisplay } from "./InscriptionsDisplay";

interface Match {
  id: number;
  adversaire: string;
  date: string;
  lieu: string;
  domicile: boolean;
  competition: string | null;
  logoAdversaire: string | null;
  equipe: {
    id: number;
    nom: string;
    categorie: string;
    genre: string;
  };
  inscriptionsParRole: {
    TABLE_DE_MARQUE: any[];
    ARBITRE: any[];
    RESPONSABLE_SALLE: any[];
    BUVETTE: any[];
  };
  stats: {
    tableDeMarque: number;
    arbitre: number;
    responsableSalle: number;
    buvette: number;
  };
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7h à 22h
const DAYS = [6, 0]; // Samedi et Dimanche

export function CalendrierGrid() {
  const [matchs, setMatchs] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMatchs = async () => {
    try {
      const response = await fetch("/api/calendrier/matchs");
      if (response.ok) {
        const data = await response.json();
        setMatchs(data);
      } else {
        toast.error("Erreur lors du chargement des matchs");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement des matchs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMatchs();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMatchs();
  };

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const saturday = addDays(weekStart, 5);
  const sunday = addDays(weekStart, 6);

  // Filtrer les matchs pour le week-end actuel
  const weekendMatchs = matchs.filter((match) => {
    const matchDate = new Date(match.date);
    return isSameDay(matchDate, saturday) || isSameDay(matchDate, sunday);
  });

  // Vérifier si un match a besoin de bénévoles
  const needsVolunteers = (match: Match) => {
    return (
      match.stats.tableDeMarque < 2 ||
      match.stats.arbitre < 2 ||
      match.stats.responsableSalle < 1
    );
  };

  // Obtenir les matchs pour un jour et une heure donnés
  const getMatchesForSlot = (day: Date, hour: number) => {
    return weekendMatchs.filter((match) => {
      const matchDate = new Date(match.date);
      return (
        isSameDay(matchDate, day) && matchDate.getHours() === hour
      );
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <div className="space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Calendrier des matchs</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Semaine du {format(saturday, "d MMMM yyyy", { locale: fr })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              variant="outline"
              size="icon"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setCurrentWeek(new Date())}
              variant="outline"
              className="text-xs md:text-sm"
            >
              Aujourd'hui
            </Button>
            <Button
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              variant="outline"
              size="icon"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleRefresh} variant="outline" disabled={refreshing} className="text-xs md:text-sm">
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
        </div>
      </div>

      {/* Vue mobile - Liste par jour */}
      <div className="md:hidden space-y-4">
        {weekendMatchs.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            Aucun match ce week-end
          </Card>
        ) : (
          <>
            {/* Samedi */}
            {weekendMatchs.filter(m => isSameDay(new Date(m.date), saturday)).length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold px-2">
                  {format(saturday, "EEEE d MMMM", { locale: fr })}
                </h3>
                {weekendMatchs
                  .filter(m => isSameDay(new Date(m.date), saturday))
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((match) => (
                    <Card
                      key={match.id}
                      className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                        needsVolunteers(match)
                          ? "border-orange-300 bg-orange-50/50"
                          : ""
                      }`}
                      onClick={() => setSelectedMatch(match)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-lg font-bold">{format(new Date(match.date), "HH:mm")}</div>
                            <div className="font-semibold mt-1">
                              {match.equipe.nom}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              vs {match.adversaire}
                            </div>
                          </div>
                          {match.domicile ? (
                            <Badge variant="default" className="gap-1 shrink-0">
                              <Home className="h-3 w-3" />
                              Domicile
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1 shrink-0">
                              <Plane className="h-3 w-3" />
                              Extérieur
                            </Badge>
                          )}
                        </div>
                        {needsVolunteers(match) && (
                          <Badge variant="destructive" className="text-xs">
                            Recherche bénévoles
                          </Badge>
                        )}
                        <div className="flex gap-2 text-xs flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            Table de marque {match.stats.tableDeMarque}/2
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Arbitre {match.stats.arbitre}/2
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Responsable salle {match.stats.responsableSalle}/1
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}

            {/* Dimanche */}
            {weekendMatchs.filter(m => isSameDay(new Date(m.date), sunday)).length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold px-2">
                  {format(sunday, "EEEE d MMMM", { locale: fr })}
                </h3>
                {weekendMatchs
                  .filter(m => isSameDay(new Date(m.date), sunday))
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((match) => (
                    <Card
                      key={match.id}
                      className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                        needsVolunteers(match)
                          ? "border-orange-300 bg-orange-50/50"
                          : ""
                      }`}
                      onClick={() => setSelectedMatch(match)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-lg font-bold">{format(new Date(match.date), "HH:mm")}</div>
                            <div className="font-semibold mt-1">
                              {match.equipe.nom}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              vs {match.adversaire}
                            </div>
                          </div>
                          {match.domicile ? (
                            <Badge variant="default" className="gap-1 shrink-0">
                              <Home className="h-3 w-3" />
                              Domicile
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1 shrink-0">
                              <Plane className="h-3 w-3" />
                              Extérieur
                            </Badge>
                          )}
                        </div>
                        {needsVolunteers(match) && (
                          <Badge variant="destructive" className="text-xs">
                            Recherche bénévoles
                          </Badge>
                        )}
                        <div className="flex gap-2 text-xs flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            Table de marque {match.stats.tableDeMarque}/2
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Arbitre {match.stats.arbitre}/2
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Responsable salle {match.stats.responsableSalle}/1
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Vue desktop - Grille du calendrier */}
      <div className="hidden md:block border rounded-lg bg-white overflow-auto">
        <div className="grid grid-cols-[80px_1fr_1fr] min-w-[800px]">
          {/* Header des jours */}
          <div className="border-b border-r p-4 bg-muted/30 font-semibold sticky left-0 z-10">
            Heure
          </div>
          <div className="border-b p-4 bg-muted/30 font-semibold text-center">
            <div className="text-lg">{format(saturday, "EEEE", { locale: fr })}</div>
            <div className="text-sm text-muted-foreground">
              {format(saturday, "d MMMM", { locale: fr })}
            </div>
          </div>
          <div className="border-b border-l p-4 bg-muted/30 font-semibold text-center">
            <div className="text-lg">{format(sunday, "EEEE", { locale: fr })}</div>
            <div className="text-sm text-muted-foreground">
              {format(sunday, "d MMMM", { locale: fr })}
            </div>
          </div>

          {/* Grille horaire */}
          {HOURS.map((hour) => (
            <React.Fragment key={`hour-${hour}`}>
              {/* Colonne des heures */}
              <div
                className="border-r border-b p-2 text-sm text-muted-foreground font-medium sticky left-0 bg-muted/10 z-10"
              >
                {hour}:00
              </div>

              {/* Samedi */}
              <div
                className="border-b p-2 min-h-[80px] hover:bg-muted/20 transition-colors"
              >
                {getMatchesForSlot(saturday, hour).map((match) => (
                  <Card
                    key={match.id}
                    className={`p-3 cursor-pointer hover:shadow-md transition-shadow mb-2 ${
                      needsVolunteers(match)
                        ? "border-orange-300 bg-orange-50/50"
                        : ""
                    }`}
                    onClick={() => setSelectedMatch(match)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {match.equipe.nom}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            vs {match.adversaire}
                          </div>
                        </div>
                        {match.domicile ? (
                          <Badge variant="default" className="gap-1 shrink-0">
                            <Home className="h-3 w-3" />
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 shrink-0">
                            <Plane className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>
                      {needsVolunteers(match) && (
                        <Badge variant="destructive" className="text-xs">
                          Recherche bénévoles
                        </Badge>
                      )}
                      <div className="flex gap-1 text-xs flex-wrap">
                        <Badge variant="outline" className="text-xs" title="Table de marque">
                          Table {match.stats.tableDeMarque}/2
                        </Badge>
                        <Badge variant="outline" className="text-xs" title="Arbitre">
                          Arb. {match.stats.arbitre}/2
                        </Badge>
                        <Badge variant="outline" className="text-xs" title="Responsable salle">
                          Resp. {match.stats.responsableSalle}/1
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Dimanche */}
              <div
                className="border-b border-l p-2 min-h-[80px] hover:bg-muted/20 transition-colors"
              >
                {getMatchesForSlot(sunday, hour).map((match) => (
                  <Card
                    key={match.id}
                    className={`p-3 cursor-pointer hover:shadow-md transition-shadow mb-2 ${
                      needsVolunteers(match)
                        ? "border-orange-300 bg-orange-50/50"
                        : ""
                    }`}
                    onClick={() => setSelectedMatch(match)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {match.equipe.nom}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            vs {match.adversaire}
                          </div>
                        </div>
                        {match.domicile ? (
                          <Badge variant="default" className="gap-1 shrink-0">
                            <Home className="h-3 w-3" />
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 shrink-0">
                            <Plane className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>
                      {needsVolunteers(match) && (
                        <Badge variant="destructive" className="text-xs">
                          Recherche bénévoles
                        </Badge>
                      )}
                      <div className="flex gap-1 text-xs flex-wrap">
                        <Badge variant="outline" className="text-xs" title="Table de marque">
                          Table {match.stats.tableDeMarque}/2
                        </Badge>
                        <Badge variant="outline" className="text-xs" title="Arbitre">
                          Arb. {match.stats.arbitre}/2
                        </Badge>
                        <Badge variant="outline" className="text-xs" title="Responsable salle">
                          Resp. {match.stats.responsableSalle}/1
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Dialog pour les détails et inscription */}
      <Dialog open={selectedMatch !== null} onOpenChange={() => setSelectedMatch(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedMatch && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedMatch.equipe.nom} vs {selectedMatch.adversaire}
                </DialogTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    {format(new Date(selectedMatch.date), "EEEE d MMMM yyyy 'à' HH:mm", {
                      locale: fr,
                    })}
                  </span>
                  <span>•</span>
                  <span>{selectedMatch.lieu}</span>
                </div>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <h4 className="font-semibold">Bénévoles inscrits</h4>
                  <InscriptionsDisplay
                    inscriptions={selectedMatch.inscriptionsParRole.TABLE_DE_MARQUE}
                    role="TABLE_DE_MARQUE"
                    max={2}
                  />
                  <InscriptionsDisplay
                    inscriptions={selectedMatch.inscriptionsParRole.ARBITRE}
                    role="ARBITRE"
                    max={2}
                  />
                  <InscriptionsDisplay
                    inscriptions={
                      selectedMatch.inscriptionsParRole.RESPONSABLE_SALLE
                    }
                    role="RESPONSABLE_SALLE"
                    max={1}
                  />
                  <InscriptionsDisplay
                    inscriptions={selectedMatch.inscriptionsParRole.BUVETTE}
                    role="BUVETTE"
                  />
                </div>

                <div>
                  <InscriptionForm
                    matchId={selectedMatch.id}
                    stats={selectedMatch.stats}
                    onSuccess={() => {
                      fetchMatchs();
                      setSelectedMatch(null);
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
