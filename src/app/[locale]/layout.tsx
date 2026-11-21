import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

import { MotionProvider } from '@/components/motion/MotionProvider'
import { SiteHeader } from '@/components/site/SiteHeader'
import { fontVariables } from '@/config/fonts'
import { getNavigation, getSiteSettings } from '@/lib/content'
import { PreviewTools } from '@/lib/content/preview'
import { primaryPhone } from '@/lib/site/actions'
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
  const [messages, draft, settings, navigation] = await Promise.all([
    getMessages(),
    draftMode(),
    getSiteSettings(locale),
    getNavigation(locale),
  ])

  return (
    <html lang={locale} className={fontVariables}>
      <body>
        {/* Client components get only the namespaces they use. */}
        <NextIntlClientProvider
          messages={{ LanguageSwitcher: messages.LanguageSwitcher, Header: messages.Header }}
        >
          {settings ? (
            <SiteHeader
              brandName={settings.brandName}
              nav={navigation?.header ?? []}
              phone={primaryPhone(settings)}
            />
          ) : null}
          <MotionProvider>{children}</MotionProvider>
        </NextIntlClientProvider>
        {draft.isEnabled && <PreviewTools />}
      </body>
    </html>
  )
}
