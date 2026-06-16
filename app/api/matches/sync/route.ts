import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchFIFAMatches } from "@/lib/fifa";
import { requireAdmin } from "@/lib/auth";

// FIFA Spanish name → our DB Spanish name (nameEs)
const FIFA_ES_ALIASES: Record<string, string> = {
  "república de corea": "corea del sur",
  "chequia": "república checa",
  "ee. uu.": "estados unidos",
  "estados unidos de america": "estados unidos",
  "islas de cabo verde": "cabo verde",
  "arabia saudí": "arabia saudita",
  "ri de irán": "irán",
  "irak": "iraq",
  "rd congo": "rep. dem. del congo",
  "república democrática del congo": "rep. dem. del congo",
  "turquía": "türkiye",
  "nueva zelanda": "nueva zelanda",
  "costa de marfil": "costa de marfil",
  "curazao": "curazao",
};

// FIFA English ShortClubName → our DB English name
const FIFA_EN_ALIASES: Record<string, string> = {
  "korea republic": "south korea",
  "republic of korea": "south korea",
  "czech republic": "czechia",
  "usa": "united states",
  "u.s.a.": "united states",
  "united states of america": "united states",
  "cape verde islands": "cape verde",
  "saudi arabia": "saudi arabia",
  "ir iran": "iran",
  "dr congo": "dr congo",
  "congo dr": "dr congo",
  "cote d'ivoire": "ivory coast",
  "côte d'ivoire": "ivory coast",
  "new zealand": "new zealand",
};

// Normalize: NFC, trim, lowercase
function norm(s: string | null | undefined): string {
  if (!s) return "";
  return s.normalize("NFC").trim().toLowerCase();
}

function resolve(raw: string | null | undefined, aliases: Record<string, string>): string {
  const n = norm(raw);
  return aliases[n] ?? n;
}

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

  // Build lookup map (NFC-normalized lowercase → id)
  const byName: Record<string, string> = {};
  for (const t of teams) {
    byName[norm(t.name)] = t.id;
    byName[norm(t.nameEs)] = t.id;
  }

  let synced = 0;
  let skipped = 0;
  const debugSkipped: string[] = [];

  function lookupTeam(nameEs: string | null, nameEn: string | null): string | undefined {
    // Try Spanish (with alias)
    const esKey = resolve(nameEs, FIFA_ES_ALIASES);
    if (esKey && byName[esKey]) return byName[esKey];

    // Try English (with alias)
    const enKey = resolve(nameEn, FIFA_EN_ALIASES);
    if (enKey && byName[enKey]) return byName[enKey];

    // Try raw Spanish and English without alias
    const esRaw = norm(nameEs);
    if (esRaw && byName[esRaw]) return byName[esRaw];
    const enRaw = norm(nameEn);
    if (enRaw && byName[enRaw]) return byName[enRaw];

    return undefined;
  }

  for (const fm of fifaMatches) {
    const homeTeamId = lookupTeam(fm.home_team_name_es, fm.home_team_name_en);
    const awayTeamId = lookupTeam(fm.away_team_name_es, fm.away_team_name_en);

    if (!homeTeamId || !awayTeamId) {
      skipped++;
      if (debugSkipped.length < 20) {
        debugSkipped.push(
          `home="${fm.home_team_name_es ?? "?"}"(en="${fm.home_team_name_en ?? "?"}") ` +
          `vs away="${fm.away_team_name_es ?? "?"}"(en="${fm.away_team_name_en ?? "?"}")` +
          (!homeTeamId ? " [home not found]" : "") +
          (!awayTeamId ? " [away not found]" : "")
        );
      }
      continue;
    }

    await prisma.match.upsert({
      where: { fifaMatchId: fm.fifa_match_id },
      update: {
        homeScore: fm.home_score,
        awayScore: fm.away_score,
        status: fm.status,
        matchDate: new Date(fm.match_date),
        stage: mapStage(fm.stage),
        venue: fm.venue ?? undefined,
      },
      create: {
        fifaMatchId: fm.fifa_match_id,
        homeTeamId,
        awayTeamId,
        matchDate: new Date(fm.match_date),
        stage: mapStage(fm.stage),
        venue: fm.venue ?? null,
        status: fm.status,
        homeScore: fm.home_score,
        awayScore: fm.away_score,
      },
    });
    synced++;
  }

  return NextResponse.json({
    message: `${synced} partidos actualizados, ${skipped} omitidos`,
    synced,
    skipped,
    debugSkipped,
  });
}

// Map FIFA Spanish stage names → our stage strings
function mapStage(stage: string | null): string {
  if (!stage) return "Fase de Grupos";
  const s = norm(stage);
  if (s.includes("grupo") || s.includes("fase de grupo")) return "Fase de Grupos";
  if (s.includes("dieciseisavo") || s.includes("ronda de 32") || s.includes("16avos")) return "16avos de Final";
  if (s.includes("octavo") || s.includes("ronda de 16")) return "Octavos de Final";
  if (s.includes("cuarto")) return "Cuartos de Final";
  if (s.includes("semi")) return "Semifinal";
  if (s.includes("tercer") || s.includes("bronce") || s.includes("3er")) return "Tercer Puesto";
  if (s.includes("final")) return "Final";
  return stage;
}
