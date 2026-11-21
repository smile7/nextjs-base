# Phase 04 — Content layer, caching, preview

**Goal:** a thin, typed, CMS-agnostic content API (`@/lib/content`) with tag-based caching, webhook revalidation, draft mode and Presentation. Components never see Sanity shapes.
**Read first:** `docs/ARCHITECTURE.md` §5–6, `docs/DECISIONS.md` ADR-002/003/005, `.cursor/rules/content-layer.mdc`.

---

### T04.1 — Client and `sanityFetch`
**Steps:** `src/lib/content/sanity/client.ts` (`createClient` from `next-sanity`, `useCdn: true`, `perspective: 'published'`, `stega: { studioUrl }` disabled by default). `token.ts` (`server-only`, read token). `fetch.ts` implementing the contract in ARCHITECTURE §5.2 exactly (required `tags`, draft-mode switch, `stega` rules). `tags.ts` helpers (`tags.global`, `tags.type(t)`, `tags.doc(id)`).
**AC:** Calling `sanityFetch` without tags is a type error; draft mode uses the token, otherwise no token is sent.
**Done check:** unit tests with a mocked client (assert options per mode).

### T04.2 — Domain types, mappers, ContentImage, RichText
**Steps**
1. `src/lib/content/types.ts`: CMS-agnostic models (`SiteSettings`, `Navigation`, `Page`, `Service`, `Article`, `LegalPage`, `TeamMember`, `FaqItem`, `GalleryItem`, `Testimonial`, `Announcement`, `Section` union, `ImageAsset`, `RichTextValue` (opaque type alias), `LinkTarget` (`{ href, external, label }`), `Translations = Partial<Record<Locale, string>>` (href per locale)).
2. `queries/*.ts` with `defineQuery` (so typegen picks them up). Use shared projections in `fragments.ts` as **plain string constants interpolated** into `defineQuery`. Verify typegen handles them; if not, inline the fragments (note in PROGRESS).
3. Field-level i18n in GROQ: `coalesce(title[language == $locale][0].value, title[language == $fallback][0].value)`. Pass `$locale` and `$fallback = 'bg'`.
4. `mappers/*.ts`: typegen result → domain types; `stegaClean` enum-like values; resolve internal links to localized hrefs via `getPathname`; drop unknown sections with a dev warning.
5. `image-loader.ts` (ADR-005) and `ContentImage` (server component using `next/image` with the loader, `sizes` required prop, `lqip` placeholder, hotspot → `objectPosition`). `RichText` (`@portabletext/react` with our primitives; internal links via next-intl `Link`; images via ContentImage; headings shifted so the page owns h1).
**AC:** No `sanity.types` import outside `src/lib/content/sanity/**`. Mappers have unit tests with fixture data.
**Done check:** `pnpm test src/lib/content`.

### T04.3 — Public API (`get*`) and tests
**Steps:** `src/lib/content/index.ts` exports: `getSiteSettings(locale)`, `getNavigation(locale)`, `getActiveAnnouncement(locale)` (revalidate 3600, filters by `now()`), `getPageByKey(key, locale)`, `getPageBySlug(slug, locale)`, `getServices(locale, { category? })`, `getServiceBySlug`, `getArticles(locale, { page, pageSize })` (returns `{ items, total, pages }`), `getArticleBySlug`, `getLegalPage`, `getTeam`, `getFaq({ category? })`, `getGallery({ album?, limit? })`, `getTestimonials({ featured? })`, `getTranslations(docId)` (for the switcher and hreflang), `getStaticSlugs(type)` (for `generateStaticParams`, `stega: false`). Each is wrapped in React `cache()`. Each function documents its tags.
**AC:** Every function returns domain types or `null`; never throws on missing content (logs and returns null; route decides `notFound()`).
**Done check:** unit tests for the param/tag/null behavior; a local script `pnpm tsx scripts/smoke-content.ts` prints a summary from the development dataset.

### T04.4 — `/api/revalidate` and cache profiles
**Steps:** Route handler per ARCHITECTURE §6.3 (`parseBody(req, secret, true)`, 401 on bad signature, 400 on missing `_type`, tag mapping, `revalidateTag(tag, { expire: 0 })`, JSON response, `runtime` default (no edge)). Unit-test the tag mapping. Configure the Sanity webhook on the sandbox (dataset `development` for preview, `production` for prod). Verify the full loop on the preview worker: publish in Studio → page shows the change within ~10 s. Also implement `CACHE_PROFILE=static` wiring (`infra/static/*` copied by a script `scripts/use-profile.ts`), and verify that the Static profile builds.
**AC:** Valid webhook → 200 with tags; invalid → 401; end-to-end publish works on ISR; Static profile builds and deploys.
**Done check:** `curl` with a bad signature → 401; screen recording/notes in PROGRESS of the publish test.

### T04.5 — Draft mode, PreviewTools, Presentation
**Steps:** `/api/draft-mode/enable` (`defineEnableDraftMode`), `/api/draft-mode/disable` (redirect back, safe-redirect same-origin only). `src/lib/content/preview.tsx` (`PreviewTools`: `<VisualEditing />` + "Exit preview" button hidden in Presentation). Render it in the `[locale]` layout only when draft mode is on. `src/sanity/presentation/resolve.ts`: `locations` for page/service/article/legalPage using the **same** pathnames (import from `src/i18n/pathnames.ts`, no duplication), `mainDocuments` for each route pattern. Add `presentationTool` to the Studio.
**AC:** In Presentation, clicking any visible text focuses the field; drafts show without publishing; metadata and JSON-LD never contain stega characters (test: `stegaClean(x) === x` on rendered `<head>`).
**Done check:** manual Presentation test on preview; unit test that the metadata and JSON-LD builders return stega-clean values for stega-encoded input; manual check of the page source in draft mode for zero-width characters in `<head>`.

### T04.6 — Boundary enforcement
**Steps:** ESLint `no-restricted-imports`: `@/lib/content/sanity/*`, `next-sanity`, `@sanity/*` and `sanity.types` are forbidden outside `src/lib/content/**`, `src/sanity/**`, `src/app/admin/**`, `src/app/api/**`, `scripts/**`, `sanity.*.ts`. `scripts/check-boundaries.ts` double-checks via the import graph (simple regex scan is enough) and runs in `pnpm check`.
**AC:** An intentional violation in a component fails `pnpm check` with a message pointing to `.cursor/rules/content-layer.mdc`.
**Done check:** add a violating import → fails; remove → passes.

### T04.7 — Static params and sitemap data
**Steps:** `getSitemapEntries()` in the content layer: all published routable docs with `_updatedAt`, language and translation map (for alternates). Static params helpers per route (`locale × slug`). `dynamicParams = true` on CMS routes.
**AC:** Returns correct localized URLs for both languages, including system pages via pathnames.
**Done check:** unit test with fixtures; `pnpm build` output lists the prerendered routes.
