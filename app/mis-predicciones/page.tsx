import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatARDateTimeShort } from "@/lib/dateUtils";
import Image from "next/image";
import { Target } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MisPrediccionesPage() {
  const { user } = await requireAuth();

  const rawPreds = await prisma.prediction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      match: {
        include: { homeTeam: true, awayTeam: true },
      },
    },
  });

  const totalPoints = rawPreds.reduce((s, p) => s + p.pointsEarned, 0);
  const exactResults = rawPreds.filter((p) => p.pointsEarned === 3).length;
  const correctOutcomes = rawPreds.filter((p) => p.pointsEarned === 1).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Target className="w-7 h-7 text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Mis predicciones</h1>
          <p className="text-white/50 text-sm">Tu historial completo</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card text-center">
          <div className="text-3xl font-bold text-gold-400">{totalPoints}</div>
          <div className="text-xs text-white/50 mt-1">Puntos</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-white">{rawPreds.length}</div>
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

      <div className="space-y-3">
        {rawPreds.map((pred) => {
          const match = pred.match;
          const isFinished = match.status === "finished";
          const isLive = match.status === "live";

          let pointsBadge = null;
          if (isFinished) {
            if (pred.pointsEarned === 3) pointsBadge = <span className="score-badge-exact">+3 ⭐</span>;
            else if (pred.pointsEarned === 1) pointsBadge = <span className="score-badge-correct">+1</span>;
            else pointsBadge = <span className="score-badge-wrong">0</span>;
          }

          return (
            <div key={pred.id} className={`card flex items-center gap-4 ${isFinished && pred.pointsEarned === 3 ? "border-gold-400/30" : ""}`}>
              <div className="hidden sm:block w-28 flex-shrink-0">
                <div className="text-xs text-white/40">{match.stage}</div>
                <div className="text-xs text-white/60 mt-0.5">
                  {formatARDateTimeShort(match.matchDate.toISOString())}
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center gap-3">
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <span className="text-white font-medium text-sm text-right">{match.homeTeam.nameEs}</span>
                  <Image
                    src={match.homeTeam.flagUrl || `https://flagcdn.com/w40/${match.homeTeam.countryCode}.png`}
                    alt={match.homeTeam.nameEs} width={28} height={20} className="rounded"
                  />
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {isFinished ? (
                    <div className="text-center">
                      <div className="text-white/40 text-[10px] mb-0.5">Real</div>
                      <div className="font-bold text-white bg-white/10 rounded px-2 py-0.5 text-sm">
                        {match.homeScore} - {match.awayScore}
                      </div>
                    </div>
                  ) : (
                    <div className="text-white/30 text-sm px-2">vs</div>
                  )}
                  <div className="text-white/30 mx-1">|</div>
                  <div className="text-center">
                    <div className="text-white/40 text-[10px] mb-0.5">Tuyo</div>
                    <div className={`font-bold rounded px-2 py-0.5 text-sm ${
                      !isFinished ? "text-white/80 bg-white/10" :
                      pred.pointsEarned === 3 ? "text-gold-400 bg-gold-400/10" :
                      pred.pointsEarned === 1 ? "text-blue-400 bg-blue-400/10" :
                      "text-red-400 bg-red-400/10"
                    }`}>
                      {pred.predictedHome} - {pred.predictedAway}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-1">
                  <Image
                    src={match.awayTeam.flagUrl || `https://flagcdn.com/w40/${match.awayTeam.countryCode}.png`}
                    alt={match.awayTeam.nameEs} width={28} height={20} className="rounded"
                  />
                  <span className="text-white font-medium text-sm">{match.awayTeam.nameEs}</span>
                </div>
              </div>

              <div className="w-12 text-right flex-shrink-0">
                {pointsBadge || (
                  <span className="text-xs text-white/30">{isLive ? "🔴 VIVO" : "Pend."}</span>
                )}
              </div>
            </div>
          );
        })}

        {rawPreds.length === 0 && (
          <div className="card text-center py-12">
            <Target className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">Todavía no hiciste ningún pronóstico</p>
            <Link href="/dashboard" className="btn-primary mt-4 inline-block text-sm">Ver partidos</Link>
          </div>
        )}
      </div>
    </div>
  );
}
