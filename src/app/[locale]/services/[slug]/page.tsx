import type { Metadata } from 'next'
import NextLink from 'next/link'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import { Container } from '@/components/primitives/Container'
import { ContentImage } from '@/components/primitives/ContentImage'
import { Heading } from '@/components/primitives/Heading'
import { Prose } from '@/components/primitives/Prose'
import { Section } from '@/components/primitives/Section'
import { Text } from '@/components/primitives/Text'
import { faqSchemaFromSection } from '@/components/sections/faq-schema'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { SetPageTranslations } from '@/components/site/PageTranslations'
import { badgeVariants } from '@/components/ui/badge'
import {
  getPageByKey,
  getServiceBySlug,
  getServices,
  getSiteSettings,
  getStaticParams,
  RichText,
  withoutStega,
  type CtaBandSection,
  type FaqSection,
} from '@/lib/content'
import { buildAlternates } from '@/lib/seo/alternates'
import { cn } from '@/lib/utils'
import { routing } from '@/i18n/routing'

export const dynamicParams = false

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  if (!hasLocale(routing.locales, params.locale)) return []
  return getStaticParams('service', params.locale)
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/services/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const service = await getServiceBySlug(slug, locale)
  if (!service) return {}
  return withoutStega({
    title: service.seo.title ?? service.title,
    description: service.seo.description ?? service.teaser,
    alternates: buildAlternates(locale, service.translations),
  })
}

export default async function ServicePage({ params }: PageProps<'/[locale]/services/[slug]'>) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const [service, settings, servicesPage, t, tCrumbs] = await Promise.all([
    getServiceBySlug(slug, locale),
    getSiteSettings(locale),
    getPageByKey('services', locale),
    getTranslations('Services'),
    getTranslations('Breadcrumbs'),
  ])
  if (!service || !settings) notFound()

  const related = service.category
    ? (await getServices(locale, { category: service.category.id })).filter(
        (item) => item.id !== service.id,
      )
    : []
  const audience = service.category?.audience

  const faq: FaqSection | null =
    service.faq.length > 0
      ? {
          type: 'faq',
          key: 'service-faq',
          tone: 'soft',
          spacing: 'default',
          heading: t('faqHeading'),
          items: service.faq,
          emitSchema: true,
        }
      : null
  const cta: CtaBandSection = {
    type: 'ctaBand',
    key: 'service-cta',
    tone: 'brand',
    spacing: 'default',
    heading: t('ctaHeading'),
    // Booking by phone resolves to the same `tel:` link as Call, so it would only repeat it.
    ctas: [
      ...(settings.booking.mode === 'externalUrl'
        ? [
            {
              label: t('book'),
              action: 'booking' as const,
              style: 'secondary' as const,
              link: null,
            },
          ]
        : []),
      { label: t('call'), action: 'call', style: 'primary', link: null },
    ],
  }
  const faqSchema = faq ? faqSchemaFromSection(faq) : null

  return (
    <>
      <SetPageTranslations translations={service.translations} fallback="/services" />
      <Section as="div" spacing="compact">
        <Container>
          <Breadcrumbs
            label={tCrumbs('label')}
            items={[
              { label: tCrumbs('home'), href: '/' },
              { label: servicesPage?.title ?? t('all'), href: '/services' },
              { label: service.title },
            ]}
          />
          <div
            className={cn('grid items-center gap-10', service.image && 'lg:grid-cols-2 lg:gap-12')}
          >
            <div>
              {audience === 'children' || audience === 'adults' ? (
                <span className={cn(badgeVariants({ variant: 'soft' }), 'mb-4')}>
                  {t(audience)}
                </span>
              ) : null}
              <Heading as="h1" size="step-4" className="text-balance">
                {service.title}
              </Heading>
              {service.teaser ? (
                <Text size="lead" className="mt-4 max-w-(--container-prose) text-pretty">
                  {service.teaser}
                </Text>
              ) : null}
            </div>
            {service.image ? (
              <ContentImage
                image={service.image}
                sizes="(min-width: 1024px) 45vw, 100vw"
                preload
                className="h-auto w-full rounded-media"
              />
            ) : null}
          </div>
        </Container>
      </Section>

      {service.body ? (
        <Section spacing="compact">
          <Container>
            <Prose>
              <RichText value={service.body} />
            </Prose>
          </Container>
        </Section>
      ) : null}

      {faq ? <SectionRenderer sections={[faq]} locale={locale} site={settings} /> : null}

      {related.length > 0 ? (
        <Section spacing="compact" labelledBy="related-services">
          <Container>
            <Heading as="h2" size="step-3" id="related-services">
              {t('relatedHeading')}
            </Heading>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <NextLink
                    href={item.href}
                    className="flex h-full min-h-11 flex-col gap-2 rounded-tile border border-border bg-surface p-5 shadow-sm transition-shadow duration-(--duration-fast) ease-standard hover:shadow-md"
                  >
                    <span className="font-display text-step-1 font-bold">{item.title}</span>
                    {item.teaser ? (
                      <span className="text-step--1 text-fg-muted">{item.teaser}</span>
                    ) : null}
                  </NextLink>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      <SectionRenderer sections={[cta]} locale={locale} site={settings} />
      {faqSchema ? <JsonLd data={faqSchema} /> : null}
    </>
  )
}
