import type { ExerciseDraft, SetDraft } from "@/hooks/useRoutineForm";
import ExerciseRow from "./ExerciseRow";

type Props = {
  exerciseType: { exercises: ExerciseDraft[] };
  onRemove: () => void;
  onAddExercise: () => void;
  onRemoveExercise: (exerciseIndex: number) => void;
  onExerciseNameChange: (exerciseIndex: number, value: string) => void;
  onExerciseImageChange: (exerciseIndex: number, image: string | null) => void;
  onAddSet: (exerciseIndex: number) => void;
  onRemoveSet: (exerciseIndex: number, setIndex: number) => void;
  onUpdateSet: (exerciseIndex: number, setIndex: number, field: keyof SetDraft, value: string) => void;
};

export default function ExerciseTypeCard({
  exerciseType,
  onRemove,
  onAddExercise,
  onRemoveExercise,
  onExerciseNameChange,
  onExerciseImageChange,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
}: Props) {
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4 space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-700 transition-colors text-xs"
        >
          Eliminar grupo
        </button>
      </div>

      <div className="space-y-3">
        {exerciseType.exercises.map((exercise, exerciseIndex) => (
          <ExerciseRow
            key={exerciseIndex}
            exercise={exercise}
            index={exerciseIndex}
            onNameChange={(value) => onExerciseNameChange(exerciseIndex, value)}
            onImageChange={(image) => onExerciseImageChange(exerciseIndex, image)}
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
