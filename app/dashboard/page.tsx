import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { es } from "date-fns/locale";
import MatchCard from "@/components/MatchCard";
import type { Match, Prediction } from "@/types";
import { CalendarDays } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function groupByDate(matches: Match[]): Record<string, Match[]> {
  return matches.reduce((acc, m) => {
    const d = m.matchDate.slice(0, 10);
    if (!acc[d]) acc[d] = [];
    acc[d].push(m);
    return acc;
  }, {} as Record<string, Match[]>);
}

function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  if (isToday(date)) return "Hoy";
  if (isTomorrow(date)) return "Mañana";
  return format(date, "EEEE d 'de' MMMM", { locale: es });
}

export default async function DashboardPage() {
  const { user } = await getSessionUser();

  const cutoff = addDays(new Date(), -1);

  const rawMatches = await prisma.match.findMany({
    where: { matchDate: { gte: cutoff } },
    orderBy: { matchDate: "asc" },
    take: 60,
    include: { homeTeam: true, awayTeam: true },
  });

  const matches: Match[] = rawMatches.map((m) => ({
    id: m.id,
    homeTeamId: m.homeTeamId,
    awayTeamId: m.awayTeamId,
    matchDate: m.matchDate.toISOString(),
    stage: m.stage,
    venue: m.venue,
    status: m.status as Match["status"],
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    fifaMatchId: m.fifaMatchId,
    homeTeam: { id: m.homeTeam.id, name: m.homeTeam.name, nameEs: m.homeTeam.nameEs, countryCode: m.homeTeam.countryCode, flagUrl: m.homeTeam.flagUrl, groupName: m.homeTeam.groupName },
    awayTeam: { id: m.awayTeam.id, name: m.awayTeam.name, nameEs: m.awayTeam.nameEs, countryCode: m.awayTeam.countryCode, flagUrl: m.awayTeam.flagUrl, groupName: m.awayTeam.groupName },
  }));

  let predsByMatch: Record<string, Prediction> = {};
  let userPreds: Prediction[] = [];

  if (user) {
    const rawPreds = await prisma.prediction.findMany({
      where: { userId: user.id, matchId: { in: matches.map((m) => m.id) } },
    });
    userPreds = rawPreds.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
    predsByMatch = userPreds.reduce((acc, p) => ({ ...acc, [p.matchId]: p }), {});
  }

  const grouped = groupByDate(matches);
  const sortedDates = Object.keys(grouped).sort();

  const exactCount = userPreds.filter((p) => p.pointsEarned === 3).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Próximos partidos</h1>
          <p className="text-white/50 text-sm mt-1">Hacé tu pronóstico antes de que empiece</p>
        </div>
        {user?.isAdmin && (
          <Link href="/admin" className="btn-ghost text-sm">Admin</Link>
        )}
      </div>

      {user && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center">
            <div className="text-3xl font-bold text-gold-400">{user.totalPoints}</div>
            <div className="text-xs text-white/50 mt-1">Puntos totales</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-white">{exactCount}</div>
            <div className="text-xs text-white/50 mt-1">Exactos ⭐</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-white">{userPreds.length}</div>
            <div className="text-xs text-white/50 mt-1">Predicciones</div>
          </div>
        </div>
      )}

      {sortedDates.length === 0 ? (
        <div className="card text-center py-12">
          <CalendarDays className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/50">No hay partidos programados</p>
          {user?.isAdmin && (
            <Link href="/admin" className="btn-primary mt-4 inline-block text-sm">Agregar partidos</Link>
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
                  prediction={predsByMatch[match.id] ?? null}
                  userId={user?.id ?? null}
                  canPredict={match.status === "upcoming" && new Date(match.matchDate) > new Date()}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
