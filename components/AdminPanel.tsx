"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import type { Match, Team } from "@/types";
import { Plus, RefreshCw, Save, Trash2, AlertCircle, History, GitBranch } from "lucide-react";

interface Props {
  matches: Match[];
  teams: Team[];
}

export default function AdminPanel({ matches: initialMatches, teams }: Props) {
  const router = useRouter();
  const [matches, setMatches] = useState(initialMatches);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [stage, setStage] = useState("Fase de Grupos");
  const [venue, setVenue] = useState("");
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [createHomeScore, setCreateHomeScore] = useState(0);
  const [createAwayScore, setCreateAwayScore] = useState(0);
  const [creating, setCreating] = useState(false);

  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [editHome, setEditHome] = useState(0);
  const [editAway, setEditAway] = useState(0);
  const [editStatus, setEditStatus] = useState<"live" | "finished">("finished");
  const [saving, setSaving] = useState(false);

  async function handleSync() {
    setSyncing(true);
    setSyncMsg("");
    const res = await fetch("/api/matches/sync", { method: "POST" });
    const data = await res.json();
    setSyncMsg(res.ok ? data.message : `Error: ${data.error}`);
    setSyncing(false);
    if (res.ok) router.refresh();
  }

  async function handleCreateMatch(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/admin/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homeTeamId, awayTeamId, matchDate, stage, venue,
        alreadyPlayed,
        homeScore: alreadyPlayed ? createHomeScore : undefined,
        awayScore: alreadyPlayed ? createAwayScore : undefined,
      }),
    });
    if (res.ok) {
      const { match } = await res.json();
      setMatches((prev) =>
        [...prev, { ...match, matchDate: match.matchDate }].sort(
          (a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()
        )
      );
      setShowCreateForm(false);
      setHomeTeamId(""); setAwayTeamId(""); setMatchDate(""); setVenue("");
      setAlreadyPlayed(false); setCreateHomeScore(0); setCreateAwayScore(0);
    }
    setCreating(false);
  }

  function startEdit(match: Match) {
    setEditingMatch(match.id);
    setEditHome(match.homeScore ?? 0);
    setEditAway(match.awayScore ?? 0);
    setEditStatus("finished");
  }

  async function saveResult(matchId: string) {
    setSaving(true);
    const res = await fetch(`/api/admin/matches/${matchId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeScore: editHome, awayScore: editAway, status: editStatus }),
    });
    if (res.ok) {
      setMatches((prev) =>
        prev.map((m) => m.id === matchId ? { ...m, homeScore: editHome, awayScore: editAway, status: editStatus } : m)
      );
      setEditingMatch(null);
    }
    setSaving(false);
  }

  async function deleteMatch(matchId: string) {
    if (!confirm("¿Eliminar este partido? También se eliminan todos los pronósticos.")) return;
    const res = await fetch(`/api/admin/matches/${matchId}`, { method: "DELETE" });
    if (res.ok) setMatches((prev) => prev.filter((m) => m.id !== matchId));
  }

  const stages = ["Fase de Grupos", "16avos de Final", "Octavos de Final", "Cuartos de Final", "Semifinal", "Tercer Puesto", "Final"];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
          <p className="text-white/50 text-sm mt-1">Gestioná partidos y resultados</p>
        </div>
        <div className="flex gap-2">
          <Link href="/historial" className="btn-ghost flex items-center gap-1.5 text-sm py-1.5">
            <History className="w-4 h-4" />Historial
          </Link>
          <Link href="/bracket" className="btn-ghost flex items-center gap-1.5 text-sm py-1.5">
            <GitBranch className="w-4 h-4" />Eliminatoria
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={handleSync} disabled={syncing} className="btn-ghost flex items-center gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Sincronizando..." : "Sync desde FIFA"}
        </button>
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />Agregar partido
        </button>
      </div>

      {syncMsg && (
        <div className={`flex items-start gap-2 rounded-lg px-4 py-3 text-sm ${
          syncMsg.startsWith("Error") ? "bg-red-500/10 border border-red-500/30 text-red-400" : "bg-green-500/10 border border-green-500/30 text-green-400"
        }`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{syncMsg}
        </div>
      )}

      {showCreateForm && (
        <div className="card border-blue-500/30">
          <h3 className="font-semibold text-white mb-4">Nuevo partido</h3>
          <form onSubmit={handleCreateMatch} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/50 mb-1">Local</label>
                <select value={homeTeamId} onChange={(e) => setHomeTeamId(e.target.value)} required className="input-field text-sm">
                  <option value="">Seleccionar equipo...</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.groupName ? `[G.${t.groupName}] ` : ""}{t.nameEs}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Visitante</label>
                <select value={awayTeamId} onChange={(e) => setAwayTeamId(e.target.value)} required className="input-field text-sm">
                  <option value="">Seleccionar equipo...</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.groupName ? `[G.${t.groupName}] ` : ""}{t.nameEs}</option>
                  ))}
                </select>
              </div>
            </div>

            {homeTeamId && awayTeamId && (() => {
              const ht = teams.find((t) => t.id === homeTeamId);
              const at = teams.find((t) => t.id === awayTeamId);
              return (
                <div className="flex items-center justify-center gap-4 py-2">
                  <div className="flex items-center gap-2">
                    <Image src={ht?.flagUrl || `https://flagcdn.com/w40/${ht?.countryCode}.png`} alt={ht?.nameEs || ""} width={32} height={22} className="rounded" />
                    <span className="text-white text-sm font-medium">{ht?.nameEs}</span>
                  </div>
                  <span className="text-white/30">vs</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">{at?.nameEs}</span>
                    <Image src={at?.flagUrl || `https://flagcdn.com/w40/${at?.countryCode}.png`} alt={at?.nameEs || ""} width={32} height={22} className="rounded" />
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/50 mb-1">Fecha y hora</label>
                <input type="datetime-local" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} required className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Estadio (opcional)</label>
                <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="ej: MetLife Stadium" className="input-field text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1">Fase</label>
              <select value={stage} onChange={(e) => setStage(e.target.value)} className="input-field text-sm">
                {stages.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Historical match toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => setAlreadyPlayed(!alreadyPlayed)}
                className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${alreadyPlayed ? "bg-gold-400" : "bg-white/20"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${alreadyPlayed ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm text-white/70">Ya se jugó (cargar resultado)</span>
            </label>

            {alreadyPlayed && (
              <div className="flex items-center gap-3 bg-navy-800 rounded-lg px-4 py-3">
                <span className="text-sm text-white/60">Resultado:</span>
                <input
                  type="number" min="0" max="30" value={createHomeScore}
                  onChange={(e) => setCreateHomeScore(Number(e.target.value))}
                  className="w-14 text-center bg-navy-700 border border-white/20 rounded-lg py-1.5 text-white font-bold focus:outline-none focus:border-blue-500"
                />
                <span className="text-white/30">-</span>
                <input
                  type="number" min="0" max="30" value={createAwayScore}
                  onChange={(e) => setCreateAwayScore(Number(e.target.value))}
                  className="w-14 text-center bg-navy-700 border border-white/20 rounded-lg py-1.5 text-white font-bold focus:outline-none focus:border-blue-500"
                />
                <span className="text-xs text-white/40">Se guardará como Finalizado</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={creating} className="btn-primary text-sm flex-1">
                {creating ? "Creando..." : "Crear partido"}
              </button>
              <button type="button" onClick={() => setShowCreateForm(false)} className="btn-ghost text-sm">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Partidos ({matches.length})</h3>
        {matches.map((match) => {
          const ht = match.homeTeam!;
          const at = match.awayTeam!;
          const isEditing = editingMatch === match.id;
          return (
            <div key={match.id} className={`card ${isEditing ? "border-blue-500/40" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Image src={ht.flagUrl || `https://flagcdn.com/w40/${ht.countryCode}.png`} alt={ht.nameEs} width={24} height={16} className="rounded flex-shrink-0" />
                  <span className="text-white text-sm font-medium truncate">{ht.nameEs}</span>
                  <span className="text-white/30 text-xs flex-shrink-0">
                    {match.status === "finished" ? `${match.homeScore} - ${match.awayScore}` : "vs"}
                  </span>
                  <span className="text-white text-sm font-medium truncate">{at.nameEs}</span>
                  <Image src={at.flagUrl || `https://flagcdn.com/w40/${at.countryCode}.png`} alt={at.nameEs} width={24} height={16} className="rounded flex-shrink-0" />
                </div>

                <div className="text-xs text-white/40 hidden sm:block flex-shrink-0">
                  {format(new Date(match.matchDate), "d/M HH:mm")}
                </div>

                <div className="flex-shrink-0">
                  {match.status === "upcoming" && <span className="text-xs bg-blue-500/20 text-blue-400 rounded px-2 py-0.5">Próximo</span>}
                  {match.status === "live" && <span className="text-xs bg-red-500/20 text-red-400 rounded px-2 py-0.5">En vivo</span>}
                  {match.status === "finished" && <span className="text-xs bg-green-500/20 text-green-400 rounded px-2 py-0.5">Finalizado</span>}
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  {match.status !== "finished" && !isEditing && (
                    <button onClick={() => startEdit(match)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white" title="Cargar resultado">
                      <Save className="w-4 h-4" />
                    </button>
                  )}
                  {isEditing && <button onClick={() => setEditingMatch(null)} className="text-xs text-white/40 hover:text-white px-2">Cancelar</button>}
                  <button onClick={() => deleteMatch(match.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400" title="Eliminar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isEditing && (
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-white/60">Resultado:</span>
                  <input type="number" min="0" max="30" value={editHome} onChange={(e) => setEditHome(Number(e.target.value))}
                    className="w-14 text-center bg-navy-800 border border-white/20 rounded-lg py-1.5 text-white font-bold focus:outline-none focus:border-blue-500" />
                  <span className="text-white/30">-</span>
                  <input type="number" min="0" max="30" value={editAway} onChange={(e) => setEditAway(Number(e.target.value))}
                    className="w-14 text-center bg-navy-800 border border-white/20 rounded-lg py-1.5 text-white font-bold focus:outline-none focus:border-blue-500" />
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as "live" | "finished")}
                    className="input-field w-auto text-sm py-1.5">
                    <option value="live">En vivo</option>
                    <option value="finished">Finalizado</option>
                  </select>
                  <button onClick={() => saveResult(match.id)} disabled={saving} className="btn-gold text-sm py-1.5">
                    {saving ? "Guardando..." : "✓ Guardar"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {matches.length === 0 && (
          <div className="card text-center py-8 text-white/40">
            No hay partidos. Usá &ldquo;Sync desde FIFA&rdquo; o agregá uno manualmente.
          </div>
        )}
      </div>
    </div>
  );
}
