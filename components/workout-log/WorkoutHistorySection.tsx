import type { WorkoutLogDetail } from "@/lib/actions";
import DeleteLogButton from "./DeleteLogButton";

type Props = {
  logs: WorkoutLogDetail[];
  routineId: number;
  dayId: number;
};

function formatLogDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function groupSetsByExercise(log: WorkoutLogDetail) {
  return log.sets.reduce<Record<number, { name: string; sets: WorkoutLogDetail["sets"] }>>(
    (acc, s) => {
      if (!acc[s.exerciseId]) acc[s.exerciseId] = { name: s.exercise.name, sets: [] };
      acc[s.exerciseId].sets.push(s);
      return acc;
    },
    {}
  );
}

export default function WorkoutHistorySection({ logs, routineId, dayId }: Props) {
  if (logs.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Historial</h2>
      <div className="space-y-4">
        {logs.map((log) => {
          const byExercise = groupSetsByExercise(log);
          return (
            <div key={log.id} className="rounded-xl border border-zinc-700 bg-zinc-900 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-700 bg-zinc-800/50">
                <span className="text-sm font-medium text-white">{formatLogDate(log.loggedAt)}</span>
                <DeleteLogButton routineId={routineId} dayId={dayId} logId={log.id} />
              </div>
              <div className="px-5 py-4 space-y-3">
                {Object.values(byExercise).map(({ name, sets }) => (
                  <div key={name}>
                    <p className="text-xs text-zinc-400 mb-1">{name}</p>
                    <p className="text-sm font-mono text-white">
                      {sets.map((s) => `${s.weight}${s.weightUnit}×${s.reps}`).join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
