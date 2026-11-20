import { expect, test, type Locator, type Page } from '@playwright/test'
import { expectNoA11yViolations } from './helpers/a11y'

test.beforeEach(async ({ page }) => {
  await page.goto('/styleguide')
})

test('styleguide has no a11y violations', async ({ page }) => {
  await expectNoA11yViolations(page)
})

async function focusWithKeyboard(page: Page, target: Locator) {
  await target.focus()
  await expect(target).toBeFocused()
}

// Base UI's focus guards hand focus back asynchronously, so poll instead of reading it instantly.
async function expectFocusTrapped(page: Page, container: Locator) {
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab')
    await expect
      .poll(() => container.evaluate((el) => el.contains(document.activeElement)))
      .toBe(true)
  }
}

test('dialog opens from the keyboard, traps focus, closes on Escape and restores focus', async ({
  page,
}) => {
  const trigger = page.getByRole('button', { name: 'Отвори диалог' })
  await focusWithKeyboard(page, trigger)
  await page.keyboard.press('Enter')

  const dialog = page.getByRole('dialog', { name: 'Настройки на бисквитките' })
  await expect(dialog).toBeVisible()
  await expectFocusTrapped(page, dialog)
  await expect(dialog.getByRole('button', { name: 'Затвори' })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('sheet opens from the keyboard, traps focus, closes on Escape and restores focus', async ({
  page,
}) => {
  const trigger = page.getByRole('button', { name: 'Отвори меню' })
  await focusWithKeyboard(page, trigger)
  await page.keyboard.press('Enter')

  const sheet = page.getByRole('dialog', { name: 'Меню' })
  await expect(sheet).toBeVisible()
  await expectFocusTrapped(page, sheet)

  await page.keyboard.press('Escape')
  await expect(sheet).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('accordion toggles with Enter and Space', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Мога ли да остана в кабинета?' })
  await focusWithKeyboard(page, trigger)
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  await page.keyboard.press('Enter')
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByText('Да, родителят може да присъства')).toBeVisible()

  await page.keyboard.press('Space')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
})

test('primary actions meet the 44px target size', async ({ page }) => {
  const box = await page.getByRole('button', { name: 'Запазете час' }).first().boundingBox()
  expect(box?.height).toBeGreaterThanOrEqual(44)
})
