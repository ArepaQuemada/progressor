"use client";

import { useState } from "react";
import type { ExerciseProgress, WeekStats } from "@/lib/workout/weeklyProgress";

const PAGE_SIZE = 4;

function formatWeekLabel(weekStart: string): string {
  const [y, m, d] = weekStart.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d));
  const end = new Date(Date.UTC(y, m - 1, d + 6));
  const fmt = (date: Date) =>
    date.toLocaleDateString("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });
  return `${fmt(start)} – ${fmt(end)}`;
}

function WeightCell({ weight, unit }: { weight: number; unit: string }) {
  return (
    <td className="py-2 text-right font-mono text-white">
      {weight} <span className="text-zinc-400 text-xs">{unit}</span>
    </td>
  );
}

function PctChangeCell({ week, prev }: { week: WeekStats; prev: WeekStats | undefined }) {
  if (!prev || prev.maxWeight === 0) {
    return <td className="py-2 text-right text-xs font-mono text-zinc-500">—</td>;
  }
  const pct = ((week.maxWeight - prev.maxWeight) / prev.maxWeight) * 100;
  const sign = pct > 0 ? "+" : "";
  const color = pct > 0 ? "text-emerald-400" : pct < 0 ? "text-red-400" : "text-zinc-500";
  return (
    <td className={`py-2 text-right text-xs font-mono ${color}`}>
      {sign}{pct.toFixed(1)}%
    </td>
  );
}

function RepRangeCell({ week, prev }: { week: WeekStats; prev: WeekStats | undefined }) {
  const range =
    week.minReps === week.maxReps ? `${week.minReps}` : `${week.minReps}–${week.maxReps}`;

  let delta: React.ReactNode = null;
  if (prev) {
    const minDelta = week.minReps - prev.minReps;
    const maxDelta = week.maxReps - prev.maxReps;
    const d = minDelta !== 0 ? minDelta : maxDelta;
    if (d !== 0) {
      delta = (
        <span className={d > 0 ? "text-emerald-400" : "text-red-400"}>
          {" "}({d > 0 ? "+" : ""}{d})
        </span>
      );
    }
  }

  return (
    <td className="py-2 text-right font-mono text-sm text-white">
      {range}{delta}
    </td>
  );
}

type Props = { ep: ExerciseProgress };

export default function ExerciseProgressTable({ ep }: Props) {
  const [page, setPage] = useState(0);

  // Newest first
  const reversedWeeks = [...ep.weeks].reverse();
  const paginated = reversedWeeks.length >= 5;
  const totalPages = paginated ? Math.ceil(reversedWeeks.length / PAGE_SIZE) : 1;
  const pageWeeks = paginated
    ? reversedWeeks.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
    : reversedWeeks;

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-zinc-700 bg-zinc-800/50">
        <span className="text-sm font-medium">{ep.exerciseName}</span>
      </div>
      <div className="px-4 py-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-zinc-500 uppercase">
              <th className="text-left pb-2 font-medium">Semana</th>
              <th className="text-right pb-2 font-medium">Peso inicial</th>
              <th className="text-right pb-2 font-medium">Peso actual</th>
              <th className="text-right pb-2 font-medium">Mejor peso</th>
              <th className="text-right pb-2 font-medium">Reps</th>
              <th className="text-right pb-2 font-medium">% cambio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700/50">
            {pageWeeks.map((week, localIdx) => {
              const globalIdx = page * PAGE_SIZE + localIdx;
              // Chronological predecessor = next item in the reversed array (one step older)
              const prev = reversedWeeks[globalIdx + 1];
              return (
                <tr key={week.weekStart}>
                  <td className="py-2 text-zinc-400 text-xs">{formatWeekLabel(week.weekStart)}</td>
                  <td className="py-2 text-right font-mono text-white">
                    {week.firstSetWeight}{" "}
                    <span className="text-zinc-400 text-xs">{week.firstSetWeightUnit}</span>
                    <span className="text-zinc-500 text-xs"> ×{week.firstSetReps}</span>
                  </td>
                  <WeightCell weight={week.currentWeight} unit={week.currentWeightUnit} />
                  <WeightCell weight={week.maxWeight} unit={week.weightUnit} />
                  <RepRangeCell week={week} prev={prev} />
                  <PctChangeCell week={week} prev={prev} />
                </tr>
              );
            })}
          </tbody>
        </table>

        {paginated && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-700/50">
            <button
              type="button"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
              className="text-xs text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              ← Anterior
            </button>
            <span className="text-xs text-zinc-500">
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages - 1}
              className="text-xs text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
