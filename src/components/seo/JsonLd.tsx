import { serializeJsonLd } from '@/lib/seo/jsonld'

export type JsonLdProps = { data: object }

/** The only way to emit JSON-LD: everything goes through `serializeJsonLd` (stega-free). */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}
