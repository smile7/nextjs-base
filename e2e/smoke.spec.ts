import { expect, test } from '@playwright/test'
import { expectNoA11yViolations } from './helpers/a11y'

test('home placeholder renders and has no a11y violations', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)
  await expect(page.locator('main')).toBeAttached()
  await expectNoA11yViolations(page)
})
