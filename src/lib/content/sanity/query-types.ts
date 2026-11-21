/** Row types derived from the generated query results. The only importer of `sanity.types`. */
import type {
  AnnouncementQueryResult,
  ArticleBySlugQueryResult,
  ArticlesQueryResult,
  FaqQueryResult,
  GalleryQueryResult,
  LegalPageQueryResult,
  NavigationQueryResult,
  PageByKeyQueryResult,
  ServiceBySlugQueryResult,
  ServicesQueryResult,
  SiteSettingsQueryResult,
  TeamQueryResult,
  TestimonialsQueryResult,
} from '../../../../sanity.types'

export type TeamMemberQueryRow = TeamQueryResult[number]
export type FaqItemQueryRow = FaqQueryResult[number]
export type GalleryItemQueryRow = GalleryQueryResult[number]
export type TestimonialQueryRow = TestimonialsQueryResult[number]
export type ServiceSummaryQueryRow = ServicesQueryResult[number]
export type ArticleSummaryQueryRow = ArticlesQueryResult['items'][number]

export type PageQueryRow = NonNullable<PageByKeyQueryResult>
export type SectionQueryRow = NonNullable<PageQueryRow['sections']>[number]
export type ServiceQueryRow = NonNullable<ServiceBySlugQueryResult>
export type ArticleQueryRow = NonNullable<ArticleBySlugQueryResult>
export type LegalPageQueryRow = NonNullable<LegalPageQueryResult>

export type SiteSettingsQueryRow = NonNullable<SiteSettingsQueryResult>
export type NavigationQueryRow = NonNullable<NavigationQueryResult>
export type AnnouncementQueryRow = NonNullable<AnnouncementQueryResult>
