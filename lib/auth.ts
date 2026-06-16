import { createServerSupabase } from "./supabase/server";
import type { Profile } from "@/types";

export async function getSessionUser(): Promise<{
  user: { id: string; email: string } | null;
  profile: Profile | null;
}> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user: { id: user.id, email: user.email! }, profile };
}

export async function requireAuth() {
  const { user, profile } = await getSessionUser();
  if (!user) throw new Error("No autenticado");
  return { user, profile };
}

export async function requireAdmin() {
  const { user, profile } = await getSessionUser();
  if (!user || !profile?.is_admin) throw new Error("Sin permisos de administrador");
  return { user, profile };
}
