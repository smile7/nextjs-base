import { screen } from '@testing-library/react'
import type * as Navigation from 'next/navigation'
import { describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/test/intl'

import Home from './page'

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof Navigation>()),
  usePathname: () => '/bg',
  useParams: () => ({ locale: 'bg' }),
}))

describe('Home placeholder', () => {
  it('renders the main landmark with the language switcher', () => {
    renderWithIntl(<Home />)
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Език' })).toBeInTheDocument()
  })
})
