import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    return NextResponse.json({ error: "API_FOOTBALL_KEY no está configurada" });
  }

  try {
    const res = await fetch(
      "https://v3.football.api-sports.io/fixtures?league=1&season=2026",
      {
        headers: { "x-apisports-key": key, Accept: "application/json" },
        next: { revalidate: 0 },
      }
    );

    const data = await res.json();

    return NextResponse.json({
      status: res.status,
      keyPresent: true,
      keyPrefix: key.slice(0, 6) + "...",
      errors: data.errors,
      resultsCount: Array.isArray(data.response) ? data.response.length : 0,
      firstFixture: Array.isArray(data.response) && data.response.length > 0
        ? {
            id: data.response[0].fixture.id,
            date: data.response[0].fixture.date,
            home: data.response[0].teams.home.name,
            away: data.response[0].teams.away.name,
            status: data.response[0].fixture.status.short,
          }
        : null,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) });
  }
}
