import { faqSchemaFromSection } from '@/components/sections/faq-schema'
import { pageUsesHeroH1 } from '@/components/sections/helpers'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import type { SectionSiteContext } from '@/components/sections/types'
import { JsonLd } from '@/components/seo/JsonLd'
import type { Locale } from '@/config/i18n'
import type { FaqSection, Page } from '@/lib/content'
import type { Href } from '@/lib/i18n/translations'

import { PageHeader } from './PageHeader'
import { SetPageTranslations } from './PageTranslations'

export type CmsPageProps = {
  page: Page
  locale: Locale
  site: SectionSiteContext
  /** Where the language switcher goes for a locale without a translation. */
  fallback?: Href
}

/** A page-builder page: `h1` (hero or title band), sections, FAQ JSON-LD. */
export function CmsPage({ page, locale, site, fallback = '/' }: CmsPageProps) {
  const faq = page.sections.find(
    (section): section is FaqSection => section.type === 'faq' && section.emitSchema,
  )
  const faqSchema = faq ? faqSchemaFromSection(faq) : null

  return (
    <>
      <SetPageTranslations translations={page.translations} fallback={fallback} />
      {pageUsesHeroH1(page.sections) ? null : <PageHeader title={page.title} intro={page.intro} />}
      <SectionRenderer sections={page.sections} locale={locale} site={site} />
      {faqSchema ? <JsonLd data={faqSchema} /> : null}
    </>
  )
}
