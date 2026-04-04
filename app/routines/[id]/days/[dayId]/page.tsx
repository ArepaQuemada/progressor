import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoutine, getWorkoutLogsForDay, type WorkoutLogDetail } from "@/lib/actions";
import { Routes } from "@/lib/routes";
import ErrorBoundary from "@/components/ErrorBoundary";
import LogWorkoutSection from "@/components/workout-log/LogWorkoutSection";
import DeleteLogButton from "@/components/workout-log/DeleteLogButton";

function getWeekStart(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dow = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() - (dow === 0 ? 6 : dow - 1));
  return date.toISOString().slice(0, 10);
}

function formatWeekLabel(weekStart: string): string {
  const [y, m, d] = weekStart.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d));
  const end = new Date(Date.UTC(y, m - 1, d + 6));
  const startStr = start.toLocaleDateString("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });
  const endStr = end.toLocaleDateString("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });
  return `${startStr} – ${endStr}`;
}

function formatLogDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

type WeekStats = {
  weekStart: string;
  maxWeight: number;
  weightUnit: "kg" | "lbs";
  firstSetWeight: number;
  firstSetWeightUnit: "kg" | "lbs";
  firstSetReps: number;
};

type ExerciseProgress = {
  exerciseId: number;
  exerciseName: string;
  weeks: WeekStats[];
};

function buildWeeklyProgress(
  templateExercises: Array<{ id: number; name: string }>,
  logs: WorkoutLogDetail[]
): ExerciseProgress[] {
  // logs arrive in DESC order (most recent first)
  return templateExercises.map(({ id: exerciseId, name: exerciseName }) => {
    type Accumulator = WeekStats & { earliestLogDate: string };
    const weekMap = new Map<string, Accumulator>();

    for (const log of logs) {
      const weekStart = getWeekStart(log.loggedAt);
      const exSets = log.sets.filter((s) => s.exerciseId === exerciseId);
      if (exSets.length === 0) continue;

      const firstSet = exSets.find((s) => s.setNumber === 1) ?? exSets[0];
      const existing = weekMap.get(weekStart);

      if (!existing) {
        weekMap.set(weekStart, {
          weekStart,
          maxWeight: Math.max(...exSets.map((s) => s.weight)),
          weightUnit: exSets.reduce((best, s) => (s.weight > best.weight ? s : best)).weightUnit,
          firstSetWeight: firstSet.weight,
          firstSetWeightUnit: firstSet.weightUnit,
          firstSetReps: firstSet.reps,
          earliestLogDate: log.loggedAt,
        });
      } else {
        for (const s of exSets) {
          if (s.weight > existing.maxWeight) {
            existing.maxWeight = s.weight;
            existing.weightUnit = s.weightUnit;
          }
        }
        // logs are DESC, so a smaller date means an earlier (older) log
        if (log.loggedAt < existing.earliestLogDate) {
          existing.earliestLogDate = log.loggedAt;
          existing.firstSetWeight = firstSet.weight;
          existing.firstSetWeightUnit = firstSet.weightUnit;
          existing.firstSetReps = firstSet.reps;
        }
      }
    }

    const weeks = Array.from(weekMap.values())
      .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
      .map(({ earliestLogDate: _unused, ...week }) => week);

    return { exerciseId, exerciseName, weeks };
  });
}

export default async function DayMetricsPage({
  params,
}: {
  params: Promise<{ id: string; dayId: string }>;
}) {
  const { id, dayId } = await params;
  const routineId = Number(id);
  const dayIdNum = Number(dayId);

  const [routine, logs] = await Promise.all([
    getRoutine(routineId),
    getWorkoutLogsForDay(dayIdNum),
  ]);

  if (!routine) notFound();
  const day = routine.days.find((d) => d.id === dayIdNum);
  if (!day) notFound();

  const templateExercises = day.exerciseTypes.flatMap((et) =>
    et.exercises.map((ex) => ({ id: ex.id, name: ex.name }))
  );

  const progress = buildWeeklyProgress(templateExercises, logs);

  const lastLog = logs[0] ?? null;
  const lastSetsByExerciseId = lastLog
    ? lastLog.sets.reduce<Record<number, typeof lastLog.sets>>((acc, s) => {
        (acc[s.exerciseId] ??= []).push(s);
        return acc;
      }, {})
    : {};

  type ExTypeForLog = {
    id: number;
    name: string;
    exercises: {
      id: number;
      name: string;
      initialSets: { weight: string; weightUnit: "kg" | "lbs"; reps: string }[];
    }[];
  };

  const exerciseTypesForLog: ExTypeForLog[] = day.exerciseTypes.map((et) => ({
    id: et.id,
    name: et.name,
    exercises: et.exercises.map((ex) => {
      const prefill = lastSetsByExerciseId[ex.id] ?? ex.sets;
      return {
        id: ex.id,
        name: ex.name,
        initialSets: prefill.map((s) => ({
          weight: String(s.weight),
          weightUnit: s.weightUnit,
          reps: String(s.reps),
        })),
      };
    }),
  }));

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-start gap-4 mb-10">
          <Link
            href={Routes.routines.detail(routineId)}
            className="mt-1 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          <div>
            <p className="text-zinc-500 text-sm">{routine.name}</p>
            <h1 className="text-2xl font-bold tracking-tight">
              Día {day.dayNumber} · {day.label}
            </h1>
          </div>
        </div>

        <ErrorBoundary>
          <div className="space-y-10">
            {/* Log workout section */}
            <LogWorkoutSection
              routineId={routineId}
              dayId={dayIdNum}
              exerciseTypes={exerciseTypesForLog}
            />

            {/* Weekly progress */}
            {progress.some((ep) => ep.weeks.length > 0) && (
              <section>
                <h2 className="text-lg font-semibold mb-4">Progreso semanal</h2>
                <div className="space-y-6">
                  {day.exerciseTypes.map((et) => {
                    const etExercises = progress.filter((ep) =>
                      et.exercises.some((ex) => ex.id === ep.exerciseId)
                    );
                    if (etExercises.every((ep) => ep.weeks.length === 0)) return null;
                    return (
                      <div key={et.id}>
                        {et.name.trim() && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-900/50 text-indigo-300 border border-indigo-800 mb-3">
                            {et.name}
                          </span>
                        )}
                        <div className="space-y-4 pl-2">
                          {etExercises.map((ep) => {
                            if (ep.weeks.length === 0) return null;
                            return (
                              <div key={ep.exerciseId} className="rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden">
                                <div className="px-4 py-2.5 border-b border-zinc-700 bg-zinc-800/50">
                                  <span className="text-sm font-medium">{ep.exerciseName}</span>
                                </div>
                                <div className="px-4 py-3">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="text-xs text-zinc-500 uppercase">
                                        <th className="text-left pb-2 font-medium">Semana</th>
                                        <th className="text-right pb-2 font-medium">Peso inicial</th>
                                        <th className="text-right pb-2 font-medium">Mejor peso</th>
                                        <th className="text-right pb-2 font-medium">% cambio</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-700/50">
                                      {ep.weeks.map((week, i) => {
                                        const prev = ep.weeks[i - 1];
                                        let pctNode: React.ReactNode = (
                                          <span className="text-zinc-500">—</span>
                                        );
                                        if (prev && prev.maxWeight !== 0) {
                                          const pct = ((week.maxWeight - prev.maxWeight) / prev.maxWeight) * 100;
                                          const sign = pct > 0 ? "+" : "";
                                          pctNode = (
                                            <span className={pct > 0 ? "text-emerald-400" : pct < 0 ? "text-red-400" : "text-zinc-500"}>
                                              {sign}{pct.toFixed(1)}%
                                            </span>
                                          );
                                        }
                                        return (
                                          <tr key={week.weekStart}>
                                            <td className="py-2 text-zinc-400 text-xs">{formatWeekLabel(week.weekStart)}</td>
                                            <td className="py-2 text-right font-mono text-white">
                                              {week.firstSetWeight}{" "}
                                              <span className="text-zinc-400 text-xs">{week.firstSetWeightUnit}</span>
                                              <span className="text-zinc-500 text-xs"> ×{week.firstSetReps}</span>
                                            </td>
                                            <td className="py-2 text-right font-mono text-white">
                                              {week.maxWeight}{" "}
                                              <span className="text-zinc-400 text-xs">{week.weightUnit}</span>
                                            </td>
                                            <td className="py-2 text-right text-xs font-mono">{pctNode}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* History */}
            {logs.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">Historial</h2>
                <div className="space-y-4">
                  {logs.map((log) => {
                    const byExercise = log.sets.reduce<
                      Record<number, { name: string; sets: typeof log.sets }>
                    >((acc, s) => {
                      if (!acc[s.exerciseId]) acc[s.exerciseId] = { name: s.exercise.name, sets: [] };
                      acc[s.exerciseId].sets.push(s);
                      return acc;
                    }, {});

                    return (
                      <div key={log.id} className="rounded-xl border border-zinc-700 bg-zinc-900 overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-700 bg-zinc-800/50">
                          <span className="text-sm font-medium text-white">{formatLogDate(log.loggedAt)}</span>
                          <DeleteLogButton routineId={routineId} dayId={dayIdNum} logId={log.id} />
                        </div>
                        <div className="px-5 py-4 space-y-3">
                          {Object.values(byExercise).map(({ name, sets: exSets }) => (
                            <div key={name}>
                              <p className="text-xs text-zinc-400 mb-1">{name}</p>
                              <p className="text-sm font-mono text-white">
                                {exSets
                                  .map((s) => `${s.weight}${s.weightUnit}×${s.reps}`)
                                  .join(", ")}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </ErrorBoundary>
      </div>
    </main>
  );
}
