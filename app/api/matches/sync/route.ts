import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { fetchFDMatches } from "@/lib/football-data";
import { fetchAFMatches } from "@/lib/api-football";
import { requireAdmin } from "@/lib/auth";

// ── Team name aliases (English source names → our DB English name) ────────────
const ALIASES: Record<string, string> = {
  // football-data.org names
  "côte d'ivoire": "ivory coast",
  "cote d'ivoire": "ivory coast",
  "türkiye": "turkiye",
  "turkey": "turkiye",
  "czech republic": "czechia",
  "korea republic": "south korea",
  "republic of korea": "south korea",
  "dr congo": "dr congo",
  "democratic republic of congo": "dr congo",
  "congo dr": "dr congo",
  "curaçao": "curacao",
  "usa": "united states",
  "u.s.a.": "united states",
  "united states of america": "united states",
  "ir iran": "iran",
  "cape verde islands": "cape verde",
  "bosnia & herzegovina": "bosnia and herzegovina",
  "bosnia-herzegovina": "bosnia and herzegovina",
};

function norm(s: string | null | undefined): string {
  if (!s) return "";
  return s.normalize("NFC").trim().toLowerCase();
}

function lookupTeam(byName: Record<string, string>, name: string | null): string | undefined {
  if (!name) return undefined;
  const n = norm(name);
  if (byName[n]) return byName[n];
  const aliased = ALIASES[n];
  if (aliased && byName[aliased]) return byName[aliased];
  return undefined;
}

// ── Stage mapping for api-football.com rounds ────────────────────────────────
function mapAFRound(round: string | null): string {
  if (!round) return "Fase de Grupos";
  const r = round.toLowerCase();
  if (r.includes("group")) return "Fase de Grupos";
  if (r.includes("round of 32")) return "16avos de Final";
  if (r.includes("round of 16")) return "Octavos de Final";
  if (r.includes("quarter")) return "Cuartos de Final";
  if (r.includes("semi")) return "Semifinal";
  if (r.includes("3rd") || r.includes("third") || r.includes("place")) return "Tercer Puesto";
  if (r.includes("final")) return "Final";
  return round;
}

export async function POST(req: NextRequest) {
  // Allow cron calls via secret header, otherwise require admin cookie
  const cronSecret = process.env.CRON_SECRET;
  const isCron = cronSecret && req.headers.get("x-cron-secret") === cronSecret;

  if (!isCron) {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }
  }

  const teams = await prisma.team.findMany({ select: { id: true, name: true, nameEs: true } });
  const byName: Record<string, string> = {};
  for (const t of teams) {
    byName[norm(t.name)] = t.id;
    byName[norm(t.nameEs)] = t.id;
  }

  const failReasons: string[] = [];

  // ── 1. football-data.org (free, WC included) ─────────────────────────────
  const fdResult = await fetchFDMatches();
  if (fdResult.ok) {
    const result = await syncMatches(
      fdResult.matches.map((m) => ({
        externalId: `fd:${m.fixture_id}`,
        matchDate: m.match_date,
        homeName: m.home_team_name,
        awayName: m.away_team_name,
        homeScore: m.home_score,
        awayScore: m.away_score,
        status: m.status,
        stage: m.stage,
        venue: m.venue,
      })),
      byName
    );
    await recalcAllPoints();
    revalidateAll();
    return NextResponse.json({ ...result, source: "football-data.org" });
  }
  failReasons.push(`football-data.org: ${fdResult.reason}`);

  // ── 2. api-football.com (requires paid plan for 2026) ────────────────────
  const afResult = await fetchAFMatches();
  if (afResult.ok) {
    const result = await syncMatches(
      afResult.matches.map((m) => ({
        externalId: `af:${m.fixture_id}`,
        matchDate: m.match_date,
        homeName: m.home_team_name,
        awayName: m.away_team_name,
        homeScore: m.home_score,
        awayScore: m.away_score,
        status: m.status,
        stage: mapAFRound(m.round),
        venue: m.venue,
      })),
      byName
    );
    await recalcAllPoints();
    revalidateAll();
    return NextResponse.json({ ...result, source: "api-football.com" });
  }
  failReasons.push(`api-football.com: ${afResult.reason}`);

  return NextResponse.json(
    {
      error: "No se pudo conectar a ninguna fuente de datos.",
      reasons: failReasons,
      message: failReasons.join(" | "),
    },
    { status: 502 }
  );
}

