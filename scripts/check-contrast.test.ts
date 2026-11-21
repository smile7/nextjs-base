import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { checkPairs } from './check-contrast'

const css = readFileSync(resolve(__dirname, '../src/styles/tokens.css'), 'utf8')

describe('tokens.css contrast pairs', () => {
  it('meets WCAG AA for every semantic pair', () => {
    const failures = checkPairs(css)
      .filter((r) => !r.pass)
      .map((r) => `${r.fg} on ${r.bg}: ${r.ratio.toFixed(2)}:1 (min ${r.min})`)
    expect(failures).toEqual([])
  })
})
