import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { parseISO, isBefore } from "date-fns";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { matchId, predictedHome, predictedAway } = await req.json();

  if (
    typeof predictedHome !== "number" ||
    typeof predictedAway !== "number" ||
    predictedHome < 0 ||
    predictedAway < 0
  ) {
    return NextResponse.json({ error: "Pronóstico inválido" }, { status: 400 });
  }

  // Verify the match exists and hasn't started
  const { data: match } = await supabase
    .from("matches")
    .select("id, match_date, status")
    .eq("id", matchId)
    .single();

  if (!match) return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });

  if (match.status !== "upcoming" || !isBefore(new Date(), parseISO(match.match_date))) {
    return NextResponse.json({ error: "El partido ya empezó, no podés modificar tu pronóstico" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("predictions")
    .upsert(
      {
        user_id: user.id,
        match_id: matchId,
        predicted_home: predictedHome,
        predicted_away: predictedAway,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,match_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ prediction: data });
}
