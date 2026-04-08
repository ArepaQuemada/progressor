import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoutine, getWorkoutLogsForDay } from "@/lib/actions";
import { Routes } from "@/lib/routes";
import { buildWeeklyProgress } from "@/lib/workout/weeklyProgress";
import ErrorBoundary from "@/components/ErrorBoundary";
import LogWorkoutSection from "@/components/workout-log/LogWorkoutSection";
import WeeklyProgressSection from "@/components/workout-log/WeeklyProgressSection";
import WorkoutHistorySection from "@/components/workout-log/WorkoutHistorySection";

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

  // Pre-fill log form from last workout, falling back to the template sets
  const lastLogSets = logs[0]?.sets ?? [];
  const lastSetsByExerciseId = lastLogSets.reduce<Record<number, typeof lastLogSets>>(
    (acc, s) => { (acc[s.exerciseId] ??= []).push(s); return acc; },
    {}
  );

  const exerciseTypesForLog = day.exerciseTypes.map((et) => ({
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
        <div className="flex items-start gap-4 mb-10">
          <Link
            href={Routes.routines.detail(routineId)}
            className="mt-1 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
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
            <LogWorkoutSection
              routineId={routineId}
              dayId={dayIdNum}
              exerciseTypes={exerciseTypesForLog}
            />

            <WeeklyProgressSection
              exerciseTypes={day.exerciseTypes}
              progress={progress}
            />

            <WorkoutHistorySection
              logs={logs}
              routineId={routineId}
              dayId={dayIdNum}
            />
          </div>
        </ErrorBoundary>
      </div>
    </main>
  );
}
