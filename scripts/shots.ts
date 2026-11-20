/**
 * Full-page screenshots of key routes at every viewport + an index.html contact sheet.
 * Run against a running server: `pnpm dev` (or `pnpm preview`), then `pnpm shots [--base-url URL]`.
 * Output: .screenshots/<YYYY-MM-DD>/<route>-<width>.png
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { chromium, type Browser } from '@playwright/test'
import { shotsConfig, type Viewport } from './shots.config'

type Shot = { route: string; width: number; file: string; status: number | null }

/** '/' → 'home', '/bg/styleguide' → 'bg-styleguide'. */
export function routeSlug(route: string): string {
  const slug = route.replace(/^\/+|\/+$/g, '').replace(/[^\p{L}\p{N}_-]+/gu, '-')
  return slug || 'home'
}

function today(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c,
  )
}

// The Next dev-tools badge would otherwise show up in every dev screenshot.
const HIDE_DEV_OVERLAY = 'nextjs-portal { display: none !important; }'

async function shootViewport(
  browser: Browser,
  baseUrl: string,
  viewport: Viewport,
  outDir: string,
): Promise<Shot[]> {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const shots: Shot[] = []
  for (const route of shotsConfig.routes) {
    const response = await page.goto(new URL(route, baseUrl).href, { waitUntil: 'networkidle' })
    await page.addStyleTag({ content: HIDE_DEV_OVERLAY })
    // Scroll through once so lazy images and in-view content load, then back to the top.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
        window.scrollTo(0, y)
        await new Promise((done) => setTimeout(done, 50))
      }
      window.scrollTo(0, 0)
    })
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => document.fonts.ready)

    const file = `${routeSlug(route)}-${viewport.width}.png`
    await page.screenshot({ path: join(outDir, file), fullPage: true })
    shots.push({ route, width: viewport.width, file, status: response?.status() ?? null })
  }
  await context.close()
  return shots
}

function contactSheet(shots: Shot[], baseUrl: string, date: string): string {
  const rows = shotsConfig.routes
    .map((route) => {
      const cells = shots
        .filter((shot) => shot.route === route)
        .sort((a, b) => a.width - b.width)
        .map(
          (
            shot,
          ) => `<figure><a href="${shot.file}"><img src="${shot.file}" alt="" loading="lazy"></a>
<figcaption>${shot.width}px${shot.status && shot.status >= 400 ? ` · HTTP ${shot.status}` : ''}</figcaption></figure>`,
        )
        .join('\n')
      return `<section><h2>${escapeHtml(route)}</h2><div class="row">${cells}</div></section>`
    })
    .join('\n')

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Screenshots ${date}</title>
<style>
  body { font: 14px/1.4 system-ui, sans-serif; margin: 24px; background: #f4f4f2; color: #1d1d1b; }
  .row { display: flex; gap: 16px; align-items: flex-start; overflow-x: auto; }
  figure { margin: 0; background: #fff; padding: 8px; border-radius: 8px; }
  img { display: block; width: 320px; height: auto; border: 1px solid #ddd; }
  figcaption { margin-top: 6px; color: #555; }
  h2 { margin: 32px 0 12px; font-size: 16px; }
</style></head>
<body><h1>Screenshots · ${date}</h1><p>${escapeHtml(baseUrl)} · reduced motion · full page</p>
${rows}
</body></html>
`
}

async function main() {
  const { values } = parseArgs({ options: { 'base-url': { type: 'string' } } })
  const baseUrl = values['base-url'] ?? shotsConfig.defaultBaseUrl

  try {
    await fetch(baseUrl, { method: 'HEAD' })
  } catch {
    console.error(`No server at ${baseUrl}. Start one first (\`pnpm dev\` or \`pnpm preview\`).`)
    process.exit(1)
  }

  const date = today()
  const outDir = resolve(shotsConfig.outDir, date)
  mkdirSync(outDir, { recursive: true })

  const started = performance.now()
  const browser = await chromium.launch()
  try {
    const perViewport = await Promise.all(
      shotsConfig.viewports.map((viewport) => shootViewport(browser, baseUrl, viewport, outDir)),
    )
    const shots = perViewport.flat()
    writeFileSync(join(outDir, 'index.html'), contactSheet(shots, baseUrl, date))

    for (const shot of shots.filter((s) => s.status !== null && s.status >= 400)) {
      console.warn(`warning: ${shot.route} returned HTTP ${shot.status}`)
    }
    const seconds = ((performance.now() - started) / 1000).toFixed(1)
    console.log(`${shots.length} screenshots in ${seconds}s → ${join(outDir, 'index.html')}`)
  } finally {
    await browser.close()
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
}
