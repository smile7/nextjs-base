import type { Phone, SiteSettings } from '@/lib/content'
import { formatPhone } from '@/lib/i18n/format'

export type PhoneLink = { href: string; display: string }

/** The primary phone as a `tel:` link with the editor's display format (formatted E.164 as fallback). */
export function primaryPhone(settings: Pick<SiteSettings, 'phones'>): PhoneLink | null {
  const phone: Phone | undefined =
    settings.phones.find((p) => p.key === 'primary') ?? settings.phones[0]
  if (!phone) return null
  const formatted = formatPhone(phone.e164)
  return { href: formatted.href, display: phone.display || formatted.display }
}
