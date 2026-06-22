const BASE_URL = "https://api.football-data.org/v4";

const LIVE_STATUSES = new Set(["IN_PLAY", "PAUSED", "LIVE"]);
const FINISHED_STATUSES = new Set(["FINISHED"]);

function getStatus(status: string): "upcoming" | "live" | "finished" {
  if (FINISHED_STATUSES.has(status)) return "finished";
  if (LIVE_STATUSES.has(status)) return "live";
  return "upcoming";
}

function mapStage(stage: string): string {
  switch (stage) {
    case "GROUP_STAGE":    return "Fase de Grupos";
    case "LAST_32":        return "16avos de Final";
    case "LAST_16":        return "Octavos de Final";
    case "QUARTER_FINALS": return "Cuartos de Final";
    case "SEMI_FINALS":    return "Semifinal";
    case "THIRD_PLACE":    return "Tercer Puesto";
    case "FINAL":          return "Final";
    default:               return stage;
  }
}

export interface FDMatchData {
  fixture_id: number;
  match_date: string;
  home_team_name: string | null;
  away_team_name: string | null;
  home_score: number | null;
  away_score: number | null;
  status: "upcoming" | "live" | "finished";
  stage: string;
  venue: string | null;
}

export type FDResult =
  | { ok: true; matches: FDMatchData[] }
  | { ok: false; reason: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseMatches(items: any[]): FDMatchData[] {
  return items.map((m) => ({
    fixture_id: m.id,
    match_date: m.utcDate,
    home_team_name: m.homeTeam?.name ?? null,
    away_team_name: m.awayTeam?.name ?? null,
    home_score: m.score?.fullTime?.home ?? null,
    away_score: m.score?.fullTime?.away ?? null,
    status: getStatus(m.status ?? ""),
    stage: mapStage(m.stage ?? ""),
    venue: m.venue ?? null,
  }));
}

export async function fetchFDMatches(): Promise<FDResult> {
  const token = process.env.FOOTBALL_DATA_KEY;
  if (!token) {
    return { ok: false, reason: "FOOTBALL_DATA_KEY no está configurada" };
  }

  const headers = { "X-Auth-Token": token, Accept: "application/json" };

  // GET /v4/matches — full WC2026 tournament window
  const urls = [
    `${BASE_URL}/matches?competitions=WC&dateFrom=2026-06-01&dateTo=2026-07-31`,
    `${BASE_URL}/competitions/WC/matches`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers, next: { revalidate: 0 } });

      if (!res.ok) continue;

      const data = await res.json();
      const items: unknown[] = data.matches ?? [];

      if (Array.isArray(items) && items.length > 0) {
        return { ok: true, matches: parseMatches(items) };
      }
    } catch {
      continue;
    }
  }

  return {
    ok: false,
    reason: "football-data no devolvió partidos. Verificá que el token sea válido y que el plan incluya WC.",
  };
}
