import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'

import { LanguageSwitcher } from '@/components/site/LanguageSwitcher'
import { inAllLocales } from '@/lib/i18n/translations'
import { buildAlternates } from '@/lib/seo/alternates'

// Static only (ADR-012): locales come from the layout's generateStaticParams; others 404.
export const dynamicParams = false

export async function generateMetadata(): Promise<Metadata> {
  return { alternates: buildAlternates(await getLocale(), inAllLocales('/')) }
}

/** Placeholder until Phase 07. The switcher moves into the header in Phase 05. */
export default function Home() {
  return (
    <main id="main">
      <LanguageSwitcher />
    </main>
  )
}
