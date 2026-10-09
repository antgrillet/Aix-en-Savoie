import { ArrowUpRight, Calendar, CalendarDays, ClipboardList, TriangleAlert } from "lucide-react";
import { getAllInscriptions, getInscriptionsStats } from "./actions";
import { InscriptionsTable } from "./InscriptionsTable";
import { ManquesResume } from "./ManquesResume";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatParis } from "@/lib/match-format";
import { isThisWeek, addWeeks, isSameWeek } from "date-fns";

export const metadata = {
  title: "Inscriptions - Admin",
  description: "Gérer les inscriptions aux matchs",
};

function getWeekendLabel(friday: Date): string {
  const now = new Date();

  if (isThisWeek(friday, { weekStartsOn: 1 })) {
    return "Ce week-end";
  }

  const nextWeek = addWeeks(now, 1);
  if (isSameWeek(friday, nextWeek, { weekStartsOn: 1 })) {
    return "Week-end prochain";
  }

  const sunday = new Date(friday);
  sunday.setDate(friday.getDate() + 2);

  return `Week-end du ${formatParis(friday, { day: "numeric", month: "short" })} au ${formatParis(sunday, { day: "numeric", month: "short" })}`;
}

export default async function InscriptionsPage() {
  const [inscriptions, matchsAvecManques] = await Promise.all([
    getAllInscriptions(),
    getInscriptionsStats(),
  ]);

  // Grouper toutes les données par weekend
  const weekendsData = new Map<string, {
    friday: Date;
    manques: typeof matchsAvecManques;
    inscriptions: typeof inscriptions;
  }>();

  // Grouper les matchs avec manques par weekend
  matchsAvecManques.forEach((match) => {
    const matchDate = new Date(match.date);
    const dayOfWeek = matchDate.getDay();
    const friday = new Date(matchDate);
    // Le dimanche appartient au week-end du vendredi précédent
    friday.setDate(matchDate.getDate() - (dayOfWeek === 0 ? 2 : dayOfWeek - 5));
    friday.setHours(0, 0, 0, 0);
    const weekendKey = friday.toISOString().split('T')[0];

    if (!weekendsData.has(weekendKey)) {
      weekendsData.set(weekendKey, {
        friday,
        manques: [],
        inscriptions: [],
      });
    }
    weekendsData.get(weekendKey)!.manques.push(match);
  });

  // Grouper les inscriptions par weekend
  inscriptions.forEach((inscription) => {
    const matchDate = new Date(inscription.match.date);
    const dayOfWeek = matchDate.getDay();
    const friday = new Date(matchDate);
    // Le dimanche appartient au week-end du vendredi précédent
    friday.setDate(matchDate.getDate() - (dayOfWeek === 0 ? 2 : dayOfWeek - 5));
    friday.setHours(0, 0, 0, 0);
    const weekendKey = friday.toISOString().split('T')[0];

    if (!weekendsData.has(weekendKey)) {
      weekendsData.set(weekendKey, {
        friday,
        manques: [],
        inscriptions: [],
      });
    }
    weekendsData.get(weekendKey)!.inscriptions.push(inscription);
  });

  // Trier les weekends par date et filtrer les weekends passés
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const sortedWeekends = Array.from(weekendsData.entries())
    .filter(([_, data]) => {
      // Calculer le dimanche du weekend
      const sunday = new Date(data.friday);
      sunday.setDate(data.friday.getDate() + 2);
      sunday.setHours(23, 59, 59, 999);

      // Garder seulement les weekends dont le dimanche n'est pas encore passé
      return sunday >= now;
    })
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

  const totalManquesGlobal = sortedWeekends.reduce(
    (sum, [, data]) => sum + data.manques.reduce((s, m) => s + m.totalManques, 0),
    0
  );
  const totalInscriptions = sortedWeekends.reduce((sum, [, data]) => sum + data.inscriptions.length, 0);

  const resume = [
    { label: "Postes à pourvoir", value: totalManquesGlobal, icon: TriangleAlert, highlight: totalManquesGlobal > 0 },
    { label: "Inscriptions enregistrées", value: totalInscriptions, icon: ClipboardList },
    { label: "Week-ends à venir", value: sortedWeekends.length, icon: CalendarDays },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Inscriptions bénévoles"
        description="Besoins et inscriptions des bénévoles pour les matchs à domicile"
        actions={
          <Button variant="outline" asChild>
            <a href="/calendrier" target="_blank" rel="noopener noreferrer">
              Calendrier bénévoles
              <ArrowUpRight />
            </a>
          </Button>
        }
      />

      {sortedWeekends.length === 0 ? (
        <Card className="flex flex-col items-center px-6 py-16 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <Calendar className="size-5" />
          </span>
          <h2 className="mt-4 font-display text-base font-semibold">Aucune inscription</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Il n&apos;y a pas encore d&apos;inscriptions pour les matchs à venir
          </p>
        </Card>
      ) : (
        <>
          <Card className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {resume.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-3 px-5 py-3.5">
                  <Icon className={stat.highlight ? "size-4 text-primary-700" : "size-4 text-muted-foreground"} />
                  <span className="flex-1 text-sm text-muted-foreground">{stat.label}</span>
                  <span className="font-display text-lg font-bold tabular-nums">{stat.value}</span>
                </div>
              );
            })}
          </Card>

          <div className="mt-8 space-y-10">
            {sortedWeekends.map(([weekendKey, data]) => {
              const weekendLabel = getWeekendLabel(data.friday);
              const sunday = new Date(data.friday);
              sunday.setDate(data.friday.getDate() + 2);
              const totalManques = data.manques.reduce((sum, m) => sum + m.totalManques, 0);

              return (
                <section key={weekendKey} aria-labelledby={`weekend-${weekendKey}`}>
                  {/* En-tête du week-end */}
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
                    <div>
                      <h2 id={`weekend-${weekendKey}`} className="font-display text-lg font-semibold">
                        {weekendLabel}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Du {formatParis(data.friday, { weekday: "long", day: "numeric", month: "long" })} au{" "}
                        {formatParis(sunday, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {totalManques > 0 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-800 ring-1 ring-inset ring-primary-600/25">
                          <span aria-hidden className="size-1.5 rounded-full bg-primary-500" />
                          {totalManques} poste{totalManques > 1 ? "s" : ""} à pourvoir
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
                          Complet
                        </span>
                      )}
                      <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600 ring-1 ring-inset ring-neutral-500/20">
                        {data.inscriptions.length} inscription{data.inscriptions.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Contenu du week-end */}
                  <div className="space-y-4">
                    {/* Manques pour ce weekend */}
                    {data.manques.length > 0 && <ManquesResume matchs={data.manques} />}

                    {/* Inscriptions pour ce weekend */}
                    {data.inscriptions.length > 0 && (
                      <InscriptionsTable inscriptions={data.inscriptions} hideWeekendHeaders />
                    )}

                    {data.manques.length === 0 && data.inscriptions.length === 0 && (
                      <Card className="px-5 py-8 text-center text-sm text-muted-foreground">
                        Aucune donnée pour ce week-end
                      </Card>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
