"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { InscriptionForm } from "./InscriptionForm";
import { InscriptionsDisplay } from "./InscriptionsDisplay";
import { Calendar, MapPin, Home, Plane, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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

  const fetchMatchs = async () => {
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
  };

  useEffect(() => {
    fetchMatchs();
  }, [selectedEquipeId]);

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
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (matchs.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Aucun match à venir</h3>
        <p className="text-muted-foreground">
          Il n'y a pas de matchs programmés pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Calendrier des matchs</h2>
          <p className="text-muted-foreground">
            {matchs.length} match{matchs.length > 1 ? "s" : ""} à venir
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Actualiser
        </Button>
      </div>

      <Tabs
        value={selectedEquipeId}
        onValueChange={setSelectedEquipeId}
        className="w-full"
      >
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
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
                  <h3 className="text-xl font-semibold">{equipe.nom}</h3>
                  <Badge variant="outline">{equipe.categorie}</Badge>
                </div>
              )}

              {equipeMatchs.map((match) => (
                <Card
                  key={match.id}
                  className={
                    needsVolunteers(match) ? "border-orange-300 shadow-sm" : ""
                  }
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-lg">
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
                            <Badge variant="destructive">
                              Bénévoles recherchés
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                    <Separator />

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-sm">
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
