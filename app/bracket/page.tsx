import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import BracketView from "@/components/BracketView";
import { GitBranch } from "lucide-react";
import type { Match, Team } from "@/types";

type MatchRow = Prisma.MatchGetPayload<{ include: { homeTeam: true; awayTeam: true } }>;

export const dynamic = "force-dynamic";

const KNOCKOUT_STAGES = [
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

export default async function BracketPage() {
  const raw = await prisma.match.findMany({
    where: { stage: { in: KNOCKOUT_STAGES } },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { matchDate: "asc" },
  });

  const all = raw.map(serialize);

  const matchesByStage: Partial<Record<string, Match[]>> = {};
  for (const m of all) {
    if (!matchesByStage[m.stage]) matchesByStage[m.stage] = [];
    matchesByStage[m.stage]!.push(m);
  }

  const thirdPlace = matchesByStage["Tercer Puesto"]?.[0];

  const totalMatches = all.length;
  const finished = all.filter((m) => m.status === "finished").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <GitBranch className="w-7 h-7 text-gold-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Eliminatoria</h1>
            <p className="text-white/50 text-sm">Cuadro desde 16avos hasta la Final</p>
          </div>
        </div>
        {totalMatches > 0 && (
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-white">{finished}/{totalMatches}</div>
              <div className="text-white/40 text-xs">Jugados</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gold-400">{totalMatches - finished}</div>
              <div className="text-white/40 text-xs">Pendientes</div>
            </div>
          </div>
        )}
      </div>

      {totalMatches === 0 ? (
        <div className="card text-center py-16">
          <GitBranch className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/50 font-medium">La eliminatoria aún no comenzó</p>
          <p className="text-white/30 text-sm mt-1">
            El admin irá cargando los partidos a medida que avance el torneo
          </p>
        </div>
      ) : (
        <div className="card p-4 sm:p-6">
          <p className="text-white/30 text-xs mb-4 sm:hidden">
            ← Deslizá para ver el cuadro completo
          </p>
          <BracketView matchesByStage={matchesByStage} thirdPlace={thirdPlace} />
        </div>
      )}
    </div>
  );
}
