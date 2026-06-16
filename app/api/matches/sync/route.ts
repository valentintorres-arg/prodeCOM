import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchFIFAMatches } from "@/lib/fifa";
import { requireAdmin } from "@/lib/auth";

export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const fifaMatches = await fetchFIFAMatches();
  if (!fifaMatches) {
    return NextResponse.json(
      { error: "No se pudo conectar a la API de FIFA. Agregá los partidos manualmente." },
      { status: 502 }
    );
  }

  const teams = await prisma.team.findMany({ select: { id: true, name: true, nameEs: true } });
  const teamsByName: Record<string, string> = {};
  for (const t of teams) {
    teamsByName[t.name.toLowerCase()] = t.id;
    teamsByName[t.nameEs.toLowerCase()] = t.id;
  }

  let synced = 0;
  let skipped = 0;

  for (const fm of fifaMatches) {
    if (!fm.home_team_name || !fm.away_team_name) { skipped++; continue; }

    const homeTeamId = teamsByName[fm.home_team_name.toLowerCase()];
    const awayTeamId = teamsByName[fm.away_team_name.toLowerCase()];
    if (!homeTeamId || !awayTeamId) { skipped++; continue; }

    await prisma.match.upsert({
      where: { fifaMatchId: fm.fifa_match_id },
      update: {
        homeScore: fm.home_score,
        awayScore: fm.away_score,
        status: fm.status,
        matchDate: new Date(fm.match_date),
      },
      create: {
        fifaMatchId: fm.fifa_match_id,
        homeTeamId,
        awayTeamId,
        matchDate: new Date(fm.match_date),
        stage: fm.stage || "Fase de Grupos",
        venue: fm.venue || null,
        status: fm.status,
        homeScore: fm.home_score,
        awayScore: fm.away_score,
      },
    });
    synced++;
  }

  return NextResponse.json({ message: `${synced} partidos actualizados, ${skipped} omitidos`, synced, skipped });
}
