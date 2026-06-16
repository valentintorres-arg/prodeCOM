// FIFA World Cup 2026 - Competition and Season IDs
const FIFA_API = "https://api.fifa.com/api/v3";
const COMPETITION_ID = "17";
const SEASON_ID = "285023"; // WC2026

interface FIFAMatch {
  IdMatch: string;
  Date: string;
  HomeTeam: { IdTeam: string; TeamName: { Description: string }[] } | null;
  AwayTeam: { IdTeam: string; TeamName: { Description: string }[] } | null;
  HomeTeamScore: number | null;
  AwayTeamScore: number | null;
  MatchStatus: number; // 0=upcoming, 3=live, 0=finished(different field)
  StageName: { Description: string }[];
  Stadium: { Name: { Description: string }[] } | null;
  IdStage: string;
  GroupName: { Description: string }[] | null;
  Period: number;
}

function getFIFAMatchStatus(match: FIFAMatch): "upcoming" | "live" | "finished" {
  if (match.Period === 10) return "finished";
  if (match.Period > 0 && match.Period < 10) return "live";
  return "upcoming";
}

export async function fetchFIFAMatches() {
  const endpoints = [
    `${FIFA_API}/calendar/matches?idCompetition=${COMPETITION_ID}&idSeason=${SEASON_ID}&count=500&language=es-ES`,
    `${FIFA_API}/calendar/matches?idCompetition=${COMPETITION_ID}&idSeason=${SEASON_ID}&count=500`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 1800 },
      });
      if (!res.ok) continue;
      const data = await res.json();
      const results: FIFAMatch[] = data.Results || [];
      return results.map((m) => ({
        fifa_match_id: m.IdMatch,
        match_date: m.Date,
        home_team_name: m.HomeTeam?.TeamName?.[0]?.Description || null,
        away_team_name: m.AwayTeam?.TeamName?.[0]?.Description || null,
        home_score: m.HomeTeamScore,
        away_score: m.AwayTeamScore,
        status: getFIFAMatchStatus(m),
        stage: m.StageName?.[0]?.Description || "Fase de Grupos",
        venue: m.Stadium?.Name?.[0]?.Description || null,
        group_name: m.GroupName?.[0]?.Description || null,
      }));
    } catch {
      continue;
    }
  }
  return null;
}

export async function fetchFIFATeams() {
  try {
    const res = await fetch(
      `${FIFA_API}/teams?idCompetition=${COMPETITION_ID}&idSeason=${SEASON_ID}&count=100`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 86400 },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.Results || null;
  } catch {
    return null;
  }
}
