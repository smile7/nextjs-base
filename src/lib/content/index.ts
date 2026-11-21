/**
 * The content API (`@/lib/content`): the only import surface for pages and components.
 * Every getter returns domain types; missing content is `null` (or an empty list) and the route
 * decides on `notFound()`. A failed request still throws, so a broken build never ships empty pages.
 */
import 'server-only'

import { cache } from 'react'

import { defaultLocale, locales, type Locale } from '@/config/i18n'

import { sanityFetch } from './sanity/fetch'
import {
  mapArticleSummary,
  mapFaqItem,
  mapGalleryItem,
  mapList,
  mapServiceSummary,
  mapTeamMember,
  mapTestimonial,
} from './sanity/mappers/collections'
import { mapArticle, mapLegalPage, mapPage, mapService } from './sanity/mappers/documents'
import { mapAnnouncement, mapNavigation, mapSiteSettings } from './sanity/mappers/settings'
import { clean, mapTranslations } from './sanity/mappers/shared'
import { faqQuery, galleryQuery, teamQuery, testimonialsQuery } from './sanity/queries/collections'
import {
  articleBySlugQuery,
  articlesQuery,
  legalPageQuery,
  pageByKeyQuery,
  pageBySlugQuery,
  serviceBySlugQuery,
  servicesQuery,
  staticSlugsQuery,
  translationsQuery,
} from './sanity/queries/documents'
import { announcementQuery, navigationQuery, siteSettingsQuery } from './sanity/queries/settings'
import type {
  AnnouncementQueryResult,
  ArticleBySlugQueryResult,
  ArticlesQueryResult,
  FaqQueryResult,
  GalleryQueryResult,
  LegalPageQueryResult,
  NavigationQueryResult,
  PageByKeyQueryResult,
  PageBySlugQueryResult,
  ServiceBySlugQueryResult,
  ServicesQueryResult,
  SiteSettingsQueryResult,
  StaticSlugsQueryResult,
  TeamQueryResult,
  TestimonialsQueryResult,
  TranslationsQueryResult,
} from './sanity/query-types'
import type { ArticleSummary, FaqItem, GalleryAlbum, SystemPageKey, Translations } from './types'

export type * from './types'
export { RichText } from './rich-text'

/**
 * Content with Visual Editing markers removed (deep). In draft mode text fields carry invisible
 * stega characters; metadata, JSON-LD and anything compared in code must go through this.
 * A no-op on published content.
 */
export const withoutStega = <T>(value: T): T => clean(value)

const i18nParams = (locale: Locale) => ({ locale, fallback: defaultLocale })

function missing(what: string): null {
  console.warn(`[content] ${what} not found`)
  return null
}

export const getSiteSettings = cache(async (locale: Locale) => {
  const row = await sanityFetch<SiteSettingsQueryResult>({
    query: siteSettingsQuery,
    params: i18nParams(locale),
  })
  return mapSiteSettings(row, locale) ?? missing(`siteSettings (${locale})`)
})

export const getNavigation = cache(async (locale: Locale) => {
  const row = await sanityFetch<NavigationQueryResult>({
    query: navigationQuery,
    params: i18nParams(locale),
  })
  return row ? mapNavigation(row, locale) : missing(`navigation (${locale})`)
})

/**
 * The announcement active at build time, else the next one that hasn't ended. The banner checks
 * `startsAt`/`endsAt` client-side, because the page is static (CONTENT-MODEL announcement).
 */
export const getAnnouncement = cache(async (locale: Locale) => {
  const row = await sanityFetch<AnnouncementQueryResult>({
    query: announcementQuery,
    params: i18nParams(locale),
  })
  return mapAnnouncement(row, locale)
})

export const getPageByKey = cache(async (key: SystemPageKey, locale: Locale) => {
  const row = await sanityFetch<PageByKeyQueryResult>({
    query: pageByKeyQuery,
    params: { ...i18nParams(locale), key },
  })
  return mapPage(row, locale) ?? missing(`page "${key}" (${locale})`)
})

export const getPageBySlug = cache(async (slug: string, locale: Locale) => {
  const row = await sanityFetch<PageBySlugQueryResult>({
    query: pageBySlugQuery,
    params: { ...i18nParams(locale), slug },
  })
  return mapPage(row, locale) ?? missing(`page /${slug} (${locale})`)
})

const fetchServices = cache(async (locale: Locale, category: string | null) => {
  const rows = await sanityFetch<ServicesQueryResult>({
    query: servicesQuery,
    params: { ...i18nParams(locale), category },
  })
  return mapList(rows, (row) => mapServiceSummary(row, locale))
})

/** Services in editor order; `category` is a service category id. */
export const getServices = (locale: Locale, options: { category?: string } = {}) =>
  fetchServices(locale, options.category ?? null)

