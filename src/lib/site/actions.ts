import type { Cta, Phone, SiteSettings } from '@/lib/content'
import { formatPhone } from '@/lib/i18n/format'

export type PhoneLink = { href: string; display: string }
export type ActionLink = { href: string; external: boolean }

/** The primary phone as a `tel:` link with the editor's display format (formatted E.164 as fallback). */
export function primaryPhone(settings: Pick<SiteSettings, 'phones'>): PhoneLink | null {
  const phone: Phone | undefined =
    settings.phones.find((p) => p.key === 'primary') ?? settings.phones[0]
  if (!phone) return null
  const formatted = formatPhone(phone.e164)
  return { href: formatted.href, display: phone.display || formatted.display }
}

/** Booking target: the external booking URL, or a call when booking is by phone. */
export function bookingLink(settings: Pick<SiteSettings, 'booking' | 'phones'>): ActionLink | null {
  if (settings.booking.mode === 'externalUrl' && settings.booking.url) {
    return { href: settings.booking.url, external: true }
  }
  const phone = primaryPhone(settings)
  return phone ? { href: phone.href, external: false } : null
}

/** Google Maps directions to the map position, or to the address when there is none (PRD F-10). */
export function directionsUrl(settings: Pick<SiteSettings, 'geo' | 'address'>): string | null {
  const { geo, address } = settings
  const destination = geo
    ? `${geo.lat},${geo.lng}`
    : [address.street, [address.postalCode, address.city].filter(Boolean).join(' ')]
        .filter(Boolean)
        .join(', ')
  if (!destination) return null
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
}

type ActionSettings = Pick<SiteSettings, 'booking' | 'phones' | 'geo' | 'address'>

export type LabelledAction = ActionLink & { label: string }

/** The site's booking button: the navigation's header CTA when set, else the booking settings. */
export function bookingAction(
  settings: ActionSettings,
  headerCta: Cta | null | undefined,
  fallbackLabel: string,
): LabelledAction | null {
  const target = headerCta ? resolveCta(headerCta, settings) : bookingLink(settings)
  if (!target) return null
  return { ...target, label: headerCta?.label || settings.booking.label || fallbackLabel }
}

/** Where a CMS call-to-action goes. `null` when its target isn't configured. */
export function resolveCta(cta: Cta, settings: ActionSettings): ActionLink | null {
  switch (cta.action) {
    case 'link':
      return cta.link ? { href: cta.link.href, external: cta.link.external } : null
    case 'call': {
      const phone = primaryPhone(settings)
      return phone ? { href: phone.href, external: false } : null
    }
    case 'booking':
      return bookingLink(settings)
    case 'directions': {
      const href = directionsUrl(settings)
      return href ? { href, external: true } : null
    }
  }
}
