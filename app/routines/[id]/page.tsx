import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoutine } from "@/lib/actions";
import ErrorBoundary from "@/components/ErrorBoundary";
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
                <h2 className="font-semibold text-white">{day.label}</h2>
              </div>

              {/* Exercise types */}
              <div className="p-5 space-y-6">
                {day.exerciseTypes.length === 0 ? (
                  <p className="text-zinc-500 text-sm">Sin ejercicios cargados.</p>
                ) : (
                  day.exerciseTypes.map((et) => (
                    <div key={et.id} className="space-y-3">
                      {/* Type badge */}
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-900/50 text-indigo-300 border border-indigo-800">
                          {et.name}
                        </span>
                      </div>

                      {/* Exercises */}
                      <div className="space-y-3 pl-2">
                        {et.exercises.map((ex, idx) => (
                          <div
                            key={ex.id}
                            className="rounded-lg border border-zinc-700 bg-zinc-800 overflow-hidden"
                          >
                            {/* Exercise name */}
                            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-700">
                              <span className="text-xs text-zinc-500 font-medium">
                                {idx + 1}.
                              </span>
                              <span className="text-sm font-medium text-white">
                                {ex.name}
                              </span>
                            </div>

                            {/* Sets table */}
                            <div className="px-4 py-3">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-xs text-zinc-500 uppercase">
                                    <th className="text-left pb-2 font-medium w-12">
                                      Serie
                                    </th>
                                    <th className="text-right pb-2 font-medium">
                                      Peso
                                    </th>
                                    <th className="text-right pb-2 font-medium">
                                      Reps
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-700/50">
                                  {ex.sets.map((s) => (
                                    <tr key={s.id}>
                                      <td className="py-2 text-zinc-400">
                                        {s.setNumber}
                                      </td>
                                      <td className="py-2 text-right font-mono text-white">
                                        {s.weight}{" "}
                                        <span className="text-zinc-400 text-xs">
                                          {s.weightUnit}
                                        </span>
                                      </td>
                                      <td className="py-2 text-right font-mono text-white">
                                        {s.reps}{" "}
                                        <span className="text-zinc-400 text-xs">
                                          reps
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
        </ErrorBoundary>
      </div>
    </main>
  );
}