/** Only services with their own page (`hasDetailPage`). */
export const getServiceBySlug = cache(async (slug: string, locale: Locale) => {
  const row = await sanityFetch<ServiceBySlugQueryResult>({
    query: serviceBySlugQuery,
    params: { ...i18nParams(locale), slug },
  })
  return mapService(row, locale) ?? missing(`service ${slug} (${locale})`)
})

export type ArticlePage = { items: ArticleSummary[]; total: number; pages: number }

const fetchArticles = cache(
  async (locale: Locale, page: number, pageSize: number): Promise<ArticlePage> => {
    const start = (Math.max(1, page) - 1) * pageSize
    const result = await sanityFetch<ArticlesQueryResult>({
      query: articlesQuery,
      params: { ...i18nParams(locale), start, end: start + pageSize },
    })
    return {
      items: mapList(result.items, (row) => mapArticleSummary(row, locale)),
      total: result.total,
      pages: Math.ceil(result.total / pageSize),
    }
  },
)

/** Newest first. `page` is 1-based. */
export const getArticles = (locale: Locale, options: { page?: number; pageSize?: number } = {}) =>
  fetchArticles(locale, options.page ?? 1, options.pageSize ?? 9)

export const getArticleBySlug = cache(async (slug: string, locale: Locale) => {
  const row = await sanityFetch<ArticleBySlugQueryResult>({
    query: articleBySlugQuery,
    params: { ...i18nParams(locale), slug },
  })
  return mapArticle(row, locale) ?? missing(`article ${slug} (${locale})`)
})

export const getLegalPage = cache(async (slug: string, locale: Locale) => {
  const row = await sanityFetch<LegalPageQueryResult>({
    query: legalPageQuery,
    params: { ...i18nParams(locale), slug },
  })
  return mapLegalPage(row, locale) ?? missing(`legal page ${slug} (${locale})`)
})

export const getTeam = cache(async (locale: Locale) => {
  const rows = await sanityFetch<TeamQueryResult>({ query: teamQuery, params: i18nParams(locale) })
  return mapList(rows, (row) => mapTeamMember(row, locale))
})

const fetchFaq = cache(async (locale: Locale, category: FaqItem['category'] | null) => {
  const rows = await sanityFetch<FaqQueryResult>({
    query: faqQuery,
    params: { ...i18nParams(locale), category },
  })
  return mapList(rows, (row) => mapFaqItem(row, locale))
})

export const getFaq = (locale: Locale, options: { category?: FaqItem['category'] } = {}) =>
  fetchFaq(locale, options.category ?? null)

const fetchGallery = cache(async (locale: Locale, album: GalleryAlbum | null, limit: number) => {
  const rows = await sanityFetch<GalleryQueryResult>({
    query: galleryQuery,
    params: { ...i18nParams(locale), album, limit },
  })
  return mapList(rows, mapGalleryItem)
})

export const getGallery = (
  locale: Locale,
  options: { album?: GalleryAlbum; limit?: number } = {},
) => fetchGallery(locale, options.album ?? null, options.limit ?? 100)

const fetchTestimonials = cache(async (locale: Locale, featured: boolean | null) => {
  const rows = await sanityFetch<TestimonialsQueryResult>({
    query: testimonialsQuery,
    params: { ...i18nParams(locale), featured },
  })
  return mapList(rows, mapTestimonial)
})

export const getTestimonials = (locale: Locale, options: { featured?: boolean } = {}) =>
  fetchTestimonials(locale, options.featured ?? null)

/** Published translations of a routable document (language switcher + hreflang). */
export const getTranslations = cache(async (docId: string): Promise<Translations> => {
  const doc = await sanityFetch<TranslationsQueryResult>({
    query: translationsQuery,
    params: { id: docId },
    stega: false,
  })
  const locale = locales.find((l) => l === clean(doc?.language))
  if (!doc || !locale) return {}
  switch (doc._type) {
    case 'page':
    case 'service':
    case 'article':
    case 'legalPage':
      return mapTranslations(doc.translations, doc, locale)
    default:
      return {}
  }
})

export type StaticSlugType = 'page' | 'service' | 'article' | 'legalPage'

/**
 * Locale × slug of every published document of `type` with its own URL (generic pages, services
 * with a detail page). For `generateStaticParams`: published perspective, no stega.
 */
export const getStaticSlugs = cache(async (type: StaticSlugType) => {
  const rows = await sanityFetch<StaticSlugsQueryResult>({
    query: staticSlugsQuery,
    params: { type },
    stega: false,
    perspective: 'published',
  })
  return rows.flatMap(({ slug, language }) => {
    const locale = locales.find((l) => l === language)
    return locale && slug ? [{ locale, slug }] : []
  })
})
