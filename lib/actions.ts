"use server";

import { db } from "@/db/client";
import { days, exerciseTypes, exercises, routines, sets, workoutLogs, workoutSets } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type SetInput = {
  setNumber: number;
  weight: number;
  weightUnit: "kg" | "lbs";
  reps: number;
};

export type ExerciseInput = {
  name: string;
  order: number;
  image?: string | null;
  sets: SetInput[];
};

export type ExerciseTypeInput = {
  name: string;
  exercises: ExerciseInput[];
};

export type DayInput = {
  dayNumber: number;
  label: string;
  exerciseTypes: ExerciseTypeInput[];
};

export type RoutineInput = {
  name: string;
  days: DayInput[];
};

export type RoutineDetail = {
  id: number;
  name: string;
  createdAt: string;
  days: {
    id: number;
    dayNumber: number;
    label: string;
    exerciseTypes: {
      id: number;
      name: string;
      exercises: {
        id: number;
        name: string;
        order: number;
        image: string | null;
        sets: {
          id: number;
          setNumber: number;
          weight: number;
          weightUnit: "kg" | "lbs";
          reps: number;
        }[];
      }[];
    }[];
  }[];
};

export type WorkoutSetLogInput = {
  exerciseId: number;
  setNumber: number;
  weight: number;
  weightUnit: "kg" | "lbs";
  reps: number;
};

export type WorkoutLogDetail = {
  id: number;
  dayId: number;
  loggedAt: string;
  sets: {
    id: number;
    logId: number;
    exerciseId: number;
    setNumber: number;
    weight: number;
    weightUnit: "kg" | "lbs";
    reps: number;
    exercise: { id: number; name: string };
  }[];
};

export async function createRoutine(input: RoutineInput) {
  const [routine] = await db
    .insert(routines)
    .values({ name: input.name })
    .returning();

  for (const day of input.days) {
    const [dayRow] = await db
      .insert(days)
      .values({
        routineId: routine.id,
        dayNumber: day.dayNumber,
        label: day.label,
      })
      .returning();

    for (const et of day.exerciseTypes) {
      const [etRow] = await db
        .insert(exerciseTypes)
        .values({ dayId: dayRow.id, name: et.name })
        .returning();

      for (const ex of et.exercises) {
        const [exRow] = await db
          .insert(exercises)
          .values({
            exerciseTypeId: etRow.id,
            name: ex.name,
            order: ex.order,
            image: ex.image ?? null,
          })
          .returning();

        for (const s of ex.sets) {
          await db.insert(sets).values({
            exerciseId: exRow.id,
            setNumber: s.setNumber,
            weight: s.weight,
            weightUnit: s.weightUnit,
            reps: s.reps,
          });
        }
      }
    }
  }

  revalidatePath("/");
  return routine;
}

export async function listRoutines() {
  return db.select().from(routines).orderBy(routines.id);
}

export async function getRoutine(id: number): Promise<RoutineDetail | null> {
  const routine = await db.query.routines.findFirst({
    where: eq(routines.id, id),
    with: {
      days: {
        orderBy: asc(days.dayNumber),
        with: {
          exerciseTypes: {
            with: {
              exercises: {
                orderBy: asc(exercises.order),
                with: {
                  sets: {
                    orderBy: asc(sets.setNumber),
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!routine) return null;

  return routine as RoutineDetail;
}

export async function deleteRoutine(id: number) {
  await db.delete(routines).where(eq(routines.id, id));
  revalidatePath("/");
}

export async function createWorkoutLog(
  routineId: number,
  dayId: number,
  loggedAt: string,
  logSets: WorkoutSetLogInput[]
) {
  const [log] = await db
    .insert(workoutLogs)
    .values({ dayId, loggedAt })
    .returning();

  for (const s of logSets) {
    await db.insert(workoutSets).values({
      logId: log.id,
      exerciseId: s.exerciseId,
      setNumber: s.setNumber,
      weight: s.weight,
      weightUnit: s.weightUnit,
      reps: s.reps,
    });
  }

  revalidatePath(`/routines/${routineId}/days/${dayId}`);
}

export async function getWorkoutLogsForDay(dayId: number): Promise<WorkoutLogDetail[]> {
  const logs = await db.query.workoutLogs.findMany({
    where: eq(workoutLogs.dayId, dayId),
    orderBy: desc(workoutLogs.loggedAt),
    with: {
      sets: {
        orderBy: asc(workoutSets.setNumber),
        with: {
          exercise: true,
        },
      },
    },
  });
  return logs as WorkoutLogDetail[];
}

export async function deleteWorkoutLog(routineId: number, dayId: number, logId: number) {
  await db.delete(workoutLogs).where(eq(workoutLogs.id, logId));
  revalidatePath(`/routines/${routineId}/days/${dayId}`);
}
