import { afterEach, describe, expect, it, vi } from 'vitest'

import StyleguidePage, { metadata } from './page'

vi.mock('next/font/google', () => {
  const font = () => ({ className: 'font-mock', style: { fontFamily: 'mock' } })
  return { Comfortaa: font, Golos_Text: font, M_PLUS_Rounded_1c: font, Manrope: font }
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('/styleguide', () => {
  it('is a 404 unless NEXT_PUBLIC_ENABLE_STYLEGUIDE is true', () => {
    vi.stubEnv('NEXT_PUBLIC_ENABLE_STYLEGUIDE', 'false')
    expect(StyleguidePage).toThrow(
      expect.objectContaining({ digest: 'NEXT_HTTP_ERROR_FALLBACK;404' }),
    )
  })

  it('renders when enabled', () => {
    vi.stubEnv('NEXT_PUBLIC_ENABLE_STYLEGUIDE', 'true')
    expect(StyleguidePage()).toBeTruthy()
  })

  it('is never indexed', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })
})
