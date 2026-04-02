import type { SetDraft } from "@/hooks/useRoutineForm";

type Props = {
  set: SetDraft;
  index: number;
  canRemove: boolean;
  onUpdate: (field: keyof SetDraft, value: string) => void;
  onRemove: () => void;
};

export default function SetRow({ set, index, canRemove, onUpdate, onRemove }: Props) {
  return (
    <div className="grid grid-cols-[2rem_1fr_5rem_1fr_2rem] gap-2 items-center">
      <span className="text-xs text-zinc-500 text-center">{index + 1}</span>
      <input
        type="number"
        min="0"
        step="0.5"
        value={set.weight}
        onChange={(e) => onUpdate("weight", e.target.value)}
        placeholder="0"
        className="rounded-md bg-zinc-700 border border-zinc-600 px-2 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
      />
      <select
        value={set.weightUnit}
        onChange={(e) => onUpdate("weightUnit", e.target.value)}
        className="rounded-md bg-zinc-700 border border-zinc-600 px-2 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="kg">kg</option>
        <option value="lbs">lbs</option>
      </select>
      <input
        type="number"
        min="1"
        value={set.reps}
        onChange={(e) => onUpdate("reps", e.target.value)}
        placeholder="0"
        className="rounded-md bg-zinc-700 border border-zinc-600 px-2 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
      />
      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        className="text-zinc-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
      >
        ✕
      </button>
    </div>
  );
}
