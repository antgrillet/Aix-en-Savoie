"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Home,
  MapPin,
  Plane,
  RefreshCw,
  Shield,
  Users,
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
import { siteButton } from "@/components/site/styles";
import { cn } from "@/lib/utils";
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

// Compteurs affichés sur les cartes de match (rôles avec un nombre de places)
const ROLE_COUNTERS = [
  { key: "tableDeMarque", label: "Table de marque", icon: Clipboard, max: 2 },
  { key: "arbitre", label: "Arbitres", icon: Shield, max: 2 },
  { key: "responsableSalle", label: "Resp. salle", icon: Users, max: 1 },
] as const;

const iconButtonClass =
  "inline-flex size-10 items-center justify-center rounded-md text-neutral-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500";

function VolunteerStatus({ needed }: { needed: boolean }) {
  return needed ? (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-primary-500/15 px-1.5 py-1 font-eyebrow text-[0.6rem] leading-none text-primary-300">
      <span aria-hidden className="size-1.5 rounded-full bg-primary-400" />
      Recherche bénévoles
    </span>
  ) : (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-emerald-500/15 px-1.5 py-1 font-eyebrow text-[0.6rem] leading-none text-emerald-300">
      <Check aria-hidden className="size-3" />
      Complet
    </span>
  );
}

function RoleCounters({ stats }: { stats: Match["stats"] }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {ROLE_COUNTERS.map((role) => {
        const count = stats[role.key];
        const full = count >= role.max;
        const Icon = role.icon;

        return (
          <span
            key={role.key}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium tabular-nums",
              full
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-white/[0.04] text-neutral-300 ring-1 ring-inset ring-white/10"
            )}
          >
            <Icon aria-hidden className="size-3.5 opacity-70" />
            {role.label}
            <span className={cn("font-semibold", full ? "text-emerald-200" : "text-white")}>
              {count}/{role.max}
            </span>
          </span>
        );
      })}
    </span>
  );
}

