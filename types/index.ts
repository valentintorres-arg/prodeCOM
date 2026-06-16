export type MatchStatus = "upcoming" | "live" | "finished";

export interface Team {
  id: string;
  name: string;
  nameEs: string;
  countryCode: string;
  flagUrl: string | null;
  groupName: string | null;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  matchDate: string;   // ISO string after JSON serialization
  stage: string;
  venue: string | null;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  fifaMatchId: string | null;
  homeTeam?: Team;
  awayTeam?: Team;
}

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  predictedHome: number;
  predictedAway: number;
  pointsEarned: number;
  createdAt: string;
  updatedAt: string;
  match?: Match & { homeTeam?: Team; awayTeam?: Team };
}

export interface User {
  id: string;
  username: string;
  email?: string;
  avatarUrl: string | null;
  totalPoints: number;
  isAdmin: boolean;
}

export interface LeaderboardUser extends User {
  rank: number;
  predictionsCount: number;
  exactResults: number;
}
