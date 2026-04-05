"use client";

import { useCallback, useMemo, useState } from "react";
import ExerciseCard from "./ExerciseCard";
import type { RoutineDetail } from "@/lib/actions";

type ExerciseTypeData = RoutineDetail["days"][number]["exerciseTypes"][number];

type Props = {
  exerciseTypes: ExerciseTypeData[];
};

export default function DayExercisesSection({ exerciseTypes }: Props) {
  const allExerciseIds = useMemo(
    () => exerciseTypes.flatMap((et) => et.exercises.map((ex) => ex.id)),
    [exerciseTypes]
  );

  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  const allExpanded = allExerciseIds.length > 0 && allExerciseIds.every((id) => openIds.has(id));

  function toggleAll() {
    setOpenIds(allExpanded ? new Set() : new Set(allExerciseIds));
  }

  const toggle = useCallback((id: number) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  if (exerciseTypes.length === 0) {
    return <p className="text-zinc-500 text-sm">Sin ejercicios cargados.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={toggleAll}
          className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          {allExpanded ? "Colapsar todo" : "Expandir todo"}
        </button>
      </div>

      {exerciseTypes.map((et) => (
        <div key={et.id} className="space-y-3">
          {et.name.trim() && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-900/50 text-indigo-300 border border-indigo-800">
                {et.name}
              </span>
            </div>
          )}
          <div className="space-y-2 pl-2">
            {et.exercises.map((ex, idx) => (
              <ExerciseCard
                key={ex.id}
                exerciseId={ex.id}
                index={idx}
                name={ex.name}
                image={ex.image}
                sets={ex.sets}
                open={openIds.has(ex.id)}
                onToggle={toggle}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
