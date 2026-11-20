import { expect, test, type Locator } from '@playwright/test'

function computed(locator: Locator, property: 'opacity' | 'transform') {
  return locator.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property)
}

test.describe('with prefers-reduced-motion: reduce', () => {
  test.use({ reducedMotion: 'reduce' })

  test('Reveal renders statically with no transform', async ({ page }) => {
    await page.goto('/styleguide')
    const reveals = page.locator('[data-reveal="static"]')
    await expect(reveals).toHaveCount(3)
    await expect(page.locator('[data-reveal="animated"]')).toHaveCount(0)

    for (const reveal of await reveals.all()) {
      expect(await computed(reveal, 'transform')).toBe('none')
      expect(await computed(reveal, 'opacity')).toBe('1')
    }
  })
})

test.describe('with motion allowed', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('Reveal fades in once scrolled into view', async ({ page }) => {
    await page.goto('/styleguide')
    const first = page.locator('[data-reveal="animated"]').first()
    await expect(first).toBeAttached()
    expect(await computed(first, 'opacity')).toBe('0')

    await first.scrollIntoViewIfNeeded()
    await expect.poll(() => computed(first, 'opacity')).toBe('1')
    await expect
      .poll(() => computed(first, 'transform'))
      .toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/)
  })
})
