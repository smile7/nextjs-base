import { describe, expect, it } from 'vitest'

import { sanityImageLoader } from './image-loader'

describe('sanityImageLoader', () => {
  it('adds width, quality, auto format and fit to the CDN url', () => {
    const url = new URL(
      sanityImageLoader({ src: 'https://cdn.sanity.io/images/p/d/abc-1200x800.jpg', width: 640 }),
    )
    expect(Object.fromEntries(url.searchParams)).toEqual({
      w: '640',
      q: '75',
      auto: 'format',
      fit: 'max',
    })
  })

  it('keeps an existing crop rect and honours the quality', () => {
    const url = new URL(
      sanityImageLoader({
        src: 'https://cdn.sanity.io/images/p/d/abc-1200x800.jpg?rect=300,0,600,400',
        width: 1080,
        quality: 60,
      }),
    )
    expect(url.searchParams.get('rect')).toBe('300,0,600,400')
    expect(url.searchParams.get('q')).toBe('60')
  })
})
