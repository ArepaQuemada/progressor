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
  image: text("image"),
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

export const workoutLogs = sqliteTable("workout_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  dayId: integer("day_id")
    .notNull()
    .references(() => days.id, { onDelete: "cascade" }),
  loggedAt: text("logged_at").notNull(),
});

export const workoutSets = sqliteTable("workout_sets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  logId: integer("log_id")
    .notNull()
    .references(() => workoutLogs.id, { onDelete: "cascade" }),
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
  workoutLogs: many(workoutLogs),
}));

export const exerciseTypesRelations = relations(exerciseTypes, ({ one, many }) => ({
  day: one(days, { fields: [exerciseTypes.dayId], references: [days.id] }),
  exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  exerciseType: one(exerciseTypes, { fields: [exercises.exerciseTypeId], references: [exerciseTypes.id] }),
  sets: many(sets),
  workoutSets: many(workoutSets),
}));

export const setsRelations = relations(sets, ({ one }) => ({
  exercise: one(exercises, { fields: [sets.exerciseId], references: [exercises.id] }),
}));

export const workoutLogsRelations = relations(workoutLogs, ({ one, many }) => ({
  day: one(days, { fields: [workoutLogs.dayId], references: [days.id] }),
  sets: many(workoutSets),
}));

export const workoutSetsRelations = relations(workoutSets, ({ one }) => ({
  log: one(workoutLogs, { fields: [workoutSets.logId], references: [workoutLogs.id] }),
  exercise: one(exercises, { fields: [workoutSets.exerciseId], references: [exercises.id] }),
}));

export type Routine = typeof routines.$inferSelect;
export type Day = typeof days.$inferSelect;
export type ExerciseType = typeof exerciseTypes.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type Set = typeof sets.$inferSelect;
export type WorkoutLog = typeof workoutLogs.$inferSelect;
export type WorkoutSet = typeof workoutSets.$inferSelect;
