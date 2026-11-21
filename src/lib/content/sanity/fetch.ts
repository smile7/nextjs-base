import 'server-only'

import { draftMode } from 'next/headers'
import type { QueryParams } from 'next-sanity'

import { client } from './client'
import { readToken } from './token'

export type FetchOpts<Q extends string> = {
  query: Q
  params?: QueryParams
  /** Default: on in draft mode. Always pass `false` for metadata, JSON-LD, static params, sitemap. */
  stega?: boolean
  /**
   * Forces a perspective instead of reading draft mode. `'published'` is required where there is
   * no request (`generateStaticParams`, sitemap, scripts), because `draftMode()` needs one.
   */
  perspective?: 'published' | 'drafts'
}

/**
 * The only way the content layer talks to Sanity (ARCHITECTURE §5.2). Published reads are
 * tokenless CDN reads with no cache tags (ADR-012), so they keep routes static.
 */
export async function sanityFetch<const Q extends string>({
  query,
  params = {},
  stega,
  perspective,
}: FetchOpts<Q>) {
  const drafts = perspective ? perspective === 'drafts' : (await draftMode()).isEnabled

  if (drafts) {
    return client.fetch(query, params, {
      perspective: 'drafts',
      useCdn: false,
      token: readToken(),
      stega: stega ?? true,
      cache: 'no-store',
    })
  }

  return client.fetch(query, params, {
    perspective: 'published',
    useCdn: true,
    stega: stega ?? false,
  })
}
