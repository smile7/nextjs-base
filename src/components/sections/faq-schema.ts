import type { FaqSection, RichTextValue } from '@/lib/content'

export type FaqPageSchema = {
  '@context': 'https://schema.org'
  '@type': 'FAQPage'
  mainEntity: {
    '@type': 'Question'
    name: string
    acceptedAnswer: { '@type': 'Answer'; text: string }
  }[]
}

function richTextToPlainText(value: RichTextValue): string {
  const blocks = value as unknown as { _type?: string; children?: { text?: string }[] }[]
  return blocks
    .filter((block) => block._type === 'block')
    .flatMap((block) => block.children ?? [])
    .map((child) => child.text ?? '')
    .join(' ')
    .trim()
}

/** FAQPage JSON-LD fragment for the page `@graph` (only when `emitSchema` is on). */
export function faqSchemaFromSection(section: FaqSection): FaqPageSchema | null {
  if (!section.emitSchema || section.items.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: section.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: richTextToPlainText(item.answer),
      },
    })),
  }
}