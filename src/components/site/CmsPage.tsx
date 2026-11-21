import type { ReactNode } from 'react'

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
  /** Wraps the rendered sections (e.g. the services audience filter). */
  wrapSections?: (sections: ReactNode) => ReactNode
  /** Under the title band's intro (e.g. the contact page's call buttons). Not shown with a hero. */
  headerActions?: ReactNode
  /** Rendered after the sections (e.g. the blog list). */
  children?: ReactNode
}

/** A page-builder page: `h1` (hero or title band), sections, FAQ JSON-LD. */
export function CmsPage({
  page,
  locale,
  site,
  fallback = '/',
  wrapSections,
  headerActions,
  children,
}: CmsPageProps) {
  const faq = page.sections.find(
    (section): section is FaqSection => section.type === 'faq' && section.emitSchema,
  )
  const faqSchema = faq ? faqSchemaFromSection(faq) : null
  const sections = <SectionRenderer sections={page.sections} locale={locale} site={site} />

  return (
    <>
      <SetPageTranslations translations={page.translations} fallback={fallback} />
      {pageUsesHeroH1(page.sections) ? null : (
        <PageHeader title={page.title} intro={page.intro}>
          {headerActions}
        </PageHeader>
      )}
      {wrapSections ? wrapSections(sections) : sections}
      {children}
      {faqSchema ? <JsonLd data={faqSchema} /> : null}
    </>
  )
}
