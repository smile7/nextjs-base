import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'

import { CmsPage } from '@/components/site/CmsPage'
import { ContactActions } from '@/components/site/ContactActions'
import { getPageByKey, getSiteSettings, withoutStega } from '@/lib/content'
import { buildAlternates } from '@/lib/seo/alternates'
import { routing } from '@/i18n/routing'

export const dynamicParams = false

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/contact'>): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const page = await getPageByKey('contact', locale)
  if (!page) return {}
  return withoutStega({
    title: page.seo.title ?? page.title,
    description: page.seo.description ?? page.intro,
    alternates: buildAlternates(locale, page.translations),
  })
}

export default async function ContactPage({ params }: PageProps<'/[locale]/contact'>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const [page, settings] = await Promise.all([
    getPageByKey('contact', locale),
    getSiteSettings(locale),
  ])
  if (!page || !settings) notFound()
  return (
    <CmsPage
      page={page}
      locale={locale}
      site={settings}
      headerActions={<ContactActions settings={settings} />}
    />
  )
}
