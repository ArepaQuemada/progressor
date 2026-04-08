import type { RoutineDetail } from "@/lib/actions";
import type { ExerciseProgress } from "@/lib/workout/weeklyProgress";
import ExerciseProgressTable from "./ExerciseProgressTable";

type ExerciseTypeData = RoutineDetail["days"][number]["exerciseTypes"][number];

type Props = {
  exerciseTypes: ExerciseTypeData[];
  progress: ExerciseProgress[];
};

export default function WeeklyProgressSection({ exerciseTypes, progress }: Props) {
  const hasData = progress.some((ep) => ep.weeks.length > 0);
  if (!hasData) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Progreso semanal</h2>
      <div className="space-y-6">
        {exerciseTypes.map((et) => {
          const etProgress = progress.filter((ep) =>
            et.exercises.some((ex) => ex.id === ep.exerciseId)
          );
          if (etProgress.every((ep) => ep.weeks.length === 0)) return null;

          return (
            <div key={et.id}>
              {et.name.trim() && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-900/50 text-indigo-300 border border-indigo-800 mb-3">
                  {et.name}
                </span>
              )}
              <div className="space-y-4 pl-2">
                {etProgress.map((ep) =>
                  ep.weeks.length === 0 ? null : (
                    <ExerciseProgressTable key={ep.exerciseId} ep={ep} />
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
