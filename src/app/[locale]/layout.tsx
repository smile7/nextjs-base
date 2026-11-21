import type { Metadata, Viewport } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'

import { MotionProvider } from '@/components/motion/MotionProvider'
import { MobileActionBar } from '@/components/site/MobileActionBar'
import { MobileNav } from '@/components/site/MobileNav'
import { SiteHeader } from '@/components/site/SiteHeader'
import { fontVariables } from '@/config/fonts'
import { getNavigation, getSiteSettings } from '@/lib/content'
import { PreviewTools } from '@/lib/content/preview'
import { bookingAction, mobileBarActions, primaryPhone } from '@/lib/site/actions'
import { cn } from '@/lib/utils'
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

// `cover` makes `env(safe-area-inset-*)` non-zero on notched phones (mobile action bar).
export const viewport: Viewport = { viewportFit: 'cover' }

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const [messages, draft, settings, navigation, t] = await Promise.all([
    getMessages(),
    draftMode(),
    getSiteSettings(locale),
    getNavigation(locale),
    getTranslations(),
  ])
  const nav = navigation?.header ?? []
  const phone = settings ? primaryPhone(settings) : null
  const booking = settings
    ? bookingAction(settings, navigation?.headerCta, t('MobileNav.book'))
    : null
  const barActions =
    settings && navigation
      ? mobileBarActions(settings, navigation.mobileActionBar, booking, {
          call: t('ActionBar.call'),
          directions: t('ActionBar.directions'),
          book: t('ActionBar.book'),
          viber: t('ActionBar.viber'),
          whatsapp: t('ActionBar.whatsapp'),
          email: t('ActionBar.email'),
        })
      : []

  return (
    <html lang={locale} className={fontVariables}>
      <body
        className={cn(
          barActions.length > 0 &&
            'pb-[calc(var(--action-bar-h)+env(safe-area-inset-bottom))] md:pb-0',
        )}
      >
        {/* Client components get only the namespaces they use. */}
        <NextIntlClientProvider
          messages={{
            LanguageSwitcher: messages.LanguageSwitcher,
            Header: messages.Header,
            MobileNav: messages.MobileNav,
            ActionBar: messages.ActionBar,
          }}
        >
          {settings ? (
            <SiteHeader
              brandName={settings.brandName}
              nav={nav}
              phone={phone}
              menu={<MobileNav nav={nav} phone={phone} booking={booking} />}
            />
          ) : null}
          <MotionProvider>{children}</MotionProvider>
          {barActions.length > 0 ? <MobileActionBar actions={barActions} /> : null}
        </NextIntlClientProvider>
        {draft.isEnabled && <PreviewTools />}
      </body>
    </html>
  )
}
