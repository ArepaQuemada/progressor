"use client";

import type { RoutineDetail } from "@/lib/actions";

type SetData = RoutineDetail["days"][number]["exerciseTypes"][number]["exercises"][number]["sets"][number];

type Props = {
  exerciseId: number;
  index: number;
  name: string;
  image: string | null;
  sets: SetData[];
  open: boolean;
  onToggle: (id: number) => void;
};

export default function ExerciseCard({ exerciseId, index, name, image, sets, open, onToggle }: Props) {
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-800 overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(exerciseId)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-zinc-700/40 transition-colors cursor-pointer"
      >
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} className="w-8 h-8 rounded object-cover flex-shrink-0" />
        )}
        <span className="text-xs text-zinc-500 font-medium flex-shrink-0">{index + 1}.</span>
        <span className="text-sm font-medium text-white flex-1">{name}</span>
        {!open && (
          <span className="text-xs text-zinc-500 font-mono truncate max-w-[40%]">
            {sets.map((s) => `${s.weight}${s.weightUnit}×${s.reps}`).join("  ·  ")}
          </span>
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-zinc-500 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="px-4 py-3 border-t border-zinc-700">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-12" />
              <col />
              <col className="w-28" />
            </colgroup>
            <thead>
              <tr className="text-xs text-zinc-500 uppercase">
                <th className="text-left pb-2 font-medium">Serie</th>
                <th className="text-center pb-2 font-medium">Peso</th>
                <th className="text-right pb-2 font-medium">Reps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700/50">
              {sets.map((s) => (
                <tr key={s.id}>
                  <td className="py-2 text-zinc-400">{s.setNumber}</td>
                  <td className="py-2 text-center font-mono text-white">
                    {s.weight}{" "}
                    <span className="text-zinc-400 text-xs">{s.weightUnit}</span>
                  </td>
                  <td className="py-2 text-right font-mono text-white">
                    {s.reps}{" "}
                    <span className="text-zinc-400 text-xs">reps</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
