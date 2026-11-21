import type { NextConfig } from 'next'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
import createNextIntlPlugin from 'next-intl/plugin'
import { BUILD_REQUIRED_PUBLIC_ENV, readPublicEnv } from './src/env'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

readPublicEnv(...BUILD_REQUIRED_PUBLIC_ENV)

const nextConfig: NextConfig = {
  poweredByHeader: false,
  trailingSlash: false,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
    qualities: [60, 75, 85],
  },
  logging: {
    fetches: { fullUrl: process.env.NODE_ENV === 'development' },
  },
}

export default withNextIntl(nextConfig)

initOpenNextCloudflareForDev()
