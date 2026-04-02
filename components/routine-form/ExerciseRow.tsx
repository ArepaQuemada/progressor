import type { ExerciseDraft, SetDraft } from "@/hooks/useRoutineForm";
import SetRow from "./SetRow";

type Props = {
  exercise: ExerciseDraft;
  index: number;
  onNameChange: (value: string) => void;
  onRemove: () => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onUpdateSet: (setIndex: number, field: keyof SetDraft, value: string) => void;
};

export default function ExerciseRow({
  exercise,
  index,
  onNameChange,
  onRemove,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
}: Props) {
  return (
    <div
      className="rounded-lg border border-zinc-600 bg-zinc-700/50 p-3 space-y-3"
    >
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500 font-medium w-5">{index + 1}.</span>
        <input
          type="text"
          value={exercise.name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Nombre del ejercicio"
          className="flex-1 rounded-md bg-zinc-700 border border-zinc-600 px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-700 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="pl-5 space-y-2">
        <div className="grid grid-cols-[2rem_1fr_5rem_1fr_2rem] gap-2 text-xs text-zinc-500 font-medium px-1">
          <span>#</span>
          <span>Peso</span>
          <span>Unidad</span>
          <span>Reps</span>
          <span></span>
        </div>
        {exercise.sets.map((set, setIndex) => (
          <SetRow
            key={setIndex}
            set={set}
            index={setIndex}
            canRemove={exercise.sets.length > 1}
            onUpdate={(field, value) => onUpdateSet(setIndex, field, value)}
            onRemove={() => onRemoveSet(setIndex)}
          />
        ))}
        <button
          type="button"
          onClick={onAddSet}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          + Agregar serie
        </button>
      </div>
    </div>
  );
}
