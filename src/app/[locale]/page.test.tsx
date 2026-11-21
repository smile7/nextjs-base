import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Home from './page'

describe('Home placeholder', () => {
  it('adds no landmark of its own (the layout renders <main>)', () => {
    const { container } = render(<Home />)
    expect(container.querySelector('main')).toBeNull()
  })
})
