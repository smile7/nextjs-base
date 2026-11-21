import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'

import { inAllLocales } from '@/lib/i18n/translations'
import { buildAlternates } from '@/lib/seo/alternates'

// Static only (ADR-012): locales come from the layout's generateStaticParams; others 404.
export const dynamicParams = false

export async function generateMetadata(): Promise<Metadata> {
  return { alternates: buildAlternates(await getLocale(), inAllLocales('/')) }
}

/** Placeholder until Phase 07. The layout provides `<main>`. */
export default function Home() {
  return null
}
