"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, MapPin, Home, Plane } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

export function ManquesResume({ matchs }: ManquesResumeProps) {
  if (matchs.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-orange-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-secondary-700">
                Aucun manque de bénévoles
              </CardTitle>
              <CardDescription className="text-primary-700">
                Tous les matchs à venir ont suffisamment de bénévoles inscrits
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  const totalManques = matchs.reduce((sum, m) => sum + m.totalManques, 0);

  return (
    <div className="space-y-6">
      {/* Aperçu rapide par match */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-primary-700">
          Aperçu rapide - Matchs avec manques
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {matchs.map((match) => {
            const manquesList = [];
            if (match.manques.tableDeMarque > 0)
              manquesList.push(
                `${match.manques.tableDeMarque} table${
                  match.manques.tableDeMarque > 1 ? "s" : ""
                } de marque`
              );
            if (match.manques.arbitre > 0)
              manquesList.push(
                `${match.manques.arbitre} arbitre${match.manques.arbitre > 1 ? "s" : ""}`
              );
            if (match.manques.responsableSalle > 0)
              manquesList.push(`${match.manques.responsableSalle} resp. salle`);

            return (
              <Card
                key={match.id}
                className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs font-semibold">
                        {match.equipe.categorie}
                      </Badge>
                      <Badge variant="destructive" className="text-xs">
                        {match.totalManques} manque{match.totalManques > 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <div className="font-semibold text-sm">
                      {match.equipe.nom} vs {match.adversaire}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(match.date), "EEE d MMM 'à' HH:mm", {
                        locale: fr,
                      })}
                    </div>
                    <div className="text-xs text-orange-600 font-medium">
                      Manque : {manquesList.join(", ")}
                    </div>
                    {(match.inscritsParRole.tableDeMarque.length > 0 ||
                      match.inscritsParRole.arbitre.length > 0 ||
                      match.inscritsParRole.responsableSalle.length > 0) && (
                      <div className="pt-2 border-t space-y-1">
                        {match.inscritsParRole.tableDeMarque.length > 0 && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">
                              Table :{" "}
                            </span>
                            <span className="text-primary-700">
                              {match.inscritsParRole.tableDeMarque.join(", ")}
                            </span>
                          </div>
                        )}
                        {match.inscritsParRole.arbitre.length > 0 && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">
                              Arbitre :{" "}
                            </span>
                            <span className="text-primary-700">
                              {match.inscritsParRole.arbitre.join(", ")}
                            </span>
                          </div>
                        )}
                        {match.inscritsParRole.responsableSalle.length > 0 && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">
                              Resp. salle :{" "}
                            </span>
                            <span className="text-primary-700">
                              {match.inscritsParRole.responsableSalle.join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Détails par match */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-orange-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-secondary-700">
                Détail des besoins par match
              </CardTitle>
              <CardDescription className="text-primary-700">
                {totalManques} poste{totalManques > 1 ? "s" : ""} à pourvoir au total
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      <CardContent className="space-y-4">
        {matchs.map((match) => (
          <div
            key={match.id}
            className="p-4 bg-gradient-to-r from-white to-orange-50 border-0 shadow-md rounded-lg space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold">
                    {match.equipe.nom} vs {match.adversaire}
                  </h4>
                  <Badge variant="outline">{match.equipe.categorie}</Badge>
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
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(match.date), "EEEE d MMMM yyyy 'à' HH:mm", {
                    locale: fr,
                  })}
                </div>
              </div>

              <Badge variant="destructive" className="text-base">
                {match.totalManques} manque{match.totalManques > 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm pt-2 border-t">
              {match.manques.tableDeMarque > 0 && (
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <span className="text-muted-foreground">Table de marque</span>
                  <Badge variant="outline" className="text-orange-600">
                    -{match.manques.tableDeMarque}
                  </Badge>
                </div>
              )}
              {match.manques.arbitre > 0 && (
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <span className="text-muted-foreground">Arbitre</span>
                  <Badge variant="outline" className="text-orange-600">
                    -{match.manques.arbitre}
                  </Badge>
                </div>
              )}
              {match.manques.responsableSalle > 0 && (
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <span className="text-muted-foreground">Resp. salle</span>
                  <Badge variant="outline" className="text-orange-600">
                    -{match.manques.responsableSalle}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
    </div>
  );
}
