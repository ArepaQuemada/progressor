"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoutine, type RoutineInput } from "@/lib/actions";
import { Routes } from "@/lib/routes";

export type SetDraft = { weight: string; weightUnit: "kg" | "lbs"; reps: string };
export type ExerciseDraft = { name: string; image: string | null; sets: SetDraft[] };
export type ExerciseTypeDraft = { name: string; exercises: ExerciseDraft[] };
export type DayDraft = { label: string; exerciseTypes: ExerciseTypeDraft[] };

const DEFAULT_SET: SetDraft = { weight: "", weightUnit: "kg", reps: "" };

function emptyDay(index: number): DayDraft {
  return { label: `Día ${index + 1}`, exerciseTypes: [] };
}

function updateAt<T>(arr: T[], index: number, updater: (item: T) => T): T[] {
  return arr.map((item, i) => (i === index ? updater(item) : item));
}

function validateForm(name: string, days: DayDraft[]): string | null {
  if (!name.trim()) return "El nombre de la rutina es requerido.";

  for (const [dayIndex, day] of days.entries()) {
    if (!day.label.trim()) return `El día ${dayIndex + 1} necesita un nombre.`;

    for (const [, exerciseType] of day.exerciseTypes.entries()) {
      for (const [exerciseIndex, exercise] of exerciseType.exercises.entries()) {
        if (!exercise.name.trim())
          return `Día ${dayIndex + 1}: el ejercicio #${exerciseIndex + 1} necesita nombre.`;
        if (exercise.sets.length === 0)
          return `Día ${dayIndex + 1} › ${exercise.name}: agregá al menos una serie.`;

        for (const [setIndex, set] of exercise.sets.entries()) {
          if (!set.weight || !set.reps)
            return `Día ${dayIndex + 1} › ${exercise.name}: serie ${setIndex + 1} incompleta.`;
        }
      }
    }
  }

  return null;
}

function toRoutineInput(name: string, days: DayDraft[]): RoutineInput {
  return {
    name: name.trim(),
    days: days.map((day, dayIndex) => ({
      dayNumber: dayIndex + 1,
      label: day.label.trim(),
      exerciseTypes: day.exerciseTypes.map((exerciseType) => ({
        name: exerciseType.name.trim(),
        exercises: exerciseType.exercises.map((exercise, exerciseIndex) => ({
          name: exercise.name.trim(),
          order: exerciseIndex,
          image: exercise.image,
          sets: exercise.sets.map((set, setIndex) => ({
            setNumber: setIndex + 1,
            weight: parseFloat(set.weight),
            weightUnit: set.weightUnit,
            reps: parseInt(set.reps),
          })),
        })),
      })),
    })),
  };
}

