import { createServerSupabase } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";
import { Target } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MisPrediccionesPage() {
  const { user } = await getSessionUser();
  const supabase = await createServerSupabase();

  const { data: predictions } = await supabase
    .from("predictions")
    .select(`
      *,
      match:matches(
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*)
      )
    `)
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const totalPoints = (predictions || []).reduce((sum, p) => sum + p.points_earned, 0);
  const exactResults = (predictions || []).filter((p) => p.points_earned === 3).length;
  const correctOutcomes = (predictions || []).filter((p) => p.points_earned === 1).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Target className="w-7 h-7 text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Mis predicciones</h1>
          <p className="text-white/50 text-sm">Tu historial completo</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card text-center">
          <div className="text-3xl font-bold text-gold-400">{totalPoints}</div>
          <div className="text-xs text-white/50 mt-1">Puntos</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-white">{predictions?.length || 0}</div>
          <div className="text-xs text-white/50 mt-1">Predicciones</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-gold-400">{exactResults}</div>
          <div className="text-xs text-white/50 mt-1">Exactos ⭐</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-400">{correctOutcomes}</div>
          <div className="text-xs text-white/50 mt-1">Ganadores</div>
        </div>
      </div>

      {/* Predictions list */}
      <div className="space-y-3">
        {(predictions || []).map((pred) => {
          const match = pred.match;
          if (!match) return null;

          const isFinished = match.status === "finished";
          const isPending = !isFinished;

          let pointsBadge = null;
          if (isFinished) {
            if (pred.points_earned === 3)
              pointsBadge = <span className="score-badge-exact">+3 ⭐</span>;
            else if (pred.points_earned === 1)
              pointsBadge = <span className="score-badge-correct">+1</span>;
            else
              pointsBadge = <span className="score-badge-wrong">0</span>;
          }

          return (
            <div
              key={pred.id}
              className={`card flex items-center gap-4 ${
                isFinished && pred.points_earned === 3 ? "border-gold-400/30" : ""
              }`}
            >
              {/* Stage + date */}
              <div className="hidden sm:block w-28 flex-shrink-0">
                <div className="text-xs text-white/40">{match.stage}</div>
                <div className="text-xs text-white/60 mt-0.5">
                  {format(parseISO(match.match_date), "d MMM HH:mm", { locale: es })}
                </div>
              </div>

              {/* Teams + result */}
              <div className="flex-1 flex items-center justify-center gap-3">
                {/* Home team */}
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <span className="text-white font-medium text-sm text-right">
                    {match.home_team?.name_es}
                  </span>
                  <Image
                    src={match.home_team?.flag_url || `https://flagcdn.com/w40/${match.home_team?.country_code}.png`}
                    alt={match.home_team?.name_es || ""}
                    width={28}
                    height={20}
                    className="rounded"
                  />
                </div>

                {/* Scores */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Actual score */}
                  {isFinished ? (
                    <div className="text-center">
                      <div className="text-white/40 text-[10px] mb-0.5">Real</div>
                      <div className="font-bold text-white bg-white/10 rounded px-2 py-0.5 text-sm">
                        {match.home_score} - {match.away_score}
                      </div>
                    </div>
                  ) : (
                    <div className="text-white/30 text-sm px-2">vs</div>
                  )}

                  <div className="text-white/30 mx-1">|</div>

                  {/* Prediction */}
                  <div className="text-center">
                    <div className="text-white/40 text-[10px] mb-0.5">Tuyo</div>
                    <div className={`font-bold rounded px-2 py-0.5 text-sm ${
                      isPending
                        ? "text-white/80 bg-white/10"
                        : pred.points_earned === 3
                        ? "text-gold-400 bg-gold-400/10"
                        : pred.points_earned === 1
                        ? "text-blue-400 bg-blue-400/10"
                        : "text-red-400 bg-red-400/10"
                    }`}>
                      {pred.predicted_home} - {pred.predicted_away}
                    </div>
                  </div>
                </div>

                {/* Away team */}
                <div className="flex items-center gap-2 flex-1">
                  <Image
                    src={match.away_team?.flag_url || `https://flagcdn.com/w40/${match.away_team?.country_code}.png`}
                    alt={match.away_team?.name_es || ""}
                    width={28}
                    height={20}
                    className="rounded"
                  />
                  <span className="text-white font-medium text-sm">
                    {match.away_team?.name_es}
                  </span>
                </div>
              </div>

              {/* Points badge */}
              <div className="w-12 text-right flex-shrink-0">
                {pointsBadge || (
                  <span className="text-xs text-white/30">
                    {match.status === "live" ? "🔴 EN VIVO" : "Pend."}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {(!predictions || predictions.length === 0) && (
          <div className="card text-center py-12">
            <Target className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">Todavía no hiciste ningún pronóstico</p>
            <a href="/dashboard" className="btn-primary mt-4 inline-block text-sm">
              Ver partidos
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
