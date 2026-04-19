import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionWarningDialog } from './SessionWarningDialog'

const defaults = {
  open: true,
  secondsLeft: 90,
  isPending: false,
  onStay: vi.fn(),
  onSignOut: vi.fn(),
}

describe('SessionWarningDialog', () => {
  it('renders countdown in M:SS format', () => {
    render(<SessionWarningDialog {...defaults} secondsLeft={90} />)
    expect(screen.getByText('1:30')).toBeTruthy()
  })

  it('renders 0:00 when secondsLeft is 0', () => {
    render(<SessionWarningDialog {...defaults} secondsLeft={0} />)
    expect(screen.getByText('0:00')).toBeTruthy()
  })

  it('calls onStay when "Stay signed in" is clicked', async () => {
    const onStay = vi.fn()
    render(<SessionWarningDialog {...defaults} onStay={onStay} />)
    await userEvent.click(screen.getByRole('button', { name: /stay signed in/i }))
    expect(onStay).toHaveBeenCalledOnce()
  })

  it('calls onSignOut when "Sign out" is clicked', async () => {
    const onSignOut = vi.fn()
    render(<SessionWarningDialog {...defaults} onSignOut={onSignOut} />)
    await userEvent.click(screen.getByRole('button', { name: /sign out/i }))
    expect(onSignOut).toHaveBeenCalledOnce()
  })

  it('disables both buttons and shows "Extending…" when isPending', () => {
    render(<SessionWarningDialog {...defaults} isPending={true} />)
    const stayBtn = screen.getByRole('button', { name: /extending/i })
    const signOutBtn = screen.getByRole('button', { name: /sign out/i })
    expect((stayBtn as HTMLButtonElement).disabled).toBe(true)
    expect((signOutBtn as HTMLButtonElement).disabled).toBe(true)
  })

  it('does not render content when closed', () => {
    render(<SessionWarningDialog {...defaults} open={false} />)
    expect(screen.queryByText(/your session is expiring/i)).toBeNull()
  })
})
