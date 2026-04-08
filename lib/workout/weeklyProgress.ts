import type { WorkoutLogDetail } from "@/lib/actions";

export type WeekStats = {
  weekStart: string;
  maxWeight: number;
  weightUnit: "kg" | "lbs";
  firstSetWeight: number;
  firstSetWeightUnit: "kg" | "lbs";
  firstSetReps: number;
  currentWeight: number;
  currentWeightUnit: "kg" | "lbs";
  minReps: number;
  maxReps: number;
};

export type ExerciseProgress = {
  exerciseId: number;
  exerciseName: string;
  weeks: WeekStats[];
};

// Returns the ISO Monday of the week containing dateStr (YYYY-MM-DD), UTC-safe.
function getWeekStart(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dow = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() - (dow === 0 ? 6 : dow - 1));
  return date.toISOString().slice(0, 10);
}

// Expects logs in DESC order (most recent first).
export function buildWeeklyProgress(
  templateExercises: Array<{ id: number; name: string }>,
  logs: WorkoutLogDetail[]
): ExerciseProgress[] {
  return templateExercises.map(({ id: exerciseId, name: exerciseName }) => {
    type Accumulator = WeekStats & { earliestLogDate: string };
    const weekMap = new Map<string, Accumulator>();

    for (const log of logs) {
      const weekStart = getWeekStart(log.loggedAt);
      const exSets = log.sets.filter((s) => s.exerciseId === exerciseId);
      if (exSets.length === 0) continue;

      const firstSet = exSets.find((s) => s.setNumber === 1) ?? exSets[0];
      const existing = weekMap.get(weekStart);
      const reps = exSets.map((s) => s.reps);

      if (!existing) {
        // First encounter = most recent log for this week → currentWeight
        weekMap.set(weekStart, {
          weekStart,
          maxWeight: Math.max(...exSets.map((s) => s.weight)),
          weightUnit: exSets.reduce((best, s) => (s.weight > best.weight ? s : best)).weightUnit,
          firstSetWeight: firstSet.weight,
          firstSetWeightUnit: firstSet.weightUnit,
          firstSetReps: firstSet.reps,
          currentWeight: firstSet.weight,
          currentWeightUnit: firstSet.weightUnit,
          minReps: Math.min(...reps),
          maxReps: Math.max(...reps),
          earliestLogDate: log.loggedAt,
        });
      } else {
        for (const s of exSets) {
          if (s.weight > existing.maxWeight) {
            existing.maxWeight = s.weight;
            existing.weightUnit = s.weightUnit;
          }
        }
        existing.minReps = Math.min(existing.minReps, ...reps);
        existing.maxReps = Math.max(existing.maxReps, ...reps);
        // Smaller date = older log → update firstSet fields
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
