import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminPanel from "@/components/AdminPanel";
import type { Match, Team } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { user } = await getSessionUser();
  if (!user?.isAdmin) redirect("/dashboard");

  const [rawMatches, rawTeams] = await Promise.all([
    prisma.match.findMany({
      orderBy: { matchDate: "asc" },
      take: 200,
      include: { homeTeam: true, awayTeam: true },
    }),
    prisma.team.findMany({ orderBy: [{ groupName: "asc" }, { name: "asc" }] }),
  ]);

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

  const teams: Team[] = rawTeams.map((t) => ({
    id: t.id,
    name: t.name,
    nameEs: t.nameEs,
    countryCode: t.countryCode,
    flagUrl: t.flagUrl,
    groupName: t.groupName,
  }));

  return <AdminPanel matches={matches} teams={teams} />;
}
