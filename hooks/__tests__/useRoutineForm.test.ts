// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRoutineForm } from '@/hooks/useRoutineForm'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/lib/actions', () => ({
  createRoutine: vi.fn(),
}))

import { createRoutine } from '@/lib/actions'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useRoutineForm', () => {
  describe('initial state', () => {
    it('starts with an empty name', () => {
      const { result } = renderHook(() => useRoutineForm())
      expect(result.current.name).toBe('')
    })

    it('starts with numDays equal to 3', () => {
      const { result } = renderHook(() => useRoutineForm())
      expect(result.current.numDays).toBe(3)
    })

    it('starts with 3 day drafts', () => {
      const { result } = renderHook(() => useRoutineForm())
      expect(result.current.dayDrafts).toHaveLength(3)
    })

    it('initialises day labels as "Día N"', () => {
      const { result } = renderHook(() => useRoutineForm())
      expect(result.current.dayDrafts[0].label).toBe('Día 1')
      expect(result.current.dayDrafts[2].label).toBe('Día 3')
    })

    it('starts with no error', () => {
      const { result } = renderHook(() => useRoutineForm())
      expect(result.current.error).toBeNull()
    })

    it('starts with submitting false', () => {
      const { result } = renderHook(() => useRoutineForm())
      expect(result.current.submitting).toBe(false)
    })
  })

  describe('setDayCount', () => {
    it('adds new day drafts when the count is increased', () => {
      const { result } = renderHook(() => useRoutineForm())
      act(() => result.current.setDayCount(5))
      expect(result.current.dayDrafts).toHaveLength(5)
    })

    it('removes trailing day drafts when the count is decreased', () => {
      const { result } = renderHook(() => useRoutineForm())
      act(() => result.current.setDayCount(6))
      act(() => result.current.setDayCount(3))
      expect(result.current.dayDrafts).toHaveLength(3)
    })

    it('preserves existing day data when increasing', () => {
      const { result } = renderHook(() => useRoutineForm())
      act(() => result.current.updateDayLabel(0, 'Push'))
      act(() => result.current.setDayCount(4))
      expect(result.current.dayDrafts[0].label).toBe('Push')
    })

    it('labels new days with the correct index', () => {
      const { result } = renderHook(() => useRoutineForm())
      act(() => result.current.setDayCount(4))
      expect(result.current.dayDrafts[3].label).toBe('Día 4')
    })

    it('updates numDays', () => {
      const { result } = renderHook(() => useRoutineForm())
      act(() => result.current.setDayCount(6))
      expect(result.current.numDays).toBe(6)
    })
  })

  describe('updateDayLabel', () => {
    it('updates the label of the specified day', () => {
      const { result } = renderHook(() => useRoutineForm())
      act(() => result.current.updateDayLabel(1, 'Legs'))
      expect(result.current.dayDrafts[1].label).toBe('Legs')
    })

    it('does not mutate other days', () => {
      const { result } = renderHook(() => useRoutineForm())
      act(() => result.current.updateDayLabel(1, 'Legs'))
      expect(result.current.dayDrafts[0].label).toBe('Día 1')
      expect(result.current.dayDrafts[2].label).toBe('Día 3')
    })
  })

  describe('addExerciseType / removeExerciseType', () => {
    it('adds an exercise type with an empty name to the specified day', () => {
      const { result } = renderHook(() => useRoutineForm())
      act(() => result.current.addExerciseType(0))
      expect(result.current.dayDrafts[0].exerciseTypes).toHaveLength(1)
      expect(result.current.dayDrafts[0].exerciseTypes[0].name).toBe('')
    })

    it('removes the exercise type at the given index', () => {
      const { result } = renderHook(() => useRoutineForm())
      act(() => result.current.addExerciseType(0))
      act(() => result.current.addExerciseType(0))
      act(() => result.current.updateExerciseTypeName(0, 0, 'Push'))
      act(() => result.current.updateExerciseTypeName(0, 1, 'Pull'))
      act(() => result.current.removeExerciseType(0, 0))
      expect(result.current.dayDrafts[0].exerciseTypes).toHaveLength(1)
      expect(result.current.dayDrafts[0].exerciseTypes[0].name).toBe('Pull')
    })
  })

  describe('updateExerciseTypeName', () => {
    it('updates the name of the specified exercise type', () => {
      const { result } = renderHook(() => useRoutineForm())
      act(() => result.current.addExerciseType(0))
      act(() => result.current.updateExerciseTypeName(0, 0, 'Push'))
      expect(result.current.dayDrafts[0].exerciseTypes[0].name).toBe('Push')
    })
  })

  describe('addExercise / removeExercise', () => {
    it('adds an exercise with an empty name and one default set', () => {
      const { result } = renderHook(() => useRoutineForm())
      act(() => result.current.addExerciseType(0))
      act(() => result.current.addExercise(0, 0))
      const exercise = result.current.dayDrafts[0].exerciseTypes[0].exercises[0]
      expect(exercise.name).toBe('')
      expect(exercise.sets).toHaveLength(1)
    })

    it('removes the exercise at the given index', () => {
      const { result } = renderHook(() => useRoutineForm())
      act(() => result.current.addExerciseType(0))
      act(() => result.current.addExercise(0, 0))
      act(() => result.current.addExercise(0, 0))
      act(() => result.current.updateExerciseName(0, 0, 0, 'Bench'))
      act(() => result.current.updateExerciseName(0, 0, 1, 'Incline'))
      act(() => result.current.removeExercise(0, 0, 0))
      expect(result.current.dayDrafts[0].exerciseTypes[0].exercises).toHaveLength(1)
      expect(result.current.dayDrafts[0].exerciseTypes[0].exercises[0].name).toBe('Incline')
    })
  })

  describe('addSet / removeSet / updateSet', () => {
    it('adds a set to the specified exercise', () => {
      const { result } = renderHook(() => useRoutineForm())
      act(() => result.current.addExerciseType(0))
      act(() => result.current.addExercise(0, 0))
      act(() => result.current.addSet(0, 0, 0))
      expect(result.current.dayDrafts[0].exerciseTypes[0].exercises[0].sets).toHaveLength(2)
    })

    it('removes the set at the given index', () => {
      const { result } = renderHook(() => useRoutineForm())
      act(() => result.current.addExerciseType(0))
      act(() => result.current.addExercise(0, 0))
      act(() => result.current.addSet(0, 0, 0))
      act(() => result.current.removeSet(0, 0, 0, 0))
      expect(result.current.dayDrafts[0].exerciseTypes[0].exercises[0].sets).toHaveLength(1)
    })

    it('updates a field on the specified set', () => {
      const { result } = renderHook(() => useRoutineForm())
      act(() => result.current.addExerciseType(0))
      act(() => result.current.addExercise(0, 0))
      act(() => result.current.updateSet(0, 0, 0, 0, 'weight', '100'))
      expect(result.current.dayDrafts[0].exerciseTypes[0].exercises[0].sets[0].weight).toBe('100')
    })

    it('updates the weightUnit field', () => {
      const { result } = renderHook(() => useRoutineForm())
      act(() => result.current.addExerciseType(0))
      act(() => result.current.addExercise(0, 0))
      act(() => result.current.updateSet(0, 0, 0, 0, 'weightUnit', 'lbs'))
      expect(result.current.dayDrafts[0].exerciseTypes[0].exercises[0].sets[0].weightUnit).toBe('lbs')
    })
  })

  describe('handleSubmit — validation errors', () => {
    it('sets an error when the routine name is blank', async () => {
      const { result } = renderHook(() => useRoutineForm())
      await act(() => result.current.handleSubmit({ preventDefault: vi.fn() } as any))
      expect(result.current.error).toBe('El nombre de la rutina es requerido.')
    })

    it('sets an error when a day label is blank', async () => {
      const { result } = renderHook(() => useRoutineForm())
      act(() => result.current.setName('My Routine'))
      act(() => result.current.updateDayLabel(0, '  '))
      await act(() => result.current.handleSubmit({ preventDefault: vi.fn() } as any))
      expect(result.current.error).toMatch(/día 1 necesita un nombre/i)
    })

    it('sets an error when an exercise type name is blank', async () => {
      const { result } = renderHook(() => useRoutineForm())
      act(() => result.current.setName('My Routine'))
      act(() => result.current.addExerciseType(0))
      await act(() => result.current.handleSubmit({ preventDefault: vi.fn() } as any))
      expect(result.current.error).toMatch(/tipo de ejercicio/i)
    })

    it('sets an error when an exercise has no sets', async () => {
      const { result } = renderHook(() => useRoutineForm())
      act(() => result.current.setName('My Routine'))
      act(() => result.current.addExerciseType(0))
      act(() => result.current.updateExerciseTypeName(0, 0, 'Push'))
      act(() => result.current.addExercise(0, 0))
      act(() => result.current.updateExerciseName(0, 0, 0, 'Bench'))
      act(() => result.current.removeSet(0, 0, 0, 0))
      await act(() => result.current.handleSubmit({ preventDefault: vi.fn() } as any))
      expect(result.current.error).toMatch(/al menos una serie/i)
    })

    it('sets an error when a set has an empty weight', async () => {
      const { result } = renderHook(() => useRoutineForm())
      act(() => result.current.setName('My Routine'))
      act(() => result.current.addExerciseType(0))
      act(() => result.current.updateExerciseTypeName(0, 0, 'Push'))
      act(() => result.current.addExercise(0, 0))
      act(() => result.current.updateExerciseName(0, 0, 0, 'Bench'))
      act(() => result.current.updateSet(0, 0, 0, 0, 'reps', '8'))
      await act(() => result.current.handleSubmit({ preventDefault: vi.fn() } as any))
      expect(result.current.error).toMatch(/incompleta/i)
    })

    it('does not call createRoutine when validation fails', async () => {
      const { result } = renderHook(() => useRoutineForm())
      await act(() => result.current.handleSubmit({ preventDefault: vi.fn() } as any))
      expect(createRoutine).not.toHaveBeenCalled()
    })
  })

  describe('handleSubmit — success', () => {
    it('calls createRoutine with the serialised routine input', async () => {
      vi.mocked(createRoutine).mockResolvedValue({ id: 42, name: 'My Routine', createdAt: '' })
      const { result } = renderHook(() => useRoutineForm())
      act(() => result.current.setName('My Routine'))
      await act(() => result.current.handleSubmit({ preventDefault: vi.fn() } as any))
      expect(createRoutine).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'My Routine' })
      )
    })

    it('navigates to the new routine detail page on success', async () => {
      vi.mocked(createRoutine).mockResolvedValue({ id: 42, name: 'My Routine', createdAt: '' })
      const { result } = renderHook(() => useRoutineForm())
      act(() => result.current.setName('My Routine'))
      await act(() => result.current.handleSubmit({ preventDefault: vi.fn() } as any))
      expect(mockPush).toHaveBeenCalledWith('/routines/42')
    })
  })

  describe('handleSubmit — server error', () => {
    it('sets an error message when createRoutine throws', async () => {
      vi.mocked(createRoutine).mockRejectedValue(new Error('network'))
      const { result } = renderHook(() => useRoutineForm())
      act(() => result.current.setName('My Routine'))
      await act(() => result.current.handleSubmit({ preventDefault: vi.fn() } as any))
      expect(result.current.error).toBe('Error al guardar la rutina. Intentá de nuevo.')
    })

    it('resets submitting to false after a server error', async () => {
      vi.mocked(createRoutine).mockRejectedValue(new Error('network'))
      const { result } = renderHook(() => useRoutineForm())
      act(() => result.current.setName('My Routine'))
      await act(() => result.current.handleSubmit({ preventDefault: vi.fn() } as any))
      expect(result.current.submitting).toBe(false)
    })
  })
})
