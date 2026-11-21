import type { Section, SectionType } from '@/lib/content'

import { SectionErrorBoundary } from './SectionErrorBoundary'
import { registryEntry } from './registry'
import type { SectionComponentProps, SectionSiteContext } from './types'

export type SectionRendererProps = {
  sections: Section[]
  locale: SectionComponentProps['locale']
  site: SectionSiteContext
}

export function SectionRenderer({ sections, locale, site }: SectionRendererProps) {
  const hasHeroFirst = sections[0]?.type === 'hero'

  return (
    <>
      {sections.map((section, index) => {
        const type = section.type satisfies SectionType
        const Component = registryEntry(type)
        if (!Component) return null

        const imagePriority = hasHeroFirst ? index <= 1 : index === 0

        const props: SectionComponentProps = {
          section,
          index,
          sections,
          locale,
          site,
          imagePriority,
        }

        return (
          <SectionErrorBoundary key={section.key} sectionKey={section.key} sectionType={type}>
            <Component {...props} />
          </SectionErrorBoundary>
        )
      })}
    </>
  )
}