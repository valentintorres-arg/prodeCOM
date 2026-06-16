import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getSessionUser } from "@/lib/auth";
import { formatARDateTimeShort } from "@/lib/dateUtils";
import Image from "next/image";
import { History } from "lucide-react";
import type { Match, Team } from "@/types";

type MatchRow = Prisma.MatchGetPayload<{ include: { homeTeam: true; awayTeam: true } }>;

export const dynamic = "force-dynamic";

const STAGE_ORDER = [
  "Fase de Grupos",
  "16avos de Final",
  "Octavos de Final",
  "Cuartos de Final",
  "Semifinal",
  "Tercer Puesto",
  "Final",
];

function serialize(m: MatchRow): Match {
  const team = (t: MatchRow["homeTeam"]): Team => ({
    id: t.id, name: t.name, nameEs: t.nameEs,
    countryCode: t.countryCode, flagUrl: t.flagUrl, groupName: t.groupName,
  });
  return {
    id: m.id, homeTeamId: m.homeTeamId, awayTeamId: m.awayTeamId,
    matchDate: m.matchDate.toISOString(),
    stage: m.stage, venue: m.venue,
    status: m.status as Match["status"],
    homeScore: m.homeScore, awayScore: m.awayScore, fifaMatchId: m.fifaMatchId,
    homeTeam: team(m.homeTeam), awayTeam: team(m.awayTeam),
  };
}

export default async function HistorialPage() {
  const { user } = await getSessionUser();

  const raw = await prisma.match.findMany({
    where: { status: "finished" },
    include: { homeTeam: true, awayTeam: true },
    orderBy: [{ matchDate: "desc" }],
  });

  const matches = raw.map(serialize);

  // Group by stage
  const byStage = new Map<string, Match[]>();
  for (const m of matches) {
    if (!byStage.has(m.stage)) byStage.set(m.stage, []);
    byStage.get(m.stage)!.push(m);
  }

  const orderedStages = STAGE_ORDER.filter((s) => byStage.has(s));
  const otherStages = [...byStage.keys()].filter((s) => !STAGE_ORDER.includes(s));

  // User prediction lookup if logged in
  let userPredMap: Record<string, { predictedHome: number; predictedAway: number; pointsEarned: number }> = {};
  if (user) {
    const preds = await prisma.prediction.findMany({
      where: { userId: user.id, matchId: { in: matches.map((m) => m.id) } },
      select: { matchId: true, predictedHome: true, predictedAway: true, pointsEarned: true },
    });
    userPredMap = Object.fromEntries(preds.map((p) => [p.matchId, p]));
  }

  const allStages = [...orderedStages, ...otherStages];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <History className="w-7 h-7 text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Historial</h1>
          <p className="text-white/50 text-sm">{matches.length} partidos finalizados</p>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="card text-center py-16">
          <History className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/50">Todavía no hay partidos finalizados</p>
        </div>
      ) : (
        allStages.map((stage) => {
          const stageMatches = byStage.get(stage)!;
          return (
            <section key={stage}>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-navy-700 border border-white/10 rounded-lg px-3 py-1">
                  <span className="text-white/70 font-semibold text-sm">{stage}</span>
                </div>
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-white/30 text-xs">{stageMatches.length} partidos</span>
              </div>

              <div className="space-y-2">
                {stageMatches.map((match) => {
                  const ht = match.homeTeam!;
                  const at = match.awayTeam!;
                  const pred = userPredMap[match.id];
                  const homeWon = match.homeScore! > match.awayScore!;
                  const awayWon = match.awayScore! > match.homeScore!;

                  return (
                    <div key={match.id} className="card flex items-center gap-3 py-3">
                      {/* Date */}
                      <div className="hidden sm:block text-xs text-white/30 w-20 flex-shrink-0 text-right">
                        {formatARDateTimeShort(match.matchDate)}
                      </div>

                      {/* Home team */}
                      <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                        <span className={`text-sm font-semibold truncate ${homeWon ? "text-white" : "text-white/50"}`}>
                          {ht.nameEs}
                        </span>
                        <Image
                          src={ht.flagUrl || `https://flagcdn.com/w40/${ht.countryCode}.png`}
                          alt={ht.nameEs} width={26} height={18} className="rounded flex-shrink-0"
                          unoptimized
                        />
                      </div>

                      {/* Score */}
                      <div className="flex-shrink-0 text-center w-20">
                        <div className="bg-navy-800 rounded-lg px-3 py-1.5 inline-flex items-center gap-1.5">
                          <span className={`text-lg font-black leading-none ${homeWon ? "text-white" : "text-white/40"}`}>
                            {match.homeScore}
                          </span>
                          <span className="text-white/20 text-xs">-</span>
                          <span className={`text-lg font-black leading-none ${awayWon ? "text-white" : "text-white/40"}`}>
                            {match.awayScore}
                          </span>
                        </div>
                      </div>

                      {/* Away team */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Image
                          src={at.flagUrl || `https://flagcdn.com/w40/${at.countryCode}.png`}
                          alt={at.nameEs} width={26} height={18} className="rounded flex-shrink-0"
                          unoptimized
                        />
                        <span className={`text-sm font-semibold truncate ${awayWon ? "text-white" : "text-white/50"}`}>
                          {at.nameEs}
                        </span>
                      </div>

                      {/* User prediction badge */}
                      {pred && (
                        <div className={`flex-shrink-0 text-xs font-bold rounded-full px-2 py-0.5 ${
                          pred.pointsEarned === 3 ? "score-badge-exact" :
                          pred.pointsEarned === 1 ? "score-badge-correct" :
                          "score-badge-wrong"
                        }`}>
                          {pred.predictedHome}-{pred.predictedAway}
                          {pred.pointsEarned === 3 && " ⭐"}
                          {pred.pointsEarned > 0 && <span className="ml-1">+{pred.pointsEarned}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
