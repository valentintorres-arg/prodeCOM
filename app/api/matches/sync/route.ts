import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/server";
import { fetchFIFAMatches } from "@/lib/fifa";
import { requireAdmin } from "@/lib/auth";

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

  const supabase = await createAdminSupabase();

  // Get all teams to map names to IDs
  const { data: teams } = await supabase.from("teams").select("*");
  const teamsByName = (teams || []).reduce((acc, t) => {
    acc[t.name.toLowerCase()] = t;
    acc[t.name_es.toLowerCase()] = t;
    return acc;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, {} as Record<string, any>);

  let synced = 0;
  let skipped = 0;

  for (const fm of fifaMatches) {
    if (!fm.home_team_name || !fm.away_team_name) { skipped++; continue; }

    const homeTeam = teamsByName[fm.home_team_name.toLowerCase()];
    const awayTeam = teamsByName[fm.away_team_name.toLowerCase()];

    if (!homeTeam || !awayTeam) { skipped++; continue; }

    await supabase
      .from("matches")
      .upsert(
        {
          fifa_match_id: fm.fifa_match_id,
          home_team_id: homeTeam.id,
          away_team_id: awayTeam.id,
          match_date: fm.match_date,
          stage: fm.stage || "Fase de Grupos",
          venue: fm.venue,
          status: fm.status,
          home_score: fm.home_score,
          away_score: fm.away_score,
        },
        { onConflict: "fifa_match_id" }
      );
    synced++;
  }

  return NextResponse.json({
    message: `Sincronización completada: ${synced} partidos actualizados, ${skipped} omitidos`,
    synced,
    skipped,
  });
}
