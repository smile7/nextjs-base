# Architecture Decision Records

Format: Context → Decision → Consequences → Status. To change a decision, add a new ADR that supersedes it. Don't edit history.

## ADR-001 Hybrid i18n in Sanity (document-level for routable, field-level for shared)
- **Context:** Two official plugins exist: `@sanity/document-internationalization` 6.x (document per language, `translation.metadata`) and `sanity-plugin-internationalized-array` 5.x (per-field arrays, `language` key). The doc-i18n plugin itself recommends using both when a project has both kinds of content. The EN version is AI-translated and reviewed later, so it can lag behind BG.
- **Decision:** Document-level for `page`, `article`, `service`, `legalPage`. Field-level for `siteSettings`, `navigation`, `serviceCategory`, `teamMember`, `faqItem`, `galleryItem`, `testimonial`, `announcement`.
- **Consequences:** + per-language slugs/SEO/publishing, clean Presentation mapping, simple queries, no attribute explosion. − Routable content counts ×2 against the 10k document quota (plus metadata docs); this is negligible for small sites. Editors must translate structural changes of pages in both languages (sections can differ per language, which is sometimes a feature).
- **Status:** Accepted.

## ADR-002 Tag-based caching with a signed webhook; no `defineLive`
- **Context:** Sanity recommends `defineLive` for most apps. It subscribes browsers to the Live Content API (Free: 1k live connections per dataset) and shifts work to runtime. Our sites are mostly static, and Workers Free has a 10 ms CPU limit.
- **Decision:** A custom `sanityFetch` (tags, draft-aware, stega in draft mode) + `/api/revalidate` with `parseBody` + `revalidateTag(tag, { expire: 0 })`. Visual Editing via `<VisualEditing/>` in draft mode only.
- **Consequences:** + Static HTML, no client JS for live updates, predictable quotas. − No real-time updates for visitors (not needed). Preview refreshes on mutation, but less instantly than with Live.
- **Status:** Accepted.

## ADR-003 Two cache profiles (ISR default, Static fallback)
- **Context:** OpenNext's recommended small-site setup is R2 + DO queue + D1 tag cache. R2 requires a payment method on file even at $0. ISR regeneration runs inside the Worker (CPU limit on Free).
- **Decision:** Support both profiles, selected per client in `new-client`. ISR is the default. Static (static-assets incremental cache + rebuild via GitHub `repository_dispatch` from the Sanity webhook) is the fallback.
- **Consequences:** Two infra variants to test (CI builds both in the template repo).
- **Status:** Superseded by ADR-012 (2026-11-21): Static is the default, ISR is the optional upgrade.

## ADR-004 `proxy.ts` for next-intl, with a fallback
- **Context:** Next 16 renamed middleware → proxy (Node runtime). OpenNext Cloudflare supports Node middleware experimentally since 1.20.3 (maintainers confirm it is supported in the latest releases, Nov 2026). Edge `middleware.ts` still works but is deprecated.
- **Decision:** Use `src/proxy.ts`. The spike T00.4 deploys it. If it fails or adds unacceptable size/latency, switch to `src/middleware.ts` (same code) and record ADR-004b.
- **Status:** Accepted, pending the spike.

## ADR-005 Sanity CDN image loader instead of Cloudflare Images for CMS images
- **Decision:** A custom `next/image` loader → `cdn.sanity.io` with `auto=format`, width and quality. Hotspot → `object-position`. Local assets only use the `IMAGES` binding.
- **Why:** No Worker CPU, no 5k-transform cap, crops follow the editor's hotspot. `next-sanity/image` is alpha, so revisit later.
- **Status:** Accepted.

## ADR-006 No Cache Components in v1
- **Decision:** Keep `cacheComponents` off. Use fetch-level `next.tags`. Revisit in v2 using the `next-cache-components-adoption` skill once next-intl + next-sanity + OpenNext patterns are well documented together.
- **Status:** Accepted.

## ADR-007 Always-prefixed locales
- **Decision:** `localePrefix: 'always'`, default `bg`. `/` redirects. `x-default` hreflang → `/bg`.
- **Alternative:** `as-needed` (BG at `/`), a one-line config change. Revisit per client if SEO wants root content.
- **Status:** Accepted.

## ADR-008 GitHub Actions deploys
- **Decision:** Deploy with `opennextjs-cloudflare deploy|upload` from GitHub Actions using per-repo secrets, not Workers Builds (which also works and gives 3,000 free build minutes/month, but ties CI to each client's Cloudflare-GitHub app install).
- **Status:** Accepted.

## ADR-009 TypeScript 6.0 and ESLint 9.39
- **Context:** TS 7 (native) is `latest` on npm, but `typescript-eslint` 8.73 peers on `<6.1.0`. ESLint 10 is `latest`, but `eslint-plugin-jsx-a11y` (bundled by `eslint-config-next`) peers on ≤ 9.
- **Decision:** Pin TS 6.0.3 and ESLint 9.39.x. Re-evaluate monthly.
- **Status:** Accepted.

## ADR-010 Studio location (placeholder)
- Embedded `/admin` by default. If the spike shows the Studio bloats the Worker (size/startup), host it at `<client>.sanity.studio` and make `/admin` a redirect.

## ADR-011 No Playwright: no e2e tests, no screenshot script
- **Context:** The owner decided (2026-11-21) to drop Playwright entirely.
- **Decision:** Removed `e2e/`, `playwright.config.ts`, `@playwright/test`, `@axe-core/playwright`, the `e2e` and `shots` scripts (`scripts/shots.ts`) and the CI e2e step. Every e2e, Playwright, axe-in-browser and `pnpm shots` step, AC and Done check in `docs/tasks/*` is **skipped**. Where a behavior can be tested in jsdom (render output, ARIA attributes, keyboard handlers, pure logic), cover it with a Vitest test instead.
- **Consequences:** Keyboard journeys, focus traps, axe on real pages, reduced motion, no-horizontal-scroll and network assertions (consent, map, Turnstile) are no longer verified automatically. WCAG 2.2 AA remains a requirement, now checked manually. Sign-off screenshots for clients are taken by hand. Revisit if regressions appear.
- **Status:** Accepted.

## ADR-012 Static cache profile is the default; ISR is an optional upgrade (supersedes ADR-003)
- **Context:** R2 (needed by the ISR profile's incremental cache) can only be enabled with a payment card on the Cloudflare account, even at $0 usage. The owner decided (2026-11-21) that clients won't add a card, so the template must work out of the box without one. The Phase 00 spike ran on the Static profile only.
- **Decision:** The repo root `wrangler.jsonc` + `open-next.config.ts` are the **Static** profile (`staticAssetsIncrementalCache`, `enableCacheInterception`, no R2/D1/DO). Publishing triggers a rebuild + deploy (Sanity webhook → GitHub `repository_dispatch` → `deploy.yml`). The **ISR** profile (R2 + D1 tag cache + DO queue) lives in `infra/isr/` and is copied to the root only for a client who accepts a card.
- **Consequences:** + No card, no R2/D1 setup, and almost no Worker CPU spent on rendering, because pages are prerendered in CI. − Publishes go live in minutes, not seconds (PRD AC2). The static-assets cache is read-only, so `revalidateTag` refreshes nothing, and a route that was not prerendered (e.g. a CMS page published after the last build with `dynamicParams`) renders on **every** request until the next deploy (CPU cost per request; see the spike results in `docs/PROGRESS.md`). The `/api/revalidate` route is only used by ISR clients. Every Phase 07 route must enumerate all slugs in `generateStaticParams`.
- **Status:** Accepted.
