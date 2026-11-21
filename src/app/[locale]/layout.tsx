import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'

import { MotionProvider } from '@/components/motion/MotionProvider'
import { fontVariables } from '@/config/fonts'
import { readPublicEnv } from '@/env'
import { routing } from '@/i18n/routing'
import '@/styles/globals.css'

// `dynamicParams` stays per route (T04.7): set here it would apply to every child segment.
// Unknown locales don't reach this segment, because the proxy prefixes them with the default locale.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export function generateMetadata(): Metadata {
  const { NEXT_PUBLIC_SITE_URL } = readPublicEnv('NEXT_PUBLIC_SITE_URL')
  return { metadataBase: new URL(NEXT_PUBLIC_SITE_URL) }
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  return (
    <html lang={locale} className={fontVariables}>
      <body>
        <NextIntlClientProvider messages={null}>
          <MotionProvider>{children}</MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
