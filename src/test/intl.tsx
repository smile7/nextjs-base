import { render } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import type { ReactElement } from 'react'

import type { Locale } from '@/config/i18n'

import bg from '../../messages/bg.json'
import en from '../../messages/en.json'

const messages = { bg, en } satisfies Record<Locale, unknown>

/** Renders a client component the way the locale layout provides it (all messages). */
export function renderWithIntl(ui: ReactElement, locale: Locale = 'bg') {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages[locale]} timeZone="Europe/Sofia">
      {ui}
    </NextIntlClientProvider>,
  )
}
