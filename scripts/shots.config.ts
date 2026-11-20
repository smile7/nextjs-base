/**
 * Routes and viewports for `pnpm shots`.
 * Phase 02 (i18n): switch to '/bg', '/en', '/bg/styleguide'; add the main pages as they land.
 */
export type Viewport = { width: number; height: number }

export const shotsConfig = {
  routes: ['/', '/styleguide'],
  viewports: [
    { width: 360, height: 800 },
    { width: 768, height: 1024 },
    { width: 1280, height: 800 },
  ] satisfies Viewport[],
  outDir: '.screenshots',
  defaultBaseUrl: 'http://localhost:3000',
}
