import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const { homeTeamId, awayTeamId, matchDate, stage, venue, homeScore, awayScore, alreadyPlayed } = await req.json();

  if (!homeTeamId || !awayTeamId || !matchDate) {
    return NextResponse.json({ error: "Faltan datos del partido" }, { status: 400 });
  }
  if (homeTeamId === awayTeamId) {
    return NextResponse.json({ error: "Los equipos deben ser distintos" }, { status: 400 });
  }

  const isFinished = alreadyPlayed && typeof homeScore === "number" && typeof awayScore === "number";

  const match = await prisma.match.create({
    data: {
      homeTeamId,
      awayTeamId,
      matchDate: new Date(matchDate),
      stage: stage || "Fase de Grupos",
      venue: venue || null,
      status: isFinished ? "finished" : "upcoming",
      homeScore: isFinished ? homeScore : null,
      awayScore: isFinished ? awayScore : null,
    },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return NextResponse.json({ match });
}
