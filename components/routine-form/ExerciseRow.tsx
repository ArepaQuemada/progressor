import type { ExerciseDraft, SetDraft } from "@/hooks/useRoutineForm";
import SetRow from "./SetRow";

type Props = {
  exercise: ExerciseDraft;
  index: number;
  onNameChange: (value: string) => void;
  onImageChange: (image: string | null) => void;
  onRemove: () => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onUpdateSet: (setIndex: number, field: keyof SetDraft, value: string) => void;
};

export default function ExerciseRow({
  exercise,
  index,
  onNameChange,
  onImageChange,
  onRemove,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
}: Props) {
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onImageChange(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="rounded-lg border border-zinc-600 bg-zinc-700/50 p-3 space-y-3">
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

      {/* Image area */}
      <div className="pl-5 flex items-center gap-3">
        {exercise.image ? (
          <div className="relative flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={exercise.image}
              alt=""
              className="w-16 h-16 rounded-lg object-cover border border-zinc-600"
            />
            <button
              type="button"
              onClick={() => onImageChange(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-zinc-900 border border-zinc-600 text-zinc-400 hover:text-red-400 flex items-center justify-center text-xs leading-none transition-colors"
            >
              ×
            </button>
          </div>
        ) : null}
        <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          {exercise.image ? "Cambiar foto" : "Agregar foto"}
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
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
