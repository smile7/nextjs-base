import { Heading } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import type { ContactHoursSection as ContactHoursModel } from '@/lib/content'
import { addressLines, hoursRows } from '@/lib/site/footer'
import { formatDate, formatPhone, formatTimeRange } from '@/lib/i18n/format'
import { getTranslations } from 'next-intl/server'

import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

export async function ContactHoursSection({
  section: raw,
  index,
  sections,
  locale,
  site,
}: SectionComponentProps) {
  const section = raw as ContactHoursModel
  const t = await getTranslations('Sections')
  const titleId = sectionTitleId(section.key)
  const level = sectionHeadingLevel(index, sections)
  const rows = hoursRows(locale, site.openingHours)
  const phone = site.phones[0]

  return (
    <SectionShell section={section} labelledBy={section.heading ? titleId : undefined}>
      {section.heading ? (
        <Heading as={level} size="step-3" id={titleId}>
          {section.heading}
        </Heading>
      ) : null}
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <address className="not-italic">
          <Text className="font-semibold">{site.brandName}</Text>
          {addressLines(site.address).map((line) => (
            <Text key={line} tone="muted">
              {line}
            </Text>
          ))}
          {phone ? (
            <a
              href={formatPhone(phone.e164).href}
              className="mt-4 inline-flex min-h-11 items-center font-semibold text-link tabular-nums"
            >
              {phone.display || formatPhone(phone.e164).display}
            </a>
          ) : null}
          {site.email ? (
            <div className="mt-2">
              <a href={`mailto:${site.email}`} className="text-link underline underline-offset-4">
                {site.email}
              </a>
            </div>
          ) : null}
        </address>
        <table className="w-full border-collapse text-left text-step-0">
          <caption className="sr-only">{section.heading}</caption>
          <tbody>
            {rows.map((row) => (
              <tr key={row.days} className="border-b border-border">
                <th scope="row" className="py-3 pe-4 font-semibold">
                  {row.days}
                </th>
                <td className="py-3 text-fg-muted tabular-nums">
                  {row.time ?? t('hoursClosed')}
                  {row.note ? <span className="block text-step--1">{row.note}</span> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {site.specialHours.length > 0 ? (
        <div className="mt-8">
          <Heading as="h3" size="step-1">
            {t('hoursSpecial')}
          </Heading>
          <ul className="mt-4 space-y-2">
            {site.specialHours.map((entry) => {
              const labelSuffix = entry.label ? `${' — '}${entry.label}` : ''
              const timeSuffix = entry.closed
                ? `${' · '}${t('hoursClosed')}`
                : entry.opens && entry.closes
                  ? `${' · '}${formatTimeRange(entry.opens, entry.closes)}`
                  : ''
              return (
                <li key={`${entry.date}-${entry.label ?? ''}`} className="text-fg-muted">
                  <time dateTime={entry.date}>{formatDate(locale, entry.date, site.timeZone)}</time>
                  {labelSuffix ? <span>{labelSuffix}</span> : null}
                  {timeSuffix ? <span className="tabular-nums">{timeSuffix}</span> : null}
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
      {section.showMap ? (
        <div
          className="mt-10 flex min-h-48 items-center justify-center rounded-card border border-dashed border-border bg-surface-muted text-fg-muted"
          role="img"
          aria-label={t('contactMapPlaceholder')}
        >
          {t('contactMapPlaceholder')}
        </div>
      ) : null}
      {section.note ? (
        <Text tone="muted" className="mt-8 max-w-(--container-prose)">
          {section.note}
        </Text>
      ) : null}
    </SectionShell>
  )
}