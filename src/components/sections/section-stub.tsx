import type { Section } from '@/lib/content'

import type { SectionComponentProps } from './types'

/** Temporary render used until the real section ships in its task. */
export function sectionStub(type: Section['type']) {
  return function Stub({ section }: SectionComponentProps) {
    return <div data-section={type} data-section-key={section.key} hidden aria-hidden="true" />
  }
}