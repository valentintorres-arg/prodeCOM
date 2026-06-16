"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: identifier.trim(), password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error al iniciar sesión");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-400/20 rounded-full mb-4 border-2 border-gold-400/50">
            <Trophy className="w-8 h-8 text-gold-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Prode COM</h1>
          <p className="text-white/50 mt-1">Mundial 2026 🌎</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-white mb-6">Iniciar sesión</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-1.5">Usuario o email</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="tu_usuario o tu@email.com"
                className="input-field"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  required
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-gold w-full mt-2">
              {loading ? "Entrando..." : "Entrar al prode"}
            </button>
          </form>

          <p className="text-center text-white/50 text-sm mt-6">
            ¿No tenés cuenta?{" "}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">Registrate acá</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
