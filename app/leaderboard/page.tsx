import { createServerSupabase } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { Trophy, Medal } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const { user } = await getSessionUser();
  const supabase = await createServerSupabase();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("total_points", { ascending: false })
    .limit(50);

  // Get prediction counts per user
  const { data: predCounts } = await supabase
    .from("predictions")
    .select("user_id, points_earned");

  const statsByUser = (predCounts || []).reduce((acc, p) => {
    if (!acc[p.user_id]) acc[p.user_id] = { total: 0, exact: 0 };
    acc[p.user_id].total++;
    if (p.points_earned === 3) acc[p.user_id].exact++;
    return acc;
  }, {} as Record<string, { total: number; exact: number }>);

  const rankedProfiles = (profiles || []).map((p, i) => ({
    ...p,
    rank: i + 1,
    ...statsByUser[p.id],
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="w-7 h-7 text-gold-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Tabla de posiciones</h1>
          <p className="text-white/50 text-sm">¿Quién la tiene más clara?</p>
        </div>
      </div>

      {/* Top 3 podium */}
      {rankedProfiles.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[rankedProfiles[1], rankedProfiles[0], rankedProfiles[2]].map((p, idx) => {
            const podiumRank = [2, 1, 3][idx];
            const heights = ["h-24", "h-32", "h-20"];
            const colors = [
              "border-gray-400 bg-gray-400/10",
              "border-gold-400 bg-gold-400/10",
              "border-amber-600 bg-amber-600/10",
            ];
            const textColors = ["text-gray-300", "text-gold-400", "text-amber-500"];
            return (
              <div key={p.id} className={`card ${colors[idx]} flex flex-col items-center justify-end ${heights[idx]} border-2 relative`}>
                {podiumRank === 1 && (
                  <span className="absolute -top-3 text-2xl">👑</span>
                )}
                <div className="text-center">
                  <div className="font-bold text-white text-sm truncate max-w-[80px]">{p.username}</div>
                  <div className={`text-lg font-black ${textColors[idx]}`}>{p.total_points} pts</div>
                  <div className={`text-xs ${textColors[idx]} font-bold`}>#{podiumRank}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full ranking */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3">#</th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3">Jugador</th>
              <th className="text-right text-xs text-white/40 font-medium px-4 py-3">Pronósticos</th>
              <th className="text-right text-xs text-white/40 font-medium px-4 py-3">Exactos ⭐</th>
              <th className="text-right text-xs text-white/40 font-medium px-4 py-3">Puntos</th>
            </tr>
          </thead>
          <tbody>
            {rankedProfiles.map((p) => {
              const isMe = p.id === user?.id;
              return (
                <tr
                  key={p.id}
                  className={`border-b border-white/5 last:border-0 transition-colors ${
                    isMe ? "bg-blue-600/10" : "hover:bg-white/5"
                  }`}
                >
                  <td className="px-4 py-3">
                    {p.rank === 1 && <Medal className="w-4 h-4 text-gold-400" />}
                    {p.rank === 2 && <Medal className="w-4 h-4 text-gray-400" />}
                    {p.rank === 3 && <Medal className="w-4 h-4 text-amber-600" />}
                    {p.rank > 3 && (
                      <span className="text-white/40 text-sm font-mono">{p.rank}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center text-sm font-bold text-blue-300 flex-shrink-0">
                        {p.username.charAt(0).toUpperCase()}
                      </div>
                      <span className={`font-medium ${isMe ? "text-blue-300" : "text-white"}`}>
                        {p.username}
                        {isMe && <span className="text-xs text-blue-400 ml-1">(vos)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-white/60 text-sm">
                    {statsByUser[p.id]?.total || 0}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <span className="text-gold-400 font-medium">
                      {statsByUser[p.id]?.exact || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold text-lg ${isMe ? "text-blue-300" : "text-white"}`}>
                      {p.total_points}
                    </span>
                  </td>
                </tr>
              );
            })}
            {rankedProfiles.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-white/40">
                  Nadie ha hecho predicciones todavía
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Points legend */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white/70 mb-3">Sistema de puntuación</h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="score-badge-exact">3 pts</span>
            <span className="text-xs text-white/50">Resultado exacto (ej: 2-1 = 2-1)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="score-badge-correct">1 pt</span>
            <span className="text-xs text-white/50">Ganador correcto o empate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="score-badge-wrong">0 pts</span>
            <span className="text-xs text-white/50">Resultado incorrecto</span>
          </div>
        </div>
      </div>
    </div>
  );
}
