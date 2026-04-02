import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const routines = sqliteTable("routines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const days = sqliteTable("days", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  routineId: integer("routine_id")
    .notNull()
    .references(() => routines.id, { onDelete: "cascade" }),
  dayNumber: integer("day_number").notNull(),
  label: text("label").notNull(),
});

export const exerciseTypes = sqliteTable("exercise_types", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  dayId: integer("day_id")
    .notNull()
    .references(() => days.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
});

export const exercises = sqliteTable("exercises", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  exerciseTypeId: integer("exercise_type_id")
    .notNull()
    .references(() => exerciseTypes.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  order: integer("order").notNull().default(0),
});

export const sets = sqliteTable("sets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "cascade" }),
  setNumber: integer("set_number").notNull(),
  weight: real("weight").notNull(),
  weightUnit: text("weight_unit", { enum: ["kg", "lbs"] })
    .notNull()
    .default("kg"),
  reps: integer("reps").notNull(),
});

export const routinesRelations = relations(routines, ({ many }) => ({
  days: many(days),
}));

export const daysRelations = relations(days, ({ one, many }) => ({
  routine: one(routines, { fields: [days.routineId], references: [routines.id] }),
  exerciseTypes: many(exerciseTypes),
}));

export const exerciseTypesRelations = relations(exerciseTypes, ({ one, many }) => ({
  day: one(days, { fields: [exerciseTypes.dayId], references: [days.id] }),
  exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  exerciseType: one(exerciseTypes, { fields: [exercises.exerciseTypeId], references: [exerciseTypes.id] }),
  sets: many(sets),
}));

export const setsRelations = relations(sets, ({ one }) => ({
  exercise: one(exercises, { fields: [sets.exerciseId], references: [exercises.id] }),
}));

export type Routine = typeof routines.$inferSelect;
export type Day = typeof days.$inferSelect;
export type ExerciseType = typeof exerciseTypes.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type Set = typeof sets.$inferSelect;
