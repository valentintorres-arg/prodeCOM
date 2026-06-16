import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session-server";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { matchId, predictedHome, predictedAway } = await req.json();

  if (
    typeof predictedHome !== "number" ||
    typeof predictedAway !== "number" ||
    predictedHome < 0 ||
    predictedAway < 0
  ) {
    return NextResponse.json({ error: "Pronóstico inválido" }, { status: 400 });
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { id: true, matchDate: true, status: true },
  });

  if (!match) return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });

  if (match.status !== "upcoming" || match.matchDate <= new Date()) {
    return NextResponse.json({ error: "El partido ya empezó, no podés modificar tu pronóstico" }, { status: 400 });
  }

  const prediction = await prisma.prediction.upsert({
    where: { userId_matchId: { userId: session.sub, matchId } },
    create: { userId: session.sub, matchId, predictedHome, predictedAway },
    update: { predictedHome, predictedAway },
  });

  return NextResponse.json({ prediction });
}
