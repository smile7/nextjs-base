import { Heading } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import type { FaqSection as FaqModel } from '@/lib/content'

import { FaqAccordion } from './FaqAccordion'
import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

export { faqSchemaFromSection } from './faq-schema'

export function FaqSection({
  section: raw,
  index,
  sections,
}: SectionComponentProps) {
  const section = raw as FaqModel
  const titleId = sectionTitleId(section.key)
  const level = sectionHeadingLevel(index, sections)

  return (
    <SectionShell section={section} labelledBy={section.heading ? titleId : undefined} width="prose">
      {section.heading ? (
        <Heading as={level} size="step-3" id={titleId}>
          {section.heading}
        </Heading>
      ) : null}
      {section.intro ? (
        <Text tone="muted" className="mt-4">
          {section.intro}
        </Text>
      ) : null}
      <FaqAccordion items={section.items} idPrefix={section.key} />
    </SectionShell>
  )
}