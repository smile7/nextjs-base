import { readPublicEnv } from '@/env'

export type AnalyticsProvider = 'none' | 'cloudflare' | 'umami' | 'ga4'

export type AnalyticsConfig =
  | { provider: 'none' }
  | { provider: 'cloudflare'; token: string }
  | { provider: 'umami'; websiteId: string; src: string }
  | { provider: 'ga4'; measurementId: string }

export type AnalyticsEnv = {
  NEXT_PUBLIC_ANALYTICS: AnalyticsProvider
  NEXT_PUBLIC_CF_BEACON_TOKEN?: string | undefined
  NEXT_PUBLIC_UMAMI_WEBSITE_ID?: string | undefined
  NEXT_PUBLIC_UMAMI_SRC?: string | undefined
  NEXT_PUBLIC_GA_ID?: string | undefined
}

/** Picks the adapter from env only. A provider without its ID falls back to `none`. */
export function resolveAnalytics(env: AnalyticsEnv): AnalyticsConfig {
  switch (env.NEXT_PUBLIC_ANALYTICS) {
    case 'cloudflare':
      return env.NEXT_PUBLIC_CF_BEACON_TOKEN
        ? { provider: 'cloudflare', token: env.NEXT_PUBLIC_CF_BEACON_TOKEN }
        : { provider: 'none' }
    case 'umami':
      return env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && env.NEXT_PUBLIC_UMAMI_SRC
        ? {
            provider: 'umami',
            websiteId: env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
            src: env.NEXT_PUBLIC_UMAMI_SRC,
          }
        : { provider: 'none' }
    case 'ga4':
      return env.NEXT_PUBLIC_GA_ID
        ? { provider: 'ga4', measurementId: env.NEXT_PUBLIC_GA_ID }
        : { provider: 'none' }
    default:
      return { provider: 'none' }
  }
}

/** The configured adapter for this build (public env is inlined, so this works on the client too). */
export function analyticsConfig(): AnalyticsConfig {
  return resolveAnalytics(
    readPublicEnv(
      'NEXT_PUBLIC_ANALYTICS',
      'NEXT_PUBLIC_CF_BEACON_TOKEN',
      'NEXT_PUBLIC_UMAMI_WEBSITE_ID',
      'NEXT_PUBLIC_UMAMI_SRC',
      'NEXT_PUBLIC_GA_ID',
    ),
  )
}
