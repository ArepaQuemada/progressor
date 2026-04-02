import Link from "next/link";
import RoutineForm from "@/components/RoutineForm";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Routes } from "@/lib/routes";

export default function NewRoutinePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            href={Routes.home}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
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
            <h1 className="text-2xl font-bold tracking-tight">Nueva rutina</h1>
            <p className="text-zinc-400 text-sm mt-0.5">
              Completá los datos de tu rutina
            </p>
          </div>
        </div>

        <ErrorBoundary>
          <RoutineForm />
        </ErrorBoundary>
      </div>
    </main>
  );
}
