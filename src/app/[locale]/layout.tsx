import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

import { MotionProvider } from '@/components/motion/MotionProvider'
import { fontVariables } from '@/config/fonts'
import { PreviewTools } from '@/lib/content/preview'
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
  const [messages, draft] = await Promise.all([getMessages(), draftMode()])

  return (
    <html lang={locale} className={fontVariables}>
      <body>
        {/* Client components get only the namespaces they use. */}
        <NextIntlClientProvider messages={{ LanguageSwitcher: messages.LanguageSwitcher }}>
          <MotionProvider>{children}</MotionProvider>
        </NextIntlClientProvider>
        {draft.isEnabled && <PreviewTools />}
      </body>
    </html>
  )
}
