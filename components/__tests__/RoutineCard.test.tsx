// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RoutineCard from '@/components/RoutineCard'
import type { Routine } from '@/db/schema'

vi.mock('@/lib/actions', () => ({
  deleteRoutine: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

import { deleteRoutine } from '@/lib/actions'

const routine: Routine = {
  id: 7,
  name: 'Fuerza 4 días',
  createdAt: '2024-03-15',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('RoutineCard', () => {
  it('renders the routine name as a heading', () => {
    render(<RoutineCard routine={routine} />)
    expect(screen.getByRole('heading', { name: 'Fuerza 4 días' })).toBeInTheDocument()
  })

  it('renders a "Ver rutina" link pointing to the routine detail page', () => {
    render(<RoutineCard routine={routine} />)
    expect(screen.getByRole('link', { name: /ver rutina/i })).toHaveAttribute('href', '/routines/7')
  })

  it('renders a delete button', () => {
    render(<RoutineCard routine={routine} />)
    expect(screen.getByTitle('Eliminar')).toBeInTheDocument()
  })

  it('calls deleteRoutine with the routine id when the user confirms deletion', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<RoutineCard routine={routine} />)
    await userEvent.click(screen.getByTitle('Eliminar'))
    expect(deleteRoutine).toHaveBeenCalledWith(7)
  })

  it('does not call deleteRoutine when the user cancels the confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<RoutineCard routine={routine} />)
    await userEvent.click(screen.getByTitle('Eliminar'))
    expect(deleteRoutine).not.toHaveBeenCalled()
  })

  it('shows a confirmation dialog with the routine name before deleting', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<RoutineCard routine={routine} />)
    await userEvent.click(screen.getByTitle('Eliminar'))
    expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('Fuerza 4 días'))
  })
})
