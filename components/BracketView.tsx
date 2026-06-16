"use client";

import Image from "next/image";
import type { Match } from "@/types";

// Layout constants
const UNIT = 72;   // px per R32 slot (card + spacing)
const CARD_H = 56; // px card height
const COL_W = 204; // px round column width
const CON_W = 40;  // px connector column width
const TOTAL_H = 16 * UNIT; // 1152px total bracket height

const MAIN_ROUNDS = [
  { key: "16avos de Final", label: "16avos",  maxSlots: 16 },
  { key: "Octavos de Final", label: "Octavos", maxSlots: 8 },
  { key: "Cuartos de Final", label: "Cuartos", maxSlots: 4 },
  { key: "Semifinal",        label: "Semis",   maxSlots: 2 },
  { key: "Final",            label: "Final",   maxSlots: 1 },
] as const;

const TOTAL_W = MAIN_ROUNDS.length * COL_W + (MAIN_ROUNDS.length - 1) * CON_W;

/** Absolute top position of match[roundIndex][matchIndex] inside the bracket */
function getTop(roundIndex: number, matchIndex: number): number {
  const mult = Math.pow(2, roundIndex);
  return matchIndex * mult * UNIT + (mult * UNIT - CARD_H) / 2;
}

/** SVG connector between round r and round r+1 */
function ConnectorSVG({ roundIndex, pairs }: { roundIndex: number; pairs: number }) {
  const pow = Math.pow(2, roundIndex);
  const segs: React.ReactNode[] = [];

  for (let j = 0; j < pairs; j++) {
    const y1 = j * 2 * pow * UNIT + pow * UNIT / 2; // center of src match 2j
    const y2 = (j * 2 + 1) * pow * UNIT + pow * UNIT / 2; // center of src match 2j+1
    const ym = (j * 2 + 1) * pow * UNIT; // center of dst match j (= midpoint of y1,y2)
    const cx = CON_W / 2;

    segs.push(
      <line key={`h1-${j}`} x1={0} y1={y1} x2={cx} y2={y1} />,
      <line key={`h2-${j}`} x1={0} y1={y2} x2={cx} y2={y2} />,
      <line key={`v-${j}`}  x1={cx} y1={y1} x2={cx} y2={y2} />,
      <line key={`hm-${j}`} x1={cx} y1={ym} x2={CON_W} y2={ym} />,
    );
  }

  return (
    <svg
      width={CON_W}
      height={TOTAL_H}
      className="flex-shrink-0 block"
      style={{ overflow: "visible" }}
    >
      <g stroke="#1e3a5f" strokeWidth="1.5" fill="none">
        {segs}
      </g>
    </svg>
  );
}

/** Single match card inside the bracket */
function MatchCard({ match }: { match?: Match }) {
  if (!match) {
    return (
      <div className="h-full border border-dashed border-white/10 rounded-lg flex items-center justify-center bg-navy-900/40">
        <span className="text-white/20 text-[10px]">Por definir</span>
      </div>
    );
  }

  const ht = match.homeTeam!;
  const at = match.awayTeam!;
  const done = match.status === "finished";
  const live = match.status === "live";
  const winH = done && match.homeScore! > match.awayScore!;
  const winA = done && match.awayScore! > match.homeScore!;

  return (
    <div className={`h-full rounded-lg border px-2 py-1 flex flex-col justify-around text-[11px] overflow-hidden ${
      live ? "border-red-500/40 bg-red-500/5" :
      done ? "border-white/15 bg-navy-700" :
            "border-white/10 bg-navy-800"
    }`}>
      {/* Home */}
      <div className="flex items-center gap-1.5 min-w-0">
        <Image
          src={ht.flagUrl || `https://flagcdn.com/w40/${ht.countryCode}.png`}
          alt="" width={16} height={11} className="rounded-sm flex-shrink-0"
          unoptimized
        />
        <span className={`truncate font-medium leading-none ${winH ? "text-gold-400" : "text-white/85"}`}>
          {ht.nameEs}
        </span>
        {(done || live) && (
          <span className={`ml-auto font-bold leading-none flex-shrink-0 pl-1 ${
            live ? "text-red-400" : winH ? "text-gold-400" : "text-white/50"
          }`}>{match.homeScore ?? 0}</span>
        )}
      </div>

      <div className="border-t border-white/5" />

      {/* Away */}
      <div className="flex items-center gap-1.5 min-w-0">
        <Image
          src={at.flagUrl || `https://flagcdn.com/w40/${at.countryCode}.png`}
          alt="" width={16} height={11} className="rounded-sm flex-shrink-0"
          unoptimized
        />
        <span className={`truncate font-medium leading-none ${winA ? "text-gold-400" : "text-white/85"}`}>
          {at.nameEs}
        </span>
        {(done || live) && (
          <span className={`ml-auto font-bold leading-none flex-shrink-0 pl-1 ${
            live ? "text-red-400" : winA ? "text-gold-400" : "text-white/50"
          }`}>{match.awayScore ?? 0}</span>
        )}
      </div>
    </div>
  );
}

interface Props {
  matchesByStage: Partial<Record<string, Match[]>>;
  thirdPlace?: Match;
}

export default function BracketView({ matchesByStage, thirdPlace }: Props) {
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto pb-2">
        <div style={{ minWidth: TOTAL_W }}>
          {/* Round headers */}
          <div className="flex mb-3">
            {MAIN_ROUNDS.map((round, ri) => (
              <div key={round.key} className="flex items-center flex-shrink-0">
                <div className="text-center" style={{ width: COL_W }}>
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                    {round.label}
                  </span>
                  <div className="text-[10px] text-white/20 mt-0.5">
                    {round.maxSlots} {round.maxSlots === 1 ? "partido" : "partidos"}
                  </div>
                </div>
                {ri < MAIN_ROUNDS.length - 1 && (
                  <div className="flex-shrink-0" style={{ width: CON_W }} />
                )}
              </div>
            ))}
          </div>

          {/* Bracket body */}
          <div
            className="flex items-start relative"
            style={{ height: TOTAL_H }}
          >
            {MAIN_ROUNDS.map((round, ri) => {
              const stageMatches = matchesByStage[round.key] ?? [];
              return (
                <div key={round.key} className="flex items-start flex-shrink-0">
                  {/* Round column */}
                  <div
                    className="flex-shrink-0 relative"
                    style={{ width: COL_W, height: TOTAL_H }}
                  >
                    {Array.from({ length: round.maxSlots }, (_, i) => (
                      <div
                        key={i}
                        className="absolute left-0 right-0"
                        style={{ top: getTop(ri, i), height: CARD_H }}
                      >
                        <MatchCard match={stageMatches[i]} />
                      </div>
                    ))}
                  </div>

                  {/* SVG connector (not after Final) */}
                  {ri < MAIN_ROUNDS.length - 1 && (
                    <ConnectorSVG roundIndex={ri} pairs={round.maxSlots / 2} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3rd place */}
      <div className="border-t border-white/10 pt-5">
        <div className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
          Tercer Puesto
        </div>
        <div style={{ width: COL_W, height: CARD_H }}>
          <MatchCard match={thirdPlace} />
        </div>
      </div>
    </div>
  );
}
