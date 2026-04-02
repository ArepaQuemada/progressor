// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RoutineForm from '@/components/RoutineForm'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/lib/actions', () => ({
  createRoutine: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('RoutineForm', () => {
  it('renders the routine name input', () => {
    render(<RoutineForm />)
    expect(screen.getByPlaceholderText(/Ej: Rutina Fuerza/i)).toBeInTheDocument()
  })

  it('renders day count buttons for 3, 4, 5, and 6', () => {
    render(<RoutineForm />)
    for (const count of [3, 4, 5, 6]) {
      expect(screen.getByRole('button', { name: String(count) })).toBeInTheDocument()
    }
  })

  it('renders 3 day label inputs by default', () => {
    render(<RoutineForm />)
    expect(screen.getAllByPlaceholderText(/Nombre del día/i)).toHaveLength(3)
  })

  it('renders 4 day label inputs after clicking the 4 button', async () => {
    render(<RoutineForm />)
    await userEvent.click(screen.getByRole('button', { name: '4' }))
    expect(screen.getAllByPlaceholderText(/Nombre del día/i)).toHaveLength(4)
  })

  it('renders 6 day label inputs after clicking the 6 button', async () => {
    render(<RoutineForm />)
    await userEvent.click(screen.getByRole('button', { name: '6' }))
    expect(screen.getAllByPlaceholderText(/Nombre del día/i)).toHaveLength(6)
  })

  it('shows a validation error when submitting with an empty name', async () => {
    render(<RoutineForm />)
    await userEvent.click(screen.getByRole('button', { name: /Guardar rutina/i }))
    expect(await screen.findByText(/nombre de la rutina es requerido/i)).toBeInTheDocument()
  })

  it('renders a submit button that is enabled by default', () => {
    render(<RoutineForm />)
    expect(screen.getByRole('button', { name: /Guardar rutina/i })).not.toBeDisabled()
  })

  it('renders a cancel button', () => {
    render(<RoutineForm />)
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument()
  })

  it('navigates to the home page when cancel is clicked', async () => {
    render(<RoutineForm />)
    await userEvent.click(screen.getByRole('button', { name: /Cancelar/i }))
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('does not render an error message initially', () => {
    render(<RoutineForm />)
    expect(screen.queryByText(/requerido/i)).not.toBeInTheDocument()
  })
})
