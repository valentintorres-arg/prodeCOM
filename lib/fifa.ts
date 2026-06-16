const FIFA_API = "https://api.fifa.com/api/v3";
const COMPETITION_ID = "17";
const SEASON_ID = "285023"; // WC2026

interface FIFATeam {
  IdTeam: string;
  IdCountry: string;
  TeamName: { Locale: string; Description: string }[];
  ShortClubName: string;
  Abbreviation: string;
}

interface FIFAMatch {
  IdMatch: string;
  Date: string;
  HomeTeam: FIFATeam | null;
  AwayTeam: FIFATeam | null;
  HomeTeamScore: number | null;
  AwayTeamScore: number | null;
  MatchStatus: number;
  StageName: { Locale: string; Description: string }[];
  Stadium: { Name: { Locale: string; Description: string }[] } | null;
  IdStage: string;
  GroupName: { Locale: string; Description: string }[] | null;
  Period: number;
}

function getStatus(m: FIFAMatch): "upcoming" | "live" | "finished" {
  if (m.Period === 10) return "finished";
  if (m.Period > 0 && m.Period < 10) return "live";
  return "upcoming";
}

function getTeamName(team: FIFATeam | null, lang: string): string | null {
  if (!team) return null;
  const found = team.TeamName?.find((n) => n.Locale === lang);
  return found?.Description || team.ShortClubName || null;
}

export interface FIFAMatchData {
  fifa_match_id: string;
  match_date: string;
  home_team_name_es: string | null;
  home_team_name_en: string | null;
  away_team_name_es: string | null;
  away_team_name_en: string | null;
  home_country_code: string | null; // 3-letter FIFA code e.g. "MEX"
  away_country_code: string | null;
  home_score: number | null;
  away_score: number | null;
  status: "upcoming" | "live" | "finished";
  stage: string | null;
  venue: string | null;
}

export async function fetchFIFAMatches(): Promise<FIFAMatchData[] | null> {
  const urls = [
    `${FIFA_API}/calendar/matches?idCompetition=${COMPETITION_ID}&idSeason=${SEASON_ID}&count=500&language=es-ES`,
    `${FIFA_API}/calendar/matches?idCompetition=${COMPETITION_ID}&idSeason=${SEASON_ID}&count=500`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 0 },
      });
      if (!res.ok) continue;

      const data = await res.json();
      const results: FIFAMatch[] = data.Results ?? [];
      if (results.length === 0) continue;

      return results.map((m) => ({
        fifa_match_id: m.IdMatch,
        match_date: m.Date,
        home_team_name_es: getTeamName(m.HomeTeam, "es-ES"),
        home_team_name_en: m.HomeTeam?.ShortClubName ?? null,
        away_team_name_es: getTeamName(m.AwayTeam, "es-ES"),
        away_team_name_en: m.AwayTeam?.ShortClubName ?? null,
        home_country_code: m.HomeTeam?.IdCountry ?? null,
        away_country_code: m.AwayTeam?.IdCountry ?? null,
        home_score: m.HomeTeamScore,
        away_score: m.AwayTeamScore,
        status: getStatus(m),
        stage: m.StageName?.find((s) => s.Locale === "es-ES")?.Description
          ?? m.StageName?.[0]?.Description
          ?? null,
        venue: m.Stadium?.Name?.find((n) => n.Locale === "es-ES")?.Description
          ?? m.Stadium?.Name?.[0]?.Description
          ?? null,
      }));
    } catch {
      continue;
    }
  }
  return null;
}
