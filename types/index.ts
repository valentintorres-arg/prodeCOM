export type MatchStatus = "upcoming" | "live" | "finished";

export interface Team {
  id: string;
  name: string;
  name_es: string;
  country_code: string;
  flag_url: string | null;
  group_name: string | null;
}

export interface Match {
  id: string;
  home_team_id: string;
  away_team_id: string;
  match_date: string;
  stage: string;
  venue: string | null;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  fifa_match_id: string | null;
  home_team?: Team;
  away_team?: Team;
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  predicted_home: number;
  predicted_away: number;
  points_earned: number;
  created_at: string;
  updated_at: string;
  match?: Match;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  total_points: number;
  is_admin: boolean;
  created_at: string;
}

export interface MatchWithPrediction extends Match {
  user_prediction?: Prediction | null;
}

export interface LeaderboardEntry extends Profile {
  rank: number;
  predictions_count: number;
  exact_results: number;
}
