"use client";

import { useRouter } from "next/navigation";
import { deleteWorkoutLog } from "@/lib/actions";

export default function DeleteLogButton({
  routineId,
  dayId,
  logId,
}: {
  routineId: number;
  dayId: number;
  logId: number;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("¿Eliminar este registro de entrenamiento?")) return;
    await deleteWorkoutLog(routineId, dayId, logId);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
    >
      Eliminar
    </button>
  );
}