function MatchCard({
  match,
  needed,
  onSelect,
}: {
  match: Match;
  needed: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex w-full flex-col gap-3 rounded-lg border border-l-2 border-white/10 bg-neutral-900 p-4 text-left transition-colors hover:border-primary-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
        needed ? "border-l-primary-500" : "border-l-emerald-400/70"
      )}
    >
      <span className="flex w-full items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="font-headline text-xl text-primary-400">
              {format(new Date(match.date), "HH'h'mm")}
            </span>
            <span className="inline-flex items-center gap-1 rounded-sm bg-white/10 px-1.5 py-0.5 font-eyebrow text-[0.6rem] text-neutral-300">
              {match.domicile ? (
                <Home aria-hidden className="size-3" />
              ) : (
                <Plane aria-hidden className="size-3" />
              )}
              {match.domicile ? "Domicile" : "Extérieur"}
            </span>
          </span>
          <span className="mt-1 block truncate font-display font-bold text-white">
            {match.equipe.nom}
          </span>
          <span className="block truncate text-sm text-neutral-400">vs {match.adversaire}</span>
        </span>
        <VolunteerStatus needed={needed} />
      </span>

      <RoleCounters stats={match.stats} />

      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-400 transition-colors group-hover:text-primary-300">
        Voir les inscrits et s&apos;inscrire
        <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

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
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="size-8 animate-spin text-primary-500" aria-label="Chargement des matchs" />
      </div>
    );
  }

  const renderMatchCard = (match: Match) => (
    <MatchCard
      key={match.id}
      match={match}
      needed={needsVolunteers(match)}
      onSelect={() => setSelectedMatch(match)}
    />
  );

  return (
    <div className="space-y-8">
      {/* En-tête avec navigation */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-headline text-4xl text-white sm:text-5xl">Calendrier des matchs</h2>
          <p className="mt-3 text-neutral-400">
            Week-end du{" "}
            <span className="font-medium text-white">
              {format(saturday, "d MMMM yyyy", { locale: fr })}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-neutral-900 p-1">
            <button
              type="button"
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              className={iconButtonClass}
              aria-label="Week-end précédent"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentWeek(new Date())}
              className="h-10 rounded-md px-3 text-sm font-semibold text-neutral-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              Aujourd&apos;hui
            </button>
            <button
              type="button"
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              className={iconButtonClass}
              aria-label="Week-end suivant"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Actualiser"
            className={cn(siteButton({ variant: "outline", size: "sm" }), "h-12 px-4")}
          >
            <RefreshCw className={refreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* Légende des statuts */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-neutral-400">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-2 rounded-full bg-primary-500" />
          Recherche bénévoles
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-2 rounded-full bg-emerald-400" />
          Complet
        </span>
        <span className="text-neutral-500">Sélectionnez un match pour voir les inscrits et vous inscrire.</span>
      </div>

      {weekendMatchs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 px-6 py-14 text-center">
          <CalendarDays aria-hidden className="mx-auto size-8 text-neutral-600" />
          <p className="mt-4 font-display font-bold text-white">Aucun match ce week-end</p>
          <p className="mt-1 text-sm text-neutral-400">
            Utilisez les flèches pour consulter les week-ends suivants.
          </p>
        </div>
      ) : (
        <>
          {/* Vue mobile - Liste par jour */}
          <div className="space-y-8 md:hidden">
            {[saturday, sunday].map((day) => {
              const dayMatchs = weekendMatchs
                .filter((m) => isSameDay(new Date(m.date), day))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

              if (dayMatchs.length === 0) return null;

              return (
                <div key={day.toISOString()} className="space-y-3">
                  <h3 className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-2">
                    <span className="font-headline text-2xl text-white">
                      {format(day, "EEEE d MMMM", { locale: fr })}
                    </span>
                    <span className="font-eyebrow text-[0.65rem] text-neutral-500">
                      {dayMatchs.length} match{dayMatchs.length > 1 ? "s" : ""}
                    </span>
                  </h3>
                  <div className="space-y-3">{dayMatchs.map(renderMatchCard)}</div>
                </div>
              );
            })}
          </div>

          {/* Vue desktop - Grille du calendrier */}
          <div className="hidden overflow-x-auto rounded-xl border border-white/10 bg-neutral-950 md:block">
            <div className="grid min-w-[720px] grid-cols-[72px_1fr_1fr]">
              {/* En-tête des jours */}
              <div className="sticky left-0 z-10 flex items-end border-b border-r border-white/10 bg-neutral-900 px-3 py-4 font-eyebrow text-[0.65rem] text-neutral-500">
                Heure
              </div>
              {[saturday, sunday].map((day, index) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "border-b border-white/10 bg-neutral-900 px-4 py-4 text-center",
                    index > 0 && "border-l"
                  )}
                >
                  <p className="font-headline text-2xl text-white">
                    {format(day, "EEEE", { locale: fr })}
                  </p>
                  <p className="text-sm text-neutral-400">{format(day, "d MMMM", { locale: fr })}</p>
                </div>
              ))}

              {/* Grille horaire : les créneaux vides restent compacts */}
              {HOURS.map((hour) => {
                const saturdayMatchs = getMatchesForSlot(saturday, hour);
                const sundayMatchs = getMatchesForSlot(sunday, hour);
                const isEmpty = saturdayMatchs.length === 0 && sundayMatchs.length === 0;

                return (
                  <React.Fragment key={`hour-${hour}`}>
                    {/* Colonne des heures */}
                    <div
                      className={cn(
                        "sticky left-0 z-10 border-b border-r border-white/10 bg-neutral-900 px-3 py-2 text-xs font-semibold tabular-nums",
                        isEmpty ? "text-neutral-600" : "text-primary-400"
                      )}
                    >
                      {hour}h00
                    </div>

                    {/* Samedi */}
                    <div className={cn("space-y-2 border-b border-white/[0.06] p-2", isEmpty ? "min-h-11" : "min-h-20")}>
                      {saturdayMatchs.map(renderMatchCard)}
                    </div>

                    {/* Dimanche */}
                    <div
                      className={cn(
                        "space-y-2 border-b border-l border-white/[0.06] p-2",
                        isEmpty ? "min-h-11" : "min-h-20"
                      )}
                    >
                      {sundayMatchs.map(renderMatchCard)}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Dialogue : détails et inscription */}
      <Dialog open={selectedMatch !== null} onOpenChange={() => setSelectedMatch(null)}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-xl border-white/10 bg-neutral-950 p-5 sm:rounded-xl sm:p-8">
          {selectedMatch && (
            <>
              <DialogHeader className="space-y-3 pr-8 text-left">
                <div>
                  <VolunteerStatus needed={needsVolunteers(selectedMatch)} />
                </div>
                <DialogTitle className="font-headline text-3xl font-extrabold tracking-[-0.005em] text-white sm:text-4xl">
                  {selectedMatch.equipe.nom} <span className="text-neutral-500">vs</span>{" "}
                  {selectedMatch.adversaire}
                </DialogTitle>
                <div className="flex flex-col gap-1.5 text-sm text-neutral-400 sm:flex-row sm:flex-wrap sm:gap-x-5">
                  <span className="flex items-center gap-2">
                    <CalendarDays aria-hidden className="size-4 shrink-0 text-primary-500" />
                    <span className="inline-block first-letter:uppercase">
                      {format(new Date(selectedMatch.date), "EEEE d MMMM yyyy 'à' HH'h'mm", {
                        locale: fr,
                      })}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin aria-hidden className="size-4 shrink-0 text-primary-500" />
                    {selectedMatch.lieu}
                  </span>
                </div>
              </DialogHeader>

              <div className="mt-2 grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-eyebrow text-xs text-neutral-500">Bénévoles inscrits</h4>
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
