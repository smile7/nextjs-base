import { describe, expect, it } from 'vitest'

import type { Cta, Phone, SiteSettings } from '@/lib/content'

import {
  bookingAction,
  bookingLink,
  directionsUrl,
  mobileBarActions,
  primaryPhone,
  resolveCta,
} from './actions'

const phone = (key: Phone['key'], e164: string, display = ''): Phone => ({ key, e164, display })

const settings: Pick<SiteSettings, 'booking' | 'phones' | 'geo' | 'address'> = {
  booking: { mode: 'phone' },
  phones: [phone('primary', '+35982841190', '082 841 190')],
  geo: { lat: 43.8486, lng: 25.9534 },
  address: { street: 'ул. Александровска 1', postalCode: '7000', city: 'Русе', countryCode: 'BG' },
}

const cta = (action: Cta['action'], link: Cta['link'] = null): Cta => ({
  label: 'x',
  action,
  style: 'primary',
  link,
})

describe('primaryPhone', () => {
  it('prefers the primary phone and keeps the editor display', () => {
    expect(
      primaryPhone({
        phones: [
          phone('secondary', '+359888123456'),
          phone('primary', '+35982841190', '082 841 190'),
        ],
      }),
    ).toEqual({ href: 'tel:+35982841190', display: '082 841 190' })
  })

  it('falls back to the first phone and a formatted display', () => {
    const result = primaryPhone({ phones: [phone('secondary', '+35982841190')] })
    expect(result?.href).toBe('tel:+35982841190')
    expect(result?.display).not.toBe('')
  })

  it('returns null without phones', () => {
    expect(primaryPhone({ phones: [] })).toBeNull()
  })
})

describe('bookingLink', () => {
  it('calls when booking is by phone', () => {
    expect(bookingLink(settings)).toEqual({ href: 'tel:+35982841190', external: false })
  })

  it('uses the external booking URL', () => {
    expect(
      bookingLink({ ...settings, booking: { mode: 'externalUrl', url: 'https://book.example' } }),
    ).toEqual({ href: 'https://book.example', external: true })
  })

  it('returns null with neither URL nor phone', () => {
    expect(bookingLink({ booking: { mode: 'phone' }, phones: [] })).toBeNull()
  })
})

describe('directionsUrl', () => {
  it('prefers coordinates', () => {
    expect(directionsUrl(settings)).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=43.8486%2C25.9534',
    )
  })

  it('falls back to the address', () => {
    expect(directionsUrl({ address: settings.address })).toBe(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('ул. Александровска 1, 7000 Русе')}`,
    )
  })

  it('returns null without position or address', () => {
    expect(directionsUrl({ address: { countryCode: 'BG' } })).toBeNull()
  })
})

describe('bookingAction', () => {
  it('uses the header CTA label and target', () => {
    expect(
      bookingAction(settings, { ...cta('booking'), label: 'Запишете час' }, 'fallback'),
    ).toEqual({
      href: 'tel:+35982841190',
      external: false,
      label: 'Запишете час',
    })
  })

  it('falls back to the booking settings, then the message', () => {
    expect(
      bookingAction({ ...settings, booking: { mode: 'phone', label: 'Обадете се' } }, null, 'fb')
        ?.label,
    ).toBe('Обадете се')
    expect(bookingAction(settings, undefined, 'fb')?.label).toBe('fb')
  })
})

describe('mobileBarActions', () => {
  const labels = {
    call: 'call',
    directions: 'dir',
    book: 'book',
    viber: 'viber',
    whatsapp: 'wa',
    email: 'mail',
  }
  const full = {
    ...settings,
    email: 'hello@example.bg',
    socials: [{ platform: 'viber' as const, url: 'viber://chat?number=%2B359888123456' }],
  }
  const kinds = (...args: Parameters<typeof mobileBarActions>) =>
    mobileBarActions(...args).map((a) => a.kind)
  const external = { href: 'https://book.example', external: true, label: 'Book' }

  it('returns call, directions and an external booking', () => {
    expect(
      kinds(full, { showDirections: true, secondaryAction: 'booking' }, external, labels),
    ).toEqual(['call', 'directions', 'booking'])
  })

  it('drops a booking that only repeats the call', () => {
    const byPhone = bookingAction(full, null, 'x')
    expect(
      kinds(full, { showDirections: true, secondaryAction: 'booking' }, byPhone, labels),
    ).toEqual(['call', 'directions'])
  })

  it('supports email and messengers, and hides directions when disabled', () => {
    expect(kinds(full, { showDirections: false, secondaryAction: 'email' }, null, labels)).toEqual([
      'call',
      'email',
    ])
    const viber = mobileBarActions(
      full,
      { showDirections: false, secondaryAction: 'viber' },
      null,
      labels,
    )
    expect(viber[1]).toMatchObject({ kind: 'message', label: 'viber', external: true })
    expect(
      kinds(full, { showDirections: false, secondaryAction: 'whatsapp' }, null, labels),
    ).toEqual(['call'])
  })
})

describe('resolveCta', () => {
  it('resolves every action', () => {
    expect(
      resolveCta(cta('link', { href: '/bg/za-nas', external: false, label: 'x' }), settings),
    ).toEqual({
      href: '/bg/za-nas',
      external: false,
    })
    expect(resolveCta(cta('link'), settings)).toBeNull()
    expect(resolveCta(cta('call'), settings)?.href).toBe('tel:+35982841190')
    expect(resolveCta(cta('booking'), settings)?.href).toBe('tel:+35982841190')
    expect(resolveCta(cta('directions'), settings)?.external).toBe(true)
  })
})
