import type { HeadingLevel } from '@/components/primitives/Heading'
import type { Section } from '@/lib/content'

/** Stable id for a section heading (`aria-labelledby` on the section band). */
export function sectionTitleId(sectionKey: string) {
  return `section-${sectionKey}-title`
}

export function pageUsesHeroH1(sections: readonly Section[]) {
  return sections[0]?.type === 'hero'
}

/** Semantic level for the section's primary heading (hero heading, FAQ title, …). */
export function sectionHeadingLevel(index: number, sections: readonly Section[]): HeadingLevel {
  if (pageUsesHeroH1(sections)) {
    return index === 0 ? 'h1' : 'h2'
  }
  return index === 0 ? 'h1' : 'h2'
}

/** One level down from the section title (tile buttons, accordion items wrapped in headings). */
export function subsectionHeadingLevel(
  sectionLevel: HeadingLevel,
): 'h2' | 'h3' | 'h4' | 'h5' | 'h6' {
  const next: Record<HeadingLevel, 'h2' | 'h3' | 'h4' | 'h5' | 'h6'> = {
    h1: 'h2',
    h2: 'h3',
    h3: 'h4',
    h4: 'h5',
    h5: 'h6',
    h6: 'h6',
  }
  return next[sectionLevel]
}