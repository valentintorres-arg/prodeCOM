const BASE_URL = "https://v3.football.api-sports.io";
const WORLD_CUP_LEAGUE_ID = 1;
const SEASON = 2026;

const LIVE_STATUSES = new Set([
  "1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT", "LIVE",
]);
const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);

function getStatus(short: string): "upcoming" | "live" | "finished" {
  if (FINISHED_STATUSES.has(short)) return "finished";
  if (LIVE_STATUSES.has(short)) return "live";
  return "upcoming";
}

export interface AFMatchData {
  fixture_id: number;
  match_date: string;
  home_team_name: string;
  away_team_name: string;
  home_score: number | null;
  away_score: number | null;
  status: "upcoming" | "live" | "finished";
  round: string | null;
  venue: string | null;
}

export type AFResult =
  | { ok: true; matches: AFMatchData[] }
  | { ok: false; reason: string };

export async function fetchAFMatches(): Promise<AFResult> {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return { ok: false, reason: "API_FOOTBALL_KEY no está configurada en .env.local" };
  }

  try {
    const res = await fetch(
      `${BASE_URL}/fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=${SEASON}`,
      {
        headers: {
          "x-apisports-key": apiKey,
          Accept: "application/json",
        },
        next: { revalidate: 0 },
      }
    );

    if (!res.ok) {
      return { ok: false, reason: `api-football respondió ${res.status} ${res.statusText}` };
    }

    const data = await res.json();

    if (data.errors && Object.keys(data.errors).length > 0) {
      return { ok: false, reason: `api-football error: ${JSON.stringify(data.errors)}` };
    }

    if (!Array.isArray(data.response) || data.response.length === 0) {
      return { ok: false, reason: `api-football devolvió 0 fixtures para liga=${WORLD_CUP_LEAGUE_ID} temporada=${SEASON}` };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matches: AFMatchData[] = data.response.map((item: any) => ({
      fixture_id: item.fixture.id,
      match_date: item.fixture.date,
      home_team_name: item.teams.home.name as string,
      away_team_name: item.teams.away.name as string,
      home_score: item.goals.home as number | null,
      away_score: item.goals.away as number | null,
      status: getStatus(item.fixture.status.short as string),
      round: (item.league.round as string) ?? null,
      venue: (item.fixture.venue?.name as string) ?? null,
    }));

    return { ok: true, matches };
  } catch (err) {
    return { ok: false, reason: `fetch falló: ${String(err)}` };
  }
}
