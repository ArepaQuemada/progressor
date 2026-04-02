"use client";

import { useRouter } from "next/navigation";
import { useRoutineForm } from "@/hooks/useRoutineForm";
import { Routes } from "@/lib/routes";
import DayCard from "./routine-form/DayCard";

export default function RoutineForm() {
  const router = useRouter();
  const {
    name,
    setName,
    numDays,
    setDayCount,
    dayDrafts,
    submitting,
    error,
    updateDayLabel,
    addExerciseType,
    removeExerciseType,
    updateExerciseTypeName,
    addExercise,
    removeExercise,
    updateExerciseName,
    addSet,
    removeSet,
    updateSet,
    handleSubmit,
  } = useRoutineForm();

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-zinc-300">
          Nombre de la rutina
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Rutina Fuerza 4 días"
          className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-zinc-300">
          Cantidad de días
        </label>
        <div className="flex gap-2">
          {[3, 4, 5, 6].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setDayCount(count)}
              className={`w-12 h-12 rounded-lg font-semibold text-sm transition-colors ${
                numDays === count
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {dayDrafts.map((day, dayIndex) => (
          <DayCard
            key={dayIndex}
            day={day}
            index={dayIndex}
            onLabelChange={(value) => updateDayLabel(dayIndex, value)}
            onAddExerciseType={() => addExerciseType(dayIndex)}
            onRemoveExerciseType={(exerciseTypeIndex) => removeExerciseType(dayIndex, exerciseTypeIndex)}
            onExerciseTypeNameChange={(exerciseTypeIndex, value) => updateExerciseTypeName(dayIndex, exerciseTypeIndex, value)}
            onAddExercise={(exerciseTypeIndex) => addExercise(dayIndex, exerciseTypeIndex)}
            onRemoveExercise={(exerciseTypeIndex, exerciseIndex) => removeExercise(dayIndex, exerciseTypeIndex, exerciseIndex)}
            onExerciseNameChange={(exerciseTypeIndex, exerciseIndex, value) => updateExerciseName(dayIndex, exerciseTypeIndex, exerciseIndex, value)}
            onAddSet={(exerciseTypeIndex, exerciseIndex) => addSet(dayIndex, exerciseTypeIndex, exerciseIndex)}
            onRemoveSet={(exerciseTypeIndex, exerciseIndex, setIndex) => removeSet(dayIndex, exerciseTypeIndex, exerciseIndex, setIndex)}
            onUpdateSet={(exerciseTypeIndex, exerciseIndex, setIndex, field, value) => updateSet(dayIndex, exerciseTypeIndex, exerciseIndex, setIndex, field, value)}
          />
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/30 border border-red-700 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push(Routes.home)}
          className="px-5 py-2.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Guardando..." : "Guardar rutina"}
        </button>
      </div>
    </form>
  );
}
