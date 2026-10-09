"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { InscriptionForm } from "./InscriptionForm";
import { InscriptionsDisplay } from "./InscriptionsDisplay";
import { Calendar, MapPin, Home, Plane, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { siteButton } from "@/components/site/styles";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

export function CalendrierMatchList() {
  const [matchs, setMatchs] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipeId, setSelectedEquipeId] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  const fetchMatchs = useCallback(async () => {
    try {
      const url =
        selectedEquipeId === "all"
          ? "/api/calendrier/matchs"
          : `/api/calendrier/matchs?equipeId=${selectedEquipeId}`;

      const response = await fetch(url);
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
  }, [selectedEquipeId]);

  useEffect(() => {
    fetchMatchs();
  }, [fetchMatchs]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMatchs();
  };

  // Grouper les matchs par équipe
  const matchsParEquipe = matchs.reduce((acc, match) => {
    const equipeId = match.equipe.id;
    if (!acc[equipeId]) {
      acc[equipeId] = {
        equipe: match.equipe,
        matchs: [],
      };
    }
    acc[equipeId].matchs.push(match);
    return acc;
  }, {} as Record<number, { equipe: Match["equipe"]; matchs: Match[] }>);

  const equipes = Object.values(matchsParEquipe);

  // Vérifier si un match a besoin de bénévoles
  const needsVolunteers = (match: Match) => {
    return (
      match.stats.tableDeMarque < 2 ||
      match.stats.arbitre < 2 ||
      match.stats.responsableSalle < 1
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (matchs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 px-6 py-14 text-center">
        <Calendar className="mx-auto mb-4 size-8 text-neutral-600" />
        <h3 className="mb-1 font-display text-lg font-bold text-white">Aucun match à venir</h3>
        <p className="text-sm text-neutral-400">
          Il n'y a pas de matchs programmés pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-headline text-4xl text-white sm:text-5xl">Calendrier des matchs</h2>
          <p className="mt-2 text-neutral-400">
            {matchs.length} match{matchs.length > 1 ? "s" : ""} à venir
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className={siteButton({ variant: "outline", size: "sm" })}
        >
          <RefreshCw className={refreshing ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      <Tabs
        value={selectedEquipeId}
        onValueChange={setSelectedEquipeId}
        className="w-full"
      >
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 overflow-x-auto border border-white/10 bg-neutral-900 p-1">
          <TabsTrigger value="all">Toutes les équipes</TabsTrigger>
          {equipes.map(({ equipe }) => (
            <TabsTrigger key={equipe.id} value={equipe.id.toString()}>
              {equipe.nom}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedEquipeId} className="space-y-6 mt-6">
          {equipes.map(({ equipe, matchs: equipeMatchs }) => (
            <div key={equipe.id} className="space-y-4">
              {selectedEquipeId === "all" && (
                <div className="flex items-center gap-3">
                  <h3 className="font-headline text-2xl text-white">{equipe.nom}</h3>
                  <Badge variant="outline">{equipe.categorie}</Badge>
                </div>
              )}

              {equipeMatchs.map((match) => (
                <Card
                  key={match.id}
                  className={cn(
                    "border-white/10 bg-neutral-900 shadow-none",
                    needsVolunteers(match) && "border-l-2 border-l-primary-500"
                  )}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="font-display text-lg font-bold text-white">
                            {equipe.nom} vs {match.adversaire}
                          </CardTitle>
                          {match.domicile ? (
                            <Badge variant="default" className="gap-1">
                              <Home className="h-3 w-3" />
                              Domicile
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <Plane className="h-3 w-3" />
                              Extérieur
                            </Badge>
                          )}
                          {needsVolunteers(match) && (
                            <Badge className="border-transparent bg-primary-500/15 text-primary-300 shadow-none hover:bg-primary-500/15">
                              Bénévoles recherchés
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(match.date), "EEEE d MMMM yyyy 'à' HH:mm", {
                              locale: fr,
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {match.lieu}
                          </div>
                        </div>

                        {match.competition && (
                          <Badge variant="outline">{match.competition}</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <Separator className="bg-white/10" />

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-eyebrow text-xs text-neutral-500">
                          Bénévoles inscrits
                        </h4>
                        <InscriptionsDisplay
                          inscriptions={match.inscriptionsParRole.TABLE_DE_MARQUE}
                          role="TABLE_DE_MARQUE"
                          max={2}
                        />
                        <InscriptionsDisplay
                          inscriptions={match.inscriptionsParRole.ARBITRE}
                          role="ARBITRE"
                          max={2}
                        />
                        <InscriptionsDisplay
                          inscriptions={
                            match.inscriptionsParRole.RESPONSABLE_SALLE
                          }
                          role="RESPONSABLE_SALLE"
                          max={1}
                        />
                        <InscriptionsDisplay
                          inscriptions={match.inscriptionsParRole.BUVETTE}
                          role="BUVETTE"
                        />
                      </div>

                      <div>
                        <InscriptionForm
                          matchId={match.id}
                          stats={match.stats}
                          onSuccess={fetchMatchs}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
