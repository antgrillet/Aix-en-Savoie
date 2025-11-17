import { ClipboardList, Calendar } from "lucide-react";
import { getAllInscriptions, getInscriptionsStats } from "./actions";
import { InscriptionsTable } from "./InscriptionsTable";
import { ManquesResume } from "./ManquesResume";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, endOfWeek, isThisWeek, addWeeks, isSameWeek } from "date-fns";
import { fr } from "date-fns/locale";

export const metadata = {
  title: "Inscriptions - Admin",
  description: "Gérer les inscriptions aux matchs",
};

function getWeekendLabel(friday: Date): string {
  const now = new Date();

  if (isThisWeek(friday, { weekStartsOn: 1 })) {
    return "Cette semaine";
  }

  const nextWeek = addWeeks(now, 1);
  if (isSameWeek(friday, nextWeek, { weekStartsOn: 1 })) {
    return "Semaine prochaine";
  }

  const sunday = new Date(friday);
  sunday.setDate(friday.getDate() + 2);

  return `Semaine du ${format(friday, "d", { locale: fr })} au ${format(sunday, "d MMM", { locale: fr })}`;
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
    friday.setDate(matchDate.getDate() - (dayOfWeek - 5));
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
    friday.setDate(matchDate.getDate() - (dayOfWeek - 5));
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500">
          <ClipboardList className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
            Inscriptions aux matchs
          </h1>
          <p className="text-muted-foreground">
            Gérez les inscriptions des bénévoles pour les matchs à venir
          </p>
        </div>
      </div>

      {sortedWeekends.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune inscription</h3>
          <p className="text-muted-foreground">
            Il n'y a pas encore d'inscriptions pour les matchs à venir
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedWeekends.map(([weekendKey, data]) => {
            const weekendLabel = getWeekendLabel(data.friday);
            const sunday = new Date(data.friday);
            sunday.setDate(data.friday.getDate() + 2);
            const totalManques = data.manques.reduce((sum, m) => sum + m.totalManques, 0);

            return (
              <div key={weekendKey} className="space-y-4">
                {/* Header du weekend */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg shadow-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-white" />
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {weekendLabel}
                      </h2>
                      <p className="text-white/80 text-sm">
                        {format(data.friday, "d MMM", { locale: fr })} - {format(sunday, "d MMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {totalManques > 0 && (
                      <Badge variant="destructive" className="text-base bg-red-600">
                        {totalManques} manque{totalManques > 1 ? "s" : ""}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-base bg-white/20 text-white border-white/30">
                      {data.inscriptions.length} inscription{data.inscriptions.length > 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>

                {/* Contenu du weekend */}
                <div className="pl-4 space-y-4">
                  {/* Manques pour ce weekend */}
                  {data.manques.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-orange-600">
                        Besoins en bénévoles
                      </h3>
                      <ManquesResume matchs={data.manques} />
                    </div>
                  )}

                  {/* Inscriptions pour ce weekend */}
                  {data.inscriptions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-primary-700">
                        Inscriptions enregistrées
                      </h3>
                      <InscriptionsTable inscriptions={data.inscriptions} hideWeekendHeaders />
                    </div>
                  )}

                  {data.manques.length === 0 && data.inscriptions.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Aucune donnée pour ce weekend
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
