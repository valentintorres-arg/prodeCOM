"use client";

import { useState } from "react";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { Match, Prediction } from "@/types";
import { Clock, MapPin } from "lucide-react";

interface Props {
  match: Match;
  prediction: Prediction | null;
  userId: string | null;
  canPredict: boolean;
}

export default function MatchCard({ match, prediction, userId, canPredict }: Props) {
  const [predHome, setPredHome] = useState(prediction?.predicted_home ?? "");
  const [predAway, setPredAway] = useState(prediction?.predicted_away ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localPred, setLocalPred] = useState(prediction);

  async function savePrediction() {
    if (!userId) return;
    const h = Number(predHome);
    const a = Number(predAway);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return;

    setSaving(true);
    const res = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId: match.id, predictedHome: h, predictedAway: a }),
    });
    setSaving(false);
    if (res.ok) {
      const { prediction: newPred } = await res.json();
      setLocalPred(newPred);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  const homeTeam = match.home_team!;
  const awayTeam = match.away_team!;
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  let pointsBadge = null;
  if (isFinished && localPred) {
    if (localPred.points_earned === 3)
      pointsBadge = <span className="score-badge-exact">+3 ⭐</span>;
    else if (localPred.points_earned === 1)
      pointsBadge = <span className="score-badge-correct">+1</span>;
    else
      pointsBadge = <span className="score-badge-wrong">0 pts</span>;
  }

  return (
    <div className={`card transition-all ${isLive ? "border-red-500/40 bg-red-500/5" : ""}`}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span className="bg-white/10 rounded px-2 py-0.5">{match.stage}</span>
          {match.venue && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {match.venue}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1 text-xs text-red-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              EN VIVO
            </span>
          )}
          {!isLive && !isFinished && (
            <span className="flex items-center gap-1 text-xs text-white/40">
              <Clock className="w-3 h-3" />
              {format(parseISO(match.match_date), "HH:mm", { locale: es })}
            </span>
          )}
          {pointsBadge}
        </div>
      </div>

      {/* Teams + scores */}
      <div className="flex items-center gap-3">
        {/* Home team */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <Image
            src={homeTeam.flag_url || `https://flagcdn.com/w80/${homeTeam.country_code}.png`}
            alt={homeTeam.name_es}
            width={48}
            height={32}
            className="rounded shadow-md"
          />
          <span className="text-white font-semibold text-sm text-center leading-tight">
            {homeTeam.name_es}
          </span>
          {homeTeam.group_name && (
            <span className="text-xs text-white/30">Grupo {homeTeam.group_name}</span>
          )}
        </div>

        {/* Score / VS */}
        <div className="flex flex-col items-center gap-1 w-24 flex-shrink-0">
          {(isFinished || isLive) && match.home_score !== null ? (
            <div className="flex items-center gap-1">
              <span className="text-3xl font-black text-white">{match.home_score}</span>
              <span className="text-xl text-white/30">-</span>
              <span className="text-3xl font-black text-white">{match.away_score}</span>
            </div>
          ) : (
            <div className="text-white/20 font-bold text-lg">vs</div>
          )}
          {isFinished && (
            <span className="text-xs text-white/30">Final</span>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <Image
            src={awayTeam.flag_url || `https://flagcdn.com/w80/${awayTeam.country_code}.png`}
            alt={awayTeam.name_es}
            width={48}
            height={32}
            className="rounded shadow-md"
          />
          <span className="text-white font-semibold text-sm text-center leading-tight">
            {awayTeam.name_es}
          </span>
          {awayTeam.group_name && (
            <span className="text-xs text-white/30">Grupo {awayTeam.group_name}</span>
          )}
        </div>
      </div>

      {/* Prediction input */}
      {userId && (
        <div className="mt-4 pt-4 border-t border-white/10">
          {canPredict ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50 flex-shrink-0">Tu pronóstico:</span>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={predHome}
                  onChange={(e) => setPredHome(e.target.value)}
                  className="w-14 text-center bg-navy-800 border border-white/20 rounded-lg py-1.5 text-white font-bold focus:outline-none focus:border-blue-500 text-lg"
                  placeholder="0"
                />
                <span className="text-white/30 font-bold">-</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={predAway}
                  onChange={(e) => setPredAway(e.target.value)}
                  className="w-14 text-center bg-navy-800 border border-white/20 rounded-lg py-1.5 text-white font-bold focus:outline-none focus:border-blue-500 text-lg"
                  placeholder="0"
                />
                <button
                  onClick={savePrediction}
                  disabled={saving || predHome === "" || predAway === ""}
                  className={`flex-1 text-sm py-1.5 rounded-lg font-semibold transition-all ${
                    saved
                      ? "bg-green-600 text-white"
                      : "btn-primary"
                  }`}
                >
                  {saved ? "✓ Guardado" : saving ? "..." : localPred ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </div>
          ) : localPred ? (
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">Tu pronóstico:</span>
              <span className={`font-bold ${
                isFinished && localPred.points_earned === 3 ? "text-gold-400" :
                isFinished && localPred.points_earned === 1 ? "text-blue-400" :
                isFinished ? "text-red-400" : "text-white"
              }`}>
                {localPred.predicted_home} - {localPred.predicted_away}
              </span>
            </div>
          ) : isFinished ? (
            <p className="text-xs text-white/30 text-center">No hiciste pronóstico para este partido</p>
          ) : (
            <p className="text-xs text-white/30 text-center">
              {isLive ? "🔴 Partido en curso" : "Pronósticos cerrados"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
