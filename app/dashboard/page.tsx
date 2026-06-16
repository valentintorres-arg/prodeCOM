import { createServerSupabase } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { format, parseISO, isToday, isTomorrow, addDays, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import MatchCard from "@/components/MatchCard";
import type { Match, Prediction } from "@/types";
import { CalendarDays, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

function groupMatchesByDate(matches: Match[]): Record<string, Match[]> {
  return matches.reduce((acc, match) => {
    const date = match.match_date.slice(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(match);
    return acc;
  }, {} as Record<string, Match[]>);
}

function formatDateHeader(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Hoy";
  if (isTomorrow(date)) return "Mañana";
  return format(date, "EEEE d 'de' MMMM", { locale: es });
}

export default async function DashboardPage() {
  const { user, profile } = await getSessionUser();
  const supabase = await createServerSupabase();

  // Get upcoming and live matches (next 7 days + recent)
  const cutoffDate = addDays(new Date(), -1).toISOString();
  const { data: matches } = await supabase
    .from("matches")
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .gte("match_date", cutoffDate)
    .order("match_date", { ascending: true })
    .limit(50);

  // Get user's predictions for these matches
  let predictions: Prediction[] = [];
  if (user && matches?.length) {
    const matchIds = matches.map((m) => m.id);
    const { data } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", user.id)
      .in("match_id", matchIds);
    predictions = data || [];
  }

  const predictionsByMatchId = predictions.reduce((acc, p) => {
    acc[p.match_id] = p;
    return acc;
  }, {} as Record<string, Prediction>);

  const grouped = groupMatchesByDate(matches || []);
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Próximos partidos
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Hacé tu pronóstico antes de que empiece el partido
          </p>
        </div>
        {profile?.is_admin && (
          <a href="/admin" className="btn-ghost text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Admin
          </a>
        )}
      </div>

      {/* Points summary */}
      {profile && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center">
            <div className="text-3xl font-bold text-gold-400">{profile.total_points}</div>
            <div className="text-xs text-white/50 mt-1">Puntos totales</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-white">{predictions.filter((p) => p.points_earned === 3).length}</div>
            <div className="text-xs text-white/50 mt-1">Exactos ⭐</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-white">{predictions.length}</div>
            <div className="text-xs text-white/50 mt-1">Predicciones</div>
          </div>
        </div>
      )}

      {/* Matches by date */}
      {sortedDates.length === 0 ? (
        <div className="card text-center py-12">
          <CalendarDays className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/50">No hay partidos programados</p>
          {profile?.is_admin && (
            <a href="/admin" className="btn-primary mt-4 inline-block text-sm">
              Agregar partidos
            </a>
          )}
        </div>
      ) : (
        sortedDates.map((date) => (
          <section key={date}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg px-3 py-1">
                <span className="text-blue-400 font-semibold capitalize text-sm">
                  {formatDateHeader(date)}
                </span>
              </div>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <div className="space-y-3">
              {grouped[date].map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  prediction={predictionsByMatchId[match.id] || null}
                  userId={user?.id || null}
                  canPredict={
                    match.status === "upcoming" &&
                    isBefore(new Date(), parseISO(match.match_date))
                  }
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
