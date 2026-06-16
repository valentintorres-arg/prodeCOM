"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Medal, Target } from "lucide-react";

const tabs = [
  { href: "/dashboard", label: "Partidos", icon: LayoutDashboard },
  { href: "/leaderboard", label: "Tabla", icon: Medal },
  { href: "/mis-predicciones", label: "Mis pred.", icon: Target },
];

export default function BottomNav() {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  if (isAuthPage) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 sm:hidden bg-navy-900/95 backdrop-blur-md border-t border-white/10">
      <div className="flex" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                active ? "text-blue-400" : "text-white/40"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-blue-400" : "text-white/30"}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
