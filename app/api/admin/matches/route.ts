import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const body = await req.json();
  const { homeTeamId, awayTeamId, matchDate, stage, venue } = body;

  if (!homeTeamId || !awayTeamId || !matchDate) {
    return NextResponse.json({ error: "Faltan datos del partido" }, { status: 400 });
  }

  if (homeTeamId === awayTeamId) {
    return NextResponse.json({ error: "Los equipos deben ser distintos" }, { status: 400 });
  }

  const supabase = await createAdminSupabase();
  const { data, error } = await supabase
    .from("matches")
    .insert({
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      match_date: matchDate,
      stage: stage || "Fase de Grupos",
      venue: venue || null,
      status: "upcoming",
    })
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ match: data });
}
