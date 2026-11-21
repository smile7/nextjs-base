import { describe, expect, it } from 'vitest'

import type { Phone } from '@/lib/content'

import { primaryPhone } from './actions'

const phone = (key: Phone['key'], e164: string, display = ''): Phone => ({ key, e164, display })

describe('primaryPhone', () => {
  it('prefers the primary phone and keeps the editor display', () => {
    expect(
      primaryPhone({
        phones: [phone('secondary', '+359888123456'), phone('primary', '+35982841190', '082 841 190')],
      }),
    ).toEqual({ href: 'tel:+35982841190', display: '082 841 190' })
  })

  it('falls back to the first phone and a formatted display', () => {
    expect(primaryPhone({ phones: [phone('secondary', '+35982841190')] })?.href).toBe(
      'tel:+35982841190',
    )
    expect(primaryPhone({ phones: [phone('secondary', '+35982841190')] })?.display).not.toBe('')
  })

  it('returns null without phones', () => {
    expect(primaryPhone({ phones: [] })).toBeNull()
  })
})
