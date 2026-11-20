import { describe, expect, it } from 'vitest'

import { routeSlug } from './shots'

describe('routeSlug', () => {
  it.each([
    ['/', 'home'],
    ['/styleguide', 'styleguide'],
    ['/bg/styleguide', 'bg-styleguide'],
    ['/en/services/', 'en-services'],
    ['/bg/услуги', 'bg-услуги'],
    ['/blog?page=2', 'blog-page-2'],
  ])('%s → %s', (route, slug) => {
    expect(routeSlug(route)).toBe(slug)
  })
})
