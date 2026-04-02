import Link from "next/link";
import { listRoutines } from "@/lib/actions";
import { Routes } from "@/lib/routes";
import RoutineCard from "@/components/RoutineCard";

export default async function HomePage() {
  const routines = await listRoutines();

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Progressor</h1>
            <p className="text-zinc-400 mt-1 text-sm">
              Tus rutinas de entrenamiento
            </p>
          </div>
          <Link
            href={Routes.routines.new}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Nueva rutina
          </Link>
        </div>

        {/* List */}
        {routines.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-lg">No tenés rutinas todavía.</p>
            <p className="text-zinc-600 text-sm mt-1">
              Creá tu primera rutina para empezar.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {routines.map((r) => (
              <RoutineCard key={r.id} routine={r} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
