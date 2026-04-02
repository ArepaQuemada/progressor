"use server";

import { db } from "@/lib/db";
import { days, exerciseTypes, exercises, routines, sets } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
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
