import type { DayDraft, SetDraft } from "@/hooks/useRoutineForm";
import ExerciseTypeCard from "./ExerciseTypeCard";

type Props = {
  day: DayDraft;
  index: number;
  onLabelChange: (value: string) => void;
  onAddExerciseType: () => void;
  onRemoveExerciseType: (exerciseTypeIndex: number) => void;
  onAddExercise: (exerciseTypeIndex: number) => void;
  onRemoveExercise: (exerciseTypeIndex: number, exerciseIndex: number) => void;
  onExerciseNameChange: (exerciseTypeIndex: number, exerciseIndex: number, value: string) => void;
  onExerciseImageChange: (exerciseTypeIndex: number, exerciseIndex: number, image: string | null) => void;
  onAddSet: (exerciseTypeIndex: number, exerciseIndex: number) => void;
  onRemoveSet: (exerciseTypeIndex: number, exerciseIndex: number, setIndex: number) => void;
  onUpdateSet: (exerciseTypeIndex: number, exerciseIndex: number, setIndex: number, field: keyof SetDraft, value: string) => void;
};

export default function DayCard({
  day,
  index,
  onLabelChange,
  onAddExerciseType,
  onRemoveExerciseType,
  onAddExercise,
  onRemoveExercise,
  onExerciseNameChange,
  onExerciseImageChange,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
}: Props) {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
          {index + 1}
        </span>
        <input
          type="text"
          value={day.label}
          onChange={(e) => onLabelChange(e.target.value)}
          placeholder={`Nombre del día ${index + 1}`}
          className="flex-1 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="space-y-4 pl-4 border-l-2 border-zinc-700">
        {day.exerciseTypes.map((exerciseType, exerciseTypeIndex) => (
          <ExerciseTypeCard
            key={exerciseTypeIndex}
            exerciseType={exerciseType}
            onRemove={() => onRemoveExerciseType(exerciseTypeIndex)}
            onAddExercise={() => onAddExercise(exerciseTypeIndex)}
            onRemoveExercise={(exerciseIndex) => onRemoveExercise(exerciseTypeIndex, exerciseIndex)}
            onExerciseNameChange={(exerciseIndex, value) => onExerciseNameChange(exerciseTypeIndex, exerciseIndex, value)}
            onExerciseImageChange={(exerciseIndex, image) => onExerciseImageChange(exerciseTypeIndex, exerciseIndex, image)}
            onAddSet={(exerciseIndex) => onAddSet(exerciseTypeIndex, exerciseIndex)}
            onRemoveSet={(exerciseIndex, setIndex) => onRemoveSet(exerciseTypeIndex, exerciseIndex, setIndex)}
            onUpdateSet={(exerciseIndex, setIndex, field, value) => onUpdateSet(exerciseTypeIndex, exerciseIndex, setIndex, field, value)}
          />
        ))}
        <button
          type="button"
          onClick={onAddExerciseType}
          className="w-full rounded-lg border border-dashed border-zinc-700 py-2.5 text-sm text-zinc-500 hover:text-zinc-400 hover:border-zinc-600 transition-colors"
        >
          + Agregar grupo de ejercicios
        </button>
      </div>
    </div>
  );
}
