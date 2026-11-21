'use client'

import { ChevronDownIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useId, useState } from 'react'

import { Heading } from '@/components/primitives/Heading'
import { ContentIcon } from '@/components/primitives/ContentIcon'
import NextLink from 'next/link'
import { Link } from '@/i18n/navigation'
import { RichText } from '@/lib/content'
import type { Locale } from '@/config/i18n'
import type { TileItem, TilesSection } from '@/lib/content'
import { cn } from '@/lib/utils'

type TilesGridProps = {
  section: TilesSection
  locale: Locale
  tileHeadingLevel: 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export function TilesGrid({ section, locale, tileHeadingLevel }: TilesGridProps) {
  const t = useTranslations('Sections')
  const listId = useId()
  const [openKeys, setOpenKeys] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    const hash = window.location.hash.replace(/^#/, '')
    const match = section.items.find((item) => item.slug === hash)
    return match ? new Set([match.key]) : new Set()
  })

  const toggle = useCallback(
    (item: TileItem) => {
      setOpenKeys((prev) => {
        const next = new Set(section.allowMultiple ? prev : [])
        const isOpen = prev.has(item.key)
        if (isOpen) {
          next.delete(item.key)
        } else {
          next.add(item.key)
          if (item.slug) {
            history.replaceState(null, '', `#${item.slug}`)
          }
        }
        return next
      })
    },
    [section.allowMultiple],
  )

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '')
    if (!hash) return
    const match = section.items.find((item) => item.slug === hash)
    if (!match || !openKeys.has(match.key)) return
    requestAnimationFrame(() => {
      document.getElementById(`tile-${match.key}`)?.scrollIntoView({ block: 'nearest' })
    })
  }, [openKeys, section.items])

  const cols =
    section.density === 'compact'
      ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      : 'min-[30rem]:grid-cols-2 lg:grid-cols-3'

  return (
    <ul className={cn('grid grid-flow-dense gap-4', cols)} id={listId}>
      {section.items.map((item) => {
        const isOpen = openKeys.has(item.key)
        const panelId = `tile-panel-${item.key}`
        const buttonId = `tile-${item.key}`
        return (
          <li key={item.key} className="contents">
            <Heading as={tileHeadingLevel} size="step-0" className="m-0">
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item)}
                className={cn(
                  'flex min-h-30 w-full flex-col items-start gap-3 rounded-tile border border-border bg-surface p-5 text-left shadow-sm transition-[box-shadow,transform] duration-(--duration-base) ease-standard hover:shadow-md',
                  isOpen && 'shadow-md',
                )}
              >
                <span className="flex w-full items-start justify-between gap-3">
                  <span className="flex flex-col gap-2">
                    {item.icon ? <ContentIcon name={item.icon} className="text-accent" /> : null}
                    <span className="font-display text-step-1 font-bold">{item.title}</span>
                    {item.teaser ? (
                      <span className="text-step--1 text-fg-muted">{item.teaser}</span>
                    ) : null}
                  </span>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className={cn(
                      'size-6 shrink-0 text-primary transition-transform duration-(--duration-base)',
                      isOpen && 'rotate-180',
                    )}
                  />
                </span>
              </button>
            </Heading>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              data-tile-panel=""
              data-open={isOpen ? 'true' : 'false'}
              // @ts-expect-error React 19.3: until-found for find-in-page
              hidden={isOpen ? undefined : 'until-found'}
              className="col-span-full rounded-card border border-border bg-surface-muted p-6"
              onBeforeMatch={() => setOpenKeys((prev) => new Set(prev).add(item.key))}
            >
              {item.body ? (
                <div className="prose-theme max-w-(--container-prose)">
                  <RichText value={item.body} />
                </div>
              ) : null}
              {item.cta?.link ? (
                <NextLink
                  href={item.cta.link.href}
                  className="mt-6 inline-flex min-h-11 items-center font-semibold text-link underline underline-offset-4"
                >
                  {item.cta.label}
                </NextLink>
              ) : section.source === 'services' && item.slug ? (
                <Link
                  href={{ pathname: '/services/[slug]', params: { slug: item.slug } }}
                  locale={locale}
                  className="mt-6 inline-flex min-h-11 items-center font-semibold text-link underline underline-offset-4"
                >
                  {t('readMore')}
                </Link>
              ) : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}