import type { ExerciseTypeDraft, SetDraft } from "@/hooks/useRoutineForm";
import ExerciseRow from "./ExerciseRow";

type Props = {
  exerciseType: ExerciseTypeDraft;
  onNameChange: (value: string) => void;
  onRemove: () => void;
  onAddExercise: () => void;
  onRemoveExercise: (exerciseIndex: number) => void;
  onExerciseNameChange: (exerciseIndex: number, value: string) => void;
  onAddSet: (exerciseIndex: number) => void;
  onRemoveSet: (exerciseIndex: number, setIndex: number) => void;
  onUpdateSet: (exerciseIndex: number, setIndex: number, field: keyof SetDraft, value: string) => void;
};

export default function ExerciseTypeCard({
  exerciseType,
  onNameChange,
  onRemove,
  onAddExercise,
  onRemoveExercise,
  onExerciseNameChange,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
}: Props) {
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={exerciseType.name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Tipo de ejercicio (Ej: Pull, Push, Pierna...)"
          className="flex-1 rounded-lg bg-zinc-700 border border-zinc-600 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={onRemove}
          className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-700 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {exerciseType.exercises.map((exercise, exerciseIndex) => (
          <ExerciseRow
            key={exerciseIndex}
            exercise={exercise}
            index={exerciseIndex}
            onNameChange={(value) => onExerciseNameChange(exerciseIndex, value)}
            onRemove={() => onRemoveExercise(exerciseIndex)}
            onAddSet={() => onAddSet(exerciseIndex)}
            onRemoveSet={(setIndex) => onRemoveSet(exerciseIndex, setIndex)}
            onUpdateSet={(setIndex, field, value) => onUpdateSet(exerciseIndex, setIndex, field, value)}
          />
        ))}
        <button
          type="button"
          onClick={onAddExercise}
          className="w-full rounded-lg border border-dashed border-zinc-600 py-2 text-sm text-zinc-400 hover:text-zinc-300 hover:border-zinc-500 transition-colors"
        >
          + Agregar ejercicio
        </button>
      </div>
    </div>
  );
}
