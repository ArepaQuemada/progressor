import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoutine } from "@/lib/actions";
import ErrorBoundary from "@/components/ErrorBoundary";
import DayExercisesSection from "@/components/DayExercisesSection";
import { Routes } from "@/lib/routes";

export default async function RoutinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const routine = await getRoutine(Number(id));

  if (!routine) notFound();

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-start gap-4 mb-10">
          <Link
            href={Routes.home}
            className="mt-1 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex-shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{routine.name}</h1>
            <p className="text-zinc-400 text-sm mt-0.5">
              {routine.days.length} días
            </p>
          </div>
        </div>

        {/* Days */}
        <ErrorBoundary>
          <div className="space-y-6">
            {routine.days.map((day) => (
              <section key={day.id} className="rounded-xl border border-zinc-700 bg-zinc-900 overflow-hidden">
                {/* Day header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-700 bg-zinc-800/50">
                  <span className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {day.dayNumber}
                  </span>
                  <h2 className="font-semibold text-white flex-1">{day.label}</h2>
                  <Link
                    href={Routes.routines.dayMetrics(routine.id, day.id)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Ver métricas →
                  </Link>
                </div>

                {/* Exercise types */}
                <div className="p-5">
                  <DayExercisesSection exerciseTypes={day.exerciseTypes} />
                </div>
              </section>
            ))}
          </div>
        </ErrorBoundary>
      </div>
    </main>
  );
}
