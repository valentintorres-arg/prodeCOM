"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import type { Match, Prediction } from "@/types";
import { Clock, MapPin } from "lucide-react";

interface Props {
  match: Match;
  prediction: Prediction | null;
  userId: string | null;
  canPredict: boolean;
}

export default function MatchCard({ match, prediction, userId, canPredict }: Props) {
  const [predHome, setPredHome] = useState<string>(prediction?.predictedHome?.toString() ?? "");
  const [predAway, setPredAway] = useState<string>(prediction?.predictedAway?.toString() ?? "");
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

  const homeTeam = match.homeTeam!;
  const awayTeam = match.awayTeam!;
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  let pointsBadge = null;
  if (isFinished && localPred) {
    if (localPred.pointsEarned === 3) pointsBadge = <span className="score-badge-exact">+3 ⭐</span>;
    else if (localPred.pointsEarned === 1) pointsBadge = <span className="score-badge-correct">+1</span>;
    else pointsBadge = <span className="score-badge-wrong">0 pts</span>;
  }

  return (
    <div className={`card transition-all ${isLive ? "border-red-500/40 bg-red-500/5" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span className="bg-white/10 rounded px-2 py-0.5">{match.stage}</span>
          {match.venue && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />{match.venue}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1 text-xs text-red-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />EN VIVO
            </span>
          )}
          {!isLive && !isFinished && (
            <span className="flex items-center gap-1 text-xs text-white/40">
              <Clock className="w-3 h-3" />
              {format(new Date(match.matchDate), "HH:mm")}
            </span>
          )}
          {pointsBadge}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <Image
            src={homeTeam.flagUrl || `https://flagcdn.com/w80/${homeTeam.countryCode}.png`}
            alt={homeTeam.nameEs} width={48} height={32} className="rounded shadow-md"
          />
          <span className="text-white font-semibold text-sm text-center leading-tight">{homeTeam.nameEs}</span>
          {homeTeam.groupName && <span className="text-xs text-white/30">Grupo {homeTeam.groupName}</span>}
        </div>

        <div className="flex flex-col items-center gap-1 w-24 flex-shrink-0">
          {(isFinished || isLive) && match.homeScore !== null ? (
            <div className="flex items-center gap-1">
              <span className="text-3xl font-black text-white">{match.homeScore}</span>
              <span className="text-xl text-white/30">-</span>
              <span className="text-3xl font-black text-white">{match.awayScore}</span>
            </div>
          ) : (
            <div className="text-white/20 font-bold text-lg">vs</div>
          )}
          {isFinished && <span className="text-xs text-white/30">Final</span>}
        </div>

        <div className="flex-1 flex flex-col items-center gap-1.5">
          <Image
            src={awayTeam.flagUrl || `https://flagcdn.com/w80/${awayTeam.countryCode}.png`}
            alt={awayTeam.nameEs} width={48} height={32} className="rounded shadow-md"
          />
          <span className="text-white font-semibold text-sm text-center leading-tight">{awayTeam.nameEs}</span>
          {awayTeam.groupName && <span className="text-xs text-white/30">Grupo {awayTeam.groupName}</span>}
        </div>
      </div>

      {userId && (
        <div className="mt-4 pt-4 border-t border-white/10">
          {canPredict ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50 flex-shrink-0">Tu pronóstico:</span>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="number" min="0" max="20" value={predHome}
                  onChange={(e) => setPredHome(e.target.value)}
                  className="w-14 text-center bg-navy-800 border border-white/20 rounded-lg py-1.5 text-white font-bold focus:outline-none focus:border-blue-500 text-lg"
                  placeholder="0"
                />
                <span className="text-white/30 font-bold">-</span>
                <input
                  type="number" min="0" max="20" value={predAway}
                  onChange={(e) => setPredAway(e.target.value)}
                  className="w-14 text-center bg-navy-800 border border-white/20 rounded-lg py-1.5 text-white font-bold focus:outline-none focus:border-blue-500 text-lg"
                  placeholder="0"
                />
                <button
                  onClick={savePrediction}
                  disabled={saving || predHome === "" || predAway === ""}
                  className={`flex-1 text-sm py-1.5 rounded-lg font-semibold transition-all ${
                    saved ? "bg-green-600 text-white" : "btn-primary"
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
                isFinished && localPred.pointsEarned === 3 ? "text-gold-400" :
                isFinished && localPred.pointsEarned === 1 ? "text-blue-400" :
                isFinished ? "text-red-400" : "text-white"
              }`}>
                {localPred.predictedHome} - {localPred.predictedAway}
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
