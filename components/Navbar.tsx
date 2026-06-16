"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trophy, LayoutDashboard, Medal, Target, LogOut, Settings } from "lucide-react";
import { useEffect, useState } from "react";

interface Profile {
  username: string;
  total_points: number;
  is_admin: boolean;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("username, total_points, is_admin")
        .eq("id", user.id)
        .single();
      if (data) setProfile(data);
    });
  }, [pathname]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const isAuthPage = pathname === "/login" || pathname === "/register";
  if (isAuthPage) return null;

  const navLinks = [
    { href: "/dashboard", label: "Partidos", icon: LayoutDashboard },
    { href: "/leaderboard", label: "Tabla", icon: Medal },
    { href: "/mis-predicciones", label: "Mis pronósticos", icon: Target },
  ];

  return (
    <nav className="border-b border-white/10 bg-navy-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold-400" />
            <span className="font-bold text-white">Prode COM</span>
            <span className="text-white/30 text-xs">Mundial 2026</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === href
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            {profile?.is_admin && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/admin"
                    ? "bg-amber-600/20 text-amber-400"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          {/* User menu */}
          {profile && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 hover:bg-white/10 rounded-lg px-2 py-1.5 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600/40 flex items-center justify-center text-xs font-bold text-blue-300">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-right">
                  <div className="text-xs text-white font-medium">{profile.username}</div>
                  <div className="text-xs text-gold-400 font-bold">{profile.total_points} pts</div>
                </div>
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-navy-700 border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
                    {/* Mobile nav links */}
                    <div className="sm:hidden border-b border-white/10">
                      {navLinks.map(({ href, label, icon: Icon }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10"
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </Link>
                      ))}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
