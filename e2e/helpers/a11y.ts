import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

export async function expectNoA11yViolations(page: Page, options: { include?: string } = {}) {
  // Wait for hydration: some Base UI ARIA wiring (e.g. label ids) is completed in effects.
  await page.waitForLoadState('networkidle')
  let builder = new AxeBuilder({ page }).withTags(WCAG_TAGS)
  if (options.include) builder = builder.include(options.include)
  const results = await builder.analyze()
  const summary = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    targets: v.nodes.map((n) => n.target.join(' ')),
  }))
  expect(summary).toEqual([])
}
