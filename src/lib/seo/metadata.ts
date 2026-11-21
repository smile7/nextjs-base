import type { Metadata } from 'next'

import { localeMeta, locales, type Locale } from '@/config/i18n'
import { OG_IMAGE_SIZE, ogImageUrl } from '@/lib/content/image-loader'
import { withoutStega } from '@/lib/content/stega'
import type { ImageAsset, Seo, SiteSettings } from '@/lib/content/types'
import type { PageTranslations } from '@/lib/i18n/translations'

import { buildAlternates } from './alternates'

export type MetadataInput = {
  locale: Locale
  settings: Pick<SiteSettings, 'brandName' | 'tagline' | 'seoDefaults'>
  translations: PageTranslations
  title: string
  /** Excerpt / intro / teaser: used when the document has no `seo.description`. */
  description?: string
  seo?: Seo
  /** Hero or cover image: the OG image when the document has no `seo.ogImage`. */
  image?: ImageAsset
  /** The home page's title is `brandName · tagline`, not the title template. */
  home?: boolean
  article?: { publishedTime: string; modifiedTime?: string; authors: string[] }
}

export type MetadataContext = {
  env: 'production' | 'preview' | 'development'
  draftMode: boolean
}

const SEPARATOR = ' · '

export function pageTitle(input: Pick<MetadataInput, 'settings' | 'title' | 'seo' | 'home'>) {
  const { brandName, tagline, seoDefaults } = input.settings
  if (input.home) return input.seo?.title || [brandName, tagline].filter(Boolean).join(SEPARATOR)
  const template = seoDefaults.titleTemplate?.includes('%s')
    ? seoDefaults.titleTemplate
    : `%s${SEPARATOR}${brandName}`
  return template.replace('%s', input.seo?.title || input.title)
}

/** The route's full `Metadata` (SEO.md §1). Every string goes through `withoutStega`. */
export function composeMetadata(input: MetadataInput, context: MetadataContext): Metadata {
  const { locale, settings, seo, translations, article } = input
  const title = pageTitle(input)
  const description =
    seo?.description || input.description || settings.seoDefaults.description || undefined
  const alternates = buildAlternates(locale, translations)
  const canonical = seo?.canonicalOverride || alternates.canonical
  const image = seo?.ogImage ?? input.image ?? settings.seoDefaults.ogImage
  const images = image ? [{ url: ogImageUrl(image), ...OG_IMAGE_SIZE, alt: image.alt }] : undefined
  const noIndex = context.env !== 'production' || context.draftMode || Boolean(seo?.noIndex)

  return withoutStega({
    title: { absolute: title },
    description,
    alternates: { canonical, languages: alternates.languages },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: settings.brandName,
      locale: localeMeta[locale].ogLocale,
      alternateLocale: locales
        .filter((l) => l !== locale && translations[l] !== undefined)
        .map((l) => localeMeta[l].ogLocale),
      images,
      ...(article
        ? {
            type: 'article',
            publishedTime: article.publishedTime,
            modifiedTime: article.modifiedTime,
            authors: article.authors,
          }
        : { type: 'website' }),
    },
    twitter: { card: 'summary_large_image', title, description, images },
  })
}
