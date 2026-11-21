import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/test/intl'

import { LanguageSwitcher } from './LanguageSwitcher'

const route = vi.hoisted(() => ({
  pathname: '/bg',
  params: { locale: 'bg' } as Record<string, string>,
}))

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  usePathname: () => route.pathname,
  useParams: () => route.params,
}))

beforeEach(() => {
  route.pathname = '/bg'
  route.params = { locale: 'bg' }
})

function links() {
  const nav = screen.getByRole('navigation', { name: 'Език' })
  return {
    bg: within(nav).getByRole('link', { name: /Български/ }),
    en: within(nav).getByRole('link', { name: /English/ }),
  }
}

describe('LanguageSwitcher', () => {
  it('renders one link per locale with native labels, hreflang and lang', () => {
    renderWithIntl(<LanguageSwitcher />)
    const { bg, en } = links()
    expect(screen.getAllByRole('link')).toHaveLength(2)
    expect(bg).toHaveAttribute('hreflang', 'bg')
    expect(bg).toHaveAttribute('lang', 'bg')
    expect(en).toHaveAttribute('hreflang', 'en')
    expect(en).toHaveAttribute('lang', 'en')
  })

  it('marks only the current locale with aria-current', () => {
    renderWithIntl(<LanguageSwitcher />)
    const { bg, en } = links()
    expect(bg).toHaveAttribute('aria-current', 'true')
    expect(en).not.toHaveAttribute('aria-current')
  })

  it('keeps the page on static routes: /bg/uslugi switches to /en/services', () => {
    route.pathname = '/bg/uslugi'
    renderWithIntl(<LanguageSwitcher />)
    const { bg, en } = links()
    expect(bg).toHaveAttribute('href', '/bg/uslugi')
    expect(en).toHaveAttribute('href', '/en/services')
  })

  it('falls back to home on an unknown URL instead of throwing (404 via the catch-all)', () => {
    route.pathname = '/bg/nqma-takava'
    route.params = { locale: 'bg', rest: 'nqma-takava' }
    renderWithIntl(<LanguageSwitcher />)
    const { bg, en } = links()
    expect(bg).toHaveAttribute('href', '/bg')
    expect(en).toHaveAttribute('href', '/en')
  })

  it('fills dynamic params on static routes', () => {
    route.pathname = '/bg/blog/stranica/2'
    route.params = { locale: 'bg', n: '2' }
    renderWithIntl(<LanguageSwitcher />)
    expect(links().en).toHaveAttribute('href', '/en/blog/page/2')
  })

  it('uses the translated slug of a CMS page', () => {
    route.pathname = '/bg/uslugi/detska-stomatologiya'
    renderWithIntl(
      <LanguageSwitcher
        translations={{
          bg: { pathname: '/services/[slug]', params: { slug: 'detska-stomatologiya' } },
          en: { pathname: '/services/[slug]', params: { slug: 'paediatric-dentistry' } },
        }}
      />,
    )
    expect(links().en).toHaveAttribute('href', '/en/services/paediatric-dentistry')
    expect(screen.queryByText(/не е преведена/)).not.toBeInTheDocument()
  })

  it('links a missing translation to the fallback and says so', () => {
    route.pathname = '/bg/blog/parva-vizita'
    renderWithIntl(
      <LanguageSwitcher
        translations={{ bg: { pathname: '/blog/[slug]', params: { slug: 'parva-vizita' } } }}
        fallback="/blog"
      />,
    )
    const { en } = links()
    expect(en).toHaveAttribute('href', '/en/blog')
    const note = within(en).getByText(/не е преведена/)
    expect(note).toHaveAttribute('lang', 'bg')
    expect(note).toHaveClass('sr-only')
  })

  it('uses the English UI strings on English pages', () => {
    route.pathname = '/en'
    route.params = { locale: 'en' }
    renderWithIntl(<LanguageSwitcher />, 'en')
    expect(screen.getByRole('navigation', { name: 'Language' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'English' })).toHaveAttribute('aria-current', 'true')
  })
})
