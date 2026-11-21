import { features } from '@/config/features'
import type { SectionType } from '@/lib/content'

import { sectionStub } from './section-stub'
import type { SectionRegistry } from './types'

/**
 * Maps domain section `type` → renderer. Client-heavy sections are imported from their own modules
 * (Tiles, Gallery lightbox) as we add them in T06.2–T06.7.
 */
export const sectionRegistry = {
  hero: sectionStub('hero'),
  textImage: sectionStub('textImage'),
  richText: sectionStub('richText'),
  tiles: sectionStub('tiles'),
  processSteps: sectionStub('processSteps'),
  faq: sectionStub('faq'),
  blogTeaser: sectionStub('blogTeaser'),
  testimonials: sectionStub('testimonials'),
  team: sectionStub('team'),
  gallery: sectionStub('gallery'),
  contactHours: sectionStub('contactHours'),
  ctaBand: sectionStub('ctaBand'),
} satisfies SectionRegistry

/** Reserved CMS types (CONTENT-MODEL §6). Registered as `null` until built and `features.*` is on. */
export const reservedSectionTypes = {
  priceList: features.priceList ? null : null,
  beforeAfter: features.beforeAfter ? null : null,
  googleReviews: features.googleReviews ? null : null,
} as const

export function registryEntry(type: SectionType) {
  return sectionRegistry[type]
}