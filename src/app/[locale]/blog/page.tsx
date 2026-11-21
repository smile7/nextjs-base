import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'

import { BlogList } from '@/components/site/BlogList'
import { CmsPage } from '@/components/site/CmsPage'
import { getArticles, getPageByKey, getSiteSettings, withoutStega } from '@/lib/content'
import { buildAlternates } from '@/lib/seo/alternates'
import { routing } from '@/i18n/routing'

export const dynamicParams = false

export async function generateMetadata({ params }: PageProps<'/[locale]/blog'>): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const page = await getPageByKey('blog', locale)
  if (!page) return {}
  return withoutStega({
    title: page.seo.title ?? page.title,
    description: page.seo.description ?? page.intro,
    alternates: buildAlternates(locale, page.translations),
  })
}

export default async function BlogPage({ params }: PageProps<'/[locale]/blog'>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const [page, settings, articles] = await Promise.all([
    getPageByKey('blog', locale),
    getSiteSettings(locale),
    getArticles(locale),
  ])
  if (!page || !settings) notFound()

  return (
    <CmsPage page={page} locale={locale} site={settings}>
      <BlogList
        articles={articles.items}
        page={1}
        pages={articles.pages}
        locale={locale}
        site={settings}
      />
    </CmsPage>
  )
}