// ── Shared sync logic ─────────────────────────────────────────────────────────

interface NormalizedMatch {
  externalId: string;
  matchDate: string;
  homeName: string | null;
  awayName: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: "upcoming" | "live" | "finished";
  stage: string;
  venue: string | null;
}

async function syncMatches(
  matches: NormalizedMatch[],
  byName: Record<string, string>
) {
  let synced = 0;
  let skipped = 0;
  const debugSkipped: string[] = [];

  for (const m of matches) {
    const homeTeamId = lookupTeam(byName, m.homeName);
    const awayTeamId = lookupTeam(byName, m.awayName);

    if (!homeTeamId || !awayTeamId) {
      skipped++;
      if (debugSkipped.length < 20) {
        debugSkipped.push(
          `"${m.homeName ?? "TBD"}"${!homeTeamId ? "[?]" : ""} vs "${m.awayName ?? "TBD"}"${!awayTeamId ? "[?]" : ""}`
        );
      }
      continue;
    }

    const dateObj = new Date(m.matchDate);

    // Find existing: by externalId OR by team pair within 24h window
    const existing = await prisma.match.findFirst({
      where: {
        OR: [
          { fifaMatchId: m.externalId },
          {
            homeTeamId,
            awayTeamId,
            matchDate: {
              gte: new Date(dateObj.getTime() - 86400 * 1000),
              lte: new Date(dateObj.getTime() + 86400 * 1000),
            },
          },
        ],
      },
    });

    if (existing) {
      await prisma.match.update({
        where: { id: existing.id },
        data: {
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          status: m.status,
          matchDate: dateObj,
          stage: m.stage,
          ...(m.venue ? { venue: m.venue } : {}),
          fifaMatchId: existing.fifaMatchId ?? m.externalId,
        },
      });
    } else {
      await prisma.match.create({
        data: {
          fifaMatchId: m.externalId,
          homeTeamId,
          awayTeamId,
          matchDate: dateObj,
          stage: m.stage,
          venue: m.venue,
          status: m.status,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
        },
      });
    }
    synced++;
  }

  const message = `${synced} partidos actualizados, ${skipped} omitidos`;
  return { message, synced, skipped, debugSkipped };
}

// ── Points recalculation ──────────────────────────────────────────────────────

async function recalcAllPoints() {
  const finished = await prisma.match.findMany({
    where: { status: "finished", homeScore: { not: null }, awayScore: { not: null } },
    include: { predictions: true },
  });

  for (const match of finished) {
    const ah = match.homeScore!;
    const aa = match.awayScore!;
    await Promise.all(
      match.predictions.map((p) => {
        const pts = calcPoints(p.predictedHome, p.predictedAway, ah, aa);
        if (pts !== p.pointsEarned) {
          return prisma.prediction.update({ where: { id: p.id }, data: { pointsEarned: pts } });
        }
      })
    );
  }

  const users = await prisma.user.findMany({ select: { id: true } });
  await Promise.all(
    users.map(async (u) => {
      const agg = await prisma.prediction.aggregate({
        where: { userId: u.id },
        _sum: { pointsEarned: true },
      });
      return prisma.user.update({
        where: { id: u.id },
        data: { totalPoints: agg._sum.pointsEarned ?? 0 },
      });
    })
  );
}

function calcPoints(ph: number, pa: number, ah: number, aa: number): number {
  if (ph === ah && pa === aa) return 3;
  const pred = ph > pa ? "home" : ph < pa ? "away" : "draw";
  const real = ah > aa ? "home" : ah < aa ? "away" : "draw";
  return pred === real ? 1 : 0;
}

function revalidateAll() {
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  revalidatePath("/historial");
  revalidatePath("/mis-predicciones");
  revalidatePath("/admin");
}
