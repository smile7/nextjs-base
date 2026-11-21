import type { ImageLoaderProps } from 'next/image'

export const DEFAULT_IMAGE_QUALITY = 75

/**
 * `next/image` loader for Sanity CDN images (ADR-005): the CDN resizes and picks the format, so
 * these images skip the Cloudflare Images binding. `src` may already carry a crop `rect`.
 */
export function sanityImageLoader({ src, width, quality }: ImageLoaderProps): string {
  const url = new URL(src)
  url.searchParams.set('w', String(width))
  url.searchParams.set('q', String(quality ?? DEFAULT_IMAGE_QUALITY))
  url.searchParams.set('auto', 'format')
  url.searchParams.set('fit', 'max')
  return url.toString()
}
