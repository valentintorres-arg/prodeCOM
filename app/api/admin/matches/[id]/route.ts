import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): number {
  if (predictedHome === actualHome && predictedAway === actualAway) return 3;
  const predOutcome = predictedHome > predictedAway ? "home" : predictedHome < predictedAway ? "away" : "draw";
  const realOutcome = actualHome > actualAway ? "home" : actualHome < actualAway ? "away" : "draw";
  return predOutcome === realOutcome ? 1 : 0;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const { id } = await params;
  const { homeScore, awayScore, status } = await req.json();

  if (typeof homeScore !== "number" || typeof awayScore !== "number" || homeScore < 0 || awayScore < 0) {
    return NextResponse.json({ error: "Resultado inválido" }, { status: 400 });
  }

  const matchStatus = status ?? "finished";

  // Transaction: update match + calculate all points + update user totals
  const match = await prisma.$transaction(async (tx) => {
    const updated = await tx.match.update({
      where: { id },
      data: { homeScore, awayScore, status: matchStatus },
    });

    if (matchStatus === "finished") {
      const predictions = await tx.prediction.findMany({ where: { matchId: id } });

      // Update each prediction's points
      await Promise.all(
        predictions.map((p) =>
          tx.prediction.update({
            where: { id: p.id },
            data: { pointsEarned: calculatePoints(p.predictedHome, p.predictedAway, homeScore, awayScore) },
          })
        )
      );

      // Recalculate total points for each affected user
      const userIds = [...new Set(predictions.map((p) => p.userId))];
      await Promise.all(
        userIds.map(async (userId) => {
          const agg = await tx.prediction.aggregate({
            where: { userId },
            _sum: { pointsEarned: true },
          });
          return tx.user.update({
            where: { id: userId },
            data: { totalPoints: agg._sum.pointsEarned ?? 0 },
          });
        })
      );
    }

    return updated;
  });

  return NextResponse.json({ match });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.match.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
