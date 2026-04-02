import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'

const testDb = vi.hoisted(() => ({ sqlite: null as any, db: null as any }))

vi.mock('@/lib/db', async () => {
  const Database = (await import('better-sqlite3')).default
  const { drizzle } = await import('drizzle-orm/better-sqlite3')
  const schema = await import('@/db/schema')
  const sqlite = new Database(':memory:')
  sqlite.pragma('foreign_keys = ON')
  testDb.sqlite = sqlite
  testDb.db = drizzle(sqlite, { schema })
  return { db: testDb.db }
})

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { createRoutine, listRoutines, getRoutine, deleteRoutine } from '@/lib/actions'
import { days } from '@/db/schema'

const DDL = `
  CREATE TABLE IF NOT EXISTS routines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    routine_id INTEGER NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    label TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS exercise_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_id INTEGER NOT NULL REFERENCES days(id) ON DELETE CASCADE,
    name TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_type_id INTEGER NOT NULL REFERENCES exercise_types(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    weight REAL NOT NULL,
    weight_unit TEXT NOT NULL DEFAULT 'kg',
    reps INTEGER NOT NULL
  );
`

const minimalRoutine = {
  name: 'Test Routine',
  days: [
    {
      dayNumber: 1,
      label: 'Day 1',
      exerciseTypes: [
        {
          name: 'Push',
          exercises: [
            {
              name: 'Bench Press',
              order: 0,
              sets: [{ setNumber: 1, weight: 80, weightUnit: 'kg' as const, reps: 8 }],
            },
          ],
        },
      ],
    },
  ],
}

beforeEach(() => {
  testDb.sqlite.exec('DROP TABLE IF EXISTS sets')
  testDb.sqlite.exec('DROP TABLE IF EXISTS exercises')
  testDb.sqlite.exec('DROP TABLE IF EXISTS exercise_types')
  testDb.sqlite.exec('DROP TABLE IF EXISTS days')
  testDb.sqlite.exec('DROP TABLE IF EXISTS routines')
  testDb.sqlite.exec(DDL)
})

afterAll(() => {
  testDb.sqlite.close()
})

describe('createRoutine', () => {
  it('returns the created routine with a numeric id and the given name', async () => {
    const result = await createRoutine(minimalRoutine)
    expect(result.id).toBeTypeOf('number')
    expect(result.name).toBe('Test Routine')
  })

  it('persists days, exercise types, exercises, and sets in the database', async () => {
    const created = await createRoutine(minimalRoutine)
    const detail = await getRoutine(created.id)
    expect(detail?.days).toHaveLength(1)
    expect(detail?.days[0].exerciseTypes[0].name).toBe('Push')
    expect(detail?.days[0].exerciseTypes[0].exercises[0].name).toBe('Bench Press')
    expect(detail?.days[0].exerciseTypes[0].exercises[0].sets[0].weight).toBe(80)
  })

  it('preserves the set weight unit', async () => {
    const created = await createRoutine(minimalRoutine)
    const detail = await getRoutine(created.id)
    expect(detail?.days[0].exerciseTypes[0].exercises[0].sets[0].weightUnit).toBe('kg')
  })

  it('stores multiple sets with ascending set numbers', async () => {
    const routine = {
      ...minimalRoutine,
      days: [{
        ...minimalRoutine.days[0],
        exerciseTypes: [{
          name: 'Push',
          exercises: [{
            name: 'Bench Press',
            order: 0,
            sets: [
              { setNumber: 1, weight: 80, weightUnit: 'kg' as const, reps: 8 },
              { setNumber: 2, weight: 80, weightUnit: 'kg' as const, reps: 8 },
              { setNumber: 3, weight: 75, weightUnit: 'kg' as const, reps: 6 },
            ],
          }],
        }],
      }],
    }
    const created = await createRoutine(routine)
    const detail = await getRoutine(created.id)
    expect(detail!.days[0].exerciseTypes[0].exercises[0].sets.map((s) => s.setNumber)).toEqual([1, 2, 3])
  })

  it('works with an empty days array', async () => {
    const result = await createRoutine({ name: 'Empty', days: [] })
    expect(result.name).toBe('Empty')
    const detail = await getRoutine(result.id)
    expect(detail?.days).toHaveLength(0)
  })
})

describe('listRoutines', () => {
  it('returns an empty array when no routines exist', async () => {
    const result = await listRoutines()
    expect(result).toEqual([])
  })

  it('returns all routines ordered by id ascending', async () => {
    await createRoutine({ name: 'First', days: [] })
    await createRoutine({ name: 'Second', days: [] })
    const result = await listRoutines()
    expect(result[0].name).toBe('First')
    expect(result[1].name).toBe('Second')
  })

  it('returns each routine with id, name, and createdAt fields', async () => {
    await createRoutine({ name: 'Alpha', days: [] })
    const [routine] = await listRoutines()
    expect(routine).toHaveProperty('id')
    expect(routine).toHaveProperty('name', 'Alpha')
    expect(routine).toHaveProperty('createdAt')
  })
})

describe('getRoutine', () => {
  it('returns null when the routine does not exist', async () => {
    const result = await getRoutine(9999)
    expect(result).toBeNull()
  })

  it('returns the routine detail for a valid id', async () => {
    const created = await createRoutine(minimalRoutine)
    const result = await getRoutine(created.id)
    expect(result?.name).toBe('Test Routine')
  })

  it('returns days ordered by day_number ascending', async () => {
    const routine = {
      name: 'Multi-day',
      days: [
        { dayNumber: 3, label: 'Day 3', exerciseTypes: [] },
        { dayNumber: 1, label: 'Day 1', exerciseTypes: [] },
        { dayNumber: 2, label: 'Day 2', exerciseTypes: [] },
      ],
    }
    const created = await createRoutine(routine)
    const result = await getRoutine(created.id)
    expect(result!.days.map((d) => d.dayNumber)).toEqual([1, 2, 3])
  })

  it('returns exercises ordered by order field ascending', async () => {
    const routine = {
      name: 'Ordered Exercises',
      days: [{
        dayNumber: 1,
        label: 'Day 1',
        exerciseTypes: [{
          name: 'Push',
          exercises: [
            { name: 'B', order: 1, sets: [{ setNumber: 1, weight: 50, weightUnit: 'kg' as const, reps: 10 }] },
            { name: 'A', order: 0, sets: [{ setNumber: 1, weight: 60, weightUnit: 'kg' as const, reps: 10 }] },
          ],
        }],
      }],
    }
    const created = await createRoutine(routine)
    const result = await getRoutine(created.id)
    expect(result!.days[0].exerciseTypes[0].exercises.map((e) => e.name)).toEqual(['A', 'B'])
  })
})

describe('deleteRoutine', () => {
  it('removes the routine so it no longer appears in the list', async () => {
    const created = await createRoutine(minimalRoutine)
    await deleteRoutine(created.id)
    const list = await listRoutines()
    expect(list.find((r) => r.id === created.id)).toBeUndefined()
  })

  it('cascades deletion to child day rows', async () => {
    const created = await createRoutine(minimalRoutine)
    await deleteRoutine(created.id)
    const remainingDays = await testDb.db.select().from(days)
    expect(remainingDays).toHaveLength(0)
  })

  it('does not throw when called with a non-existent id', async () => {
    await expect(deleteRoutine(9999)).resolves.not.toThrow()
  })

  it('only deletes the targeted routine, leaving others intact', async () => {
    const first = await createRoutine({ name: 'First', days: [] })
    const second = await createRoutine({ name: 'Second', days: [] })
    await deleteRoutine(first.id)
    const list = await listRoutines()
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe(second.id)
  })
})
