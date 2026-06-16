import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import AdminPanel from "@/components/AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { profile } = await getSessionUser();
  if (!profile?.is_admin) redirect("/dashboard");

  const supabase = await createServerSupabase();

  const [{ data: matches }, { data: teams }] = await Promise.all([
    supabase
      .from("matches")
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*)
      `)
      .order("match_date", { ascending: true })
      .limit(200),
    supabase.from("teams").select("*").order("group_name").order("name"),
  ]);

  return <AdminPanel matches={matches || []} teams={teams || []} />;
}
