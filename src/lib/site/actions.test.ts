import { describe, expect, it } from 'vitest'

import type { Cta, Phone, SiteSettings } from '@/lib/content'

import { bookingAction, bookingLink, directionsUrl, primaryPhone, resolveCta } from './actions'

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