export function useRoutineForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [numDays, setNumDays] = useState(3);
  const [dayDrafts, setDayDrafts] = useState<DayDraft[]>(() =>
    Array.from({ length: 3 }, (_, index) => emptyDay(index))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setDayCount(count: number) {
    setNumDays(count);
    setDayDrafts((prev) =>
      count > prev.length
        ? [
            ...prev,
            ...Array.from({ length: count - prev.length }, (_, index) =>
              emptyDay(prev.length + index)
            ),
          ]
        : prev.slice(0, count)
    );
  }

  function updateDayLabel(dayIndex: number, label: string) {
    setDayDrafts((prev) => updateAt(prev, dayIndex, (day) => ({ ...day, label })));
  }

  function addExerciseType(dayIndex: number) {
    setDayDrafts((prev) =>
      updateAt(prev, dayIndex, (day) => ({
        ...day,
        exerciseTypes: [...day.exerciseTypes, { name: "", exercises: [] as ExerciseDraft[] }],
      }))
    );
  }

  function removeExerciseType(dayIndex: number, exerciseTypeIndex: number) {
    setDayDrafts((prev) =>
      updateAt(prev, dayIndex, (day) => ({
        ...day,
        exerciseTypes: day.exerciseTypes.filter((_, index) => index !== exerciseTypeIndex),
      }))
    );
  }

  function updateExerciseTypeName(dayIndex: number, exerciseTypeIndex: number, value: string) {
    setDayDrafts((prev) =>
      updateAt(prev, dayIndex, (day) => ({
        ...day,
        exerciseTypes: updateAt(day.exerciseTypes, exerciseTypeIndex, (exerciseType) => ({
          ...exerciseType,
          name: value,
        })),
      }))
    );
  }

  function addExercise(dayIndex: number, exerciseTypeIndex: number) {
    setDayDrafts((prev) =>
      updateAt(prev, dayIndex, (day) => ({
        ...day,
        exerciseTypes: updateAt(day.exerciseTypes, exerciseTypeIndex, (exerciseType) => ({
          ...exerciseType,
          exercises: [...exerciseType.exercises, { name: "", image: null, sets: [{ ...DEFAULT_SET }] }],
        })),
      }))
    );
  }

  function removeExercise(dayIndex: number, exerciseTypeIndex: number, exerciseIndex: number) {
    setDayDrafts((prev) =>
      updateAt(prev, dayIndex, (day) => ({
        ...day,
        exerciseTypes: updateAt(day.exerciseTypes, exerciseTypeIndex, (exerciseType) => ({
          ...exerciseType,
          exercises: exerciseType.exercises.filter((_, index) => index !== exerciseIndex),
        })),
      }))
    );
  }

  function updateExerciseName(
    dayIndex: number,
    exerciseTypeIndex: number,
    exerciseIndex: number,
    value: string
  ) {
    setDayDrafts((prev) =>
      updateAt(prev, dayIndex, (day) => ({
        ...day,
        exerciseTypes: updateAt(day.exerciseTypes, exerciseTypeIndex, (exerciseType) => ({
          ...exerciseType,
          exercises: updateAt(exerciseType.exercises, exerciseIndex, (exercise) => ({
            ...exercise,
            name: value,
          })),
        })),
      }))
    );
  }

  function updateExerciseImage(
    dayIndex: number,
    exerciseTypeIndex: number,
    exerciseIndex: number,
    image: string | null
  ) {
    setDayDrafts((prev) =>
      updateAt(prev, dayIndex, (day) => ({
        ...day,
        exerciseTypes: updateAt(day.exerciseTypes, exerciseTypeIndex, (exerciseType) => ({
          ...exerciseType,
          exercises: updateAt(exerciseType.exercises, exerciseIndex, (exercise) => ({
            ...exercise,
            image,
          })),
        })),
      }))
    );
  }

  function addSet(dayIndex: number, exerciseTypeIndex: number, exerciseIndex: number) {
    setDayDrafts((prev) =>
      updateAt(prev, dayIndex, (day) => ({
        ...day,
        exerciseTypes: updateAt(day.exerciseTypes, exerciseTypeIndex, (exerciseType) => ({
          ...exerciseType,
          exercises: updateAt(exerciseType.exercises, exerciseIndex, (exercise) => ({
            ...exercise,
            sets: [...exercise.sets, { ...DEFAULT_SET }],
          })),
        })),
      }))
    );
  }

  function removeSet(
    dayIndex: number,
    exerciseTypeIndex: number,
    exerciseIndex: number,
    setIndex: number
  ) {
    setDayDrafts((prev) =>
      updateAt(prev, dayIndex, (day) => ({
        ...day,
        exerciseTypes: updateAt(day.exerciseTypes, exerciseTypeIndex, (exerciseType) => ({
          ...exerciseType,
          exercises: updateAt(exerciseType.exercises, exerciseIndex, (exercise) => ({
            ...exercise,
            sets: exercise.sets.filter((_, index) => index !== setIndex),
          })),
        })),
      }))
    );
  }

  function updateSet(
    dayIndex: number,
    exerciseTypeIndex: number,
    exerciseIndex: number,
    setIndex: number,
    field: keyof SetDraft,
    value: string
  ) {
    setDayDrafts((prev) =>
      updateAt(prev, dayIndex, (day) => ({
        ...day,
        exerciseTypes: updateAt(day.exerciseTypes, exerciseTypeIndex, (exerciseType) => ({
          ...exerciseType,
          exercises: updateAt(exerciseType.exercises, exerciseIndex, (exercise) => ({
            ...exercise,
            sets: updateAt(exercise.sets, setIndex, (set) => ({ ...set, [field]: value })),
          })),
        })),
      }))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateForm(name, dayDrafts);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const routine = await createRoutine(toRoutineInput(name, dayDrafts));
      router.push(Routes.routines.detail(routine.id));
    } catch {
      setError("Error al guardar la rutina. Intentá de nuevo.");
      setSubmitting(false);
    }
  }

  return {
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
    updateExerciseImage,
    addSet,
    removeSet,
    updateSet,
    handleSubmit,
  };
}
