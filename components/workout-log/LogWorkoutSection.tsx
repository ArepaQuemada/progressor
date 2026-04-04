"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWorkoutLog, type WorkoutSetLogInput } from "@/lib/actions";

type SetDraft = {
  weight: string;
  weightUnit: "kg" | "lbs";
  reps: string;
};

type ExerciseDraft = {
  exerciseId: number;
  exerciseName: string;
  sets: SetDraft[];
};

type ExTypeForLog = {
  id: number;
  name: string;
  exercises: {
    id: number;
    name: string;
    initialSets: { weight: string; weightUnit: "kg" | "lbs"; reps: string }[];
  }[];
};

function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function initDrafts(exerciseTypes: ExTypeForLog[]): ExerciseDraft[] {
  return exerciseTypes.flatMap((et) =>
    et.exercises.map((ex) => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      sets: ex.initialSets.map((s) => ({ ...s })),
    }))
  );
}

export default function LogWorkoutSection({
  routineId,
  dayId,
  exerciseTypes,
}: {
  routineId: number;
  dayId: number;
  exerciseTypes: ExTypeForLog[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [drafts, setDrafts] = useState<ExerciseDraft[]>(() => initDrafts(exerciseTypes));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateSet(exIdx: number, setIdx: number, field: keyof SetDraft, value: string) {
    setDrafts((prev) =>
      prev.map((ex, i) =>
        i !== exIdx
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s, j) => (j !== setIdx ? s : { ...s, [field]: value })),
            }
      )
    );
  }

  function addSet(exIdx: number) {
    setDrafts((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex;
        const last = ex.sets[ex.sets.length - 1];
        return { ...ex, sets: [...ex.sets, { ...last }] };
      })
    );
  }

  function removeSet(exIdx: number, setIdx: number) {
    setDrafts((prev) =>
      prev.map((ex, i) =>
        i !== exIdx ? ex : { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) }
      )
    );
  }

  function validate(): string | null {
    for (const ex of drafts) {
      for (const s of ex.sets) {
        if (!s.weight.trim() || !s.reps.trim()) return "Completa todos los pesos y repeticiones.";
        if (isNaN(parseFloat(s.weight)) || isNaN(parseInt(s.reps)))
          return "Peso y repeticiones deben ser números.";
      }
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);

    const logSets: WorkoutSetLogInput[] = drafts.flatMap((ex) =>
      ex.sets.map((s, idx) => ({
        exerciseId: ex.exerciseId,
        setNumber: idx + 1,
        weight: parseFloat(s.weight),
        weightUnit: s.weightUnit,
        reps: parseInt(s.reps),
      }))
    );

    try {
      await createWorkoutLog(routineId, dayId, date, logSets);
      setOpen(false);
      setDrafts(initDrafts(exerciseTypes));
      router.refresh();
    } catch {
      setError("Error al guardar. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpen() {
    setDrafts(initDrafts(exerciseTypes));
    setError(null);
    setOpen(true);
  }

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Registrar entrenamiento
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-700 bg-zinc-900 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-700 bg-zinc-800/50">
        <h2 className="font-semibold">Registrar entrenamiento</h2>
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-400">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm text-white [color-scheme:dark]"
          />
        </div>
      </div>

      <div className="p-5 space-y-6">
        {exerciseTypes.map((et) => (
          <div key={et.id}>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-900/50 text-indigo-300 border border-indigo-800 mb-3">
              {et.name}
            </span>
            <div className="space-y-4 pl-2">
              {et.exercises.map((ex) => {
                const draftIdx = drafts.findIndex((d) => d.exerciseId === ex.id);
                const draft = drafts[draftIdx];
                if (!draft) return null;
                return (
                  <div key={ex.id} className="rounded-lg border border-zinc-700 bg-zinc-800 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-zinc-700">
                      <span className="text-sm font-medium">{ex.name}</span>
                    </div>
                    <div className="px-4 py-3 space-y-2">
                      <div className="grid grid-cols-[2rem_1fr_5rem_1fr_2rem] gap-2 text-xs text-zinc-500 uppercase mb-1">
                        <span>#</span>
                        <span>Peso</span>
                        <span>Unidad</span>
                        <span>Reps</span>
                        <span />
                      </div>
                      {draft.sets.map((s, setIdx) => (
                        <div key={setIdx} className="grid grid-cols-[2rem_1fr_5rem_1fr_2rem] gap-2 items-center">
                          <span className="text-xs text-zinc-500">{setIdx + 1}</span>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={s.weight}
                            onChange={(e) => updateSet(draftIdx, setIdx, "weight", e.target.value)}
                            className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm text-white text-right"
                          />
                          <select
                            value={s.weightUnit}
                            onChange={(e) => updateSet(draftIdx, setIdx, "weightUnit", e.target.value as "kg" | "lbs")}
                            className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm text-white"
                          >
                            <option value="kg">kg</option>
                            <option value="lbs">lbs</option>
                          </select>
                          <input
                            type="number"
                            min="1"
                            value={s.reps}
                            onChange={(e) => updateSet(draftIdx, setIdx, "reps", e.target.value)}
                            className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm text-white text-right"
                          />
                          <button
                            type="button"
                            onClick={() => removeSet(draftIdx, setIdx)}
                            disabled={draft.sets.length === 1}
                            className="text-zinc-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg leading-none"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addSet(draftIdx)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors mt-1"
                      >
                        + Serie
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {error && (
          <p className="text-sm text-red-400 bg-red-950/30 border border-red-800 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            {submitting ? "Guardando…" : "Guardar entrenamiento"}
          </button>
        </div>
      </div>
    </form>
  );
}
