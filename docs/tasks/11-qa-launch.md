# Phase 11 — QA, launch, template packaging

**Goal:** a verified, documented, tagged template (v1.0.0) that becomes a new client site in under a day using `docs/NEW-CLIENT.md`.
**Read first:** `docs/PRD.md` (quality targets), `docs/ARCHITECTURE.md` §10–13, `docs/NEW-CLIENT.md`, `docs/LEGAL-GDPR.md` §10.

---

### T11.1 — Full e2e, accessibility and keyboard suite — automated part SKIPPED (ADR-011); manual screen-reader pass stays
**Steps:** Consolidate the e2e specs: smoke over all sitemap URLs (status 200, one h1, `lang`, title, canonical, no console errors), axe (WCAG 2.2 AA tags: `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`) on every template page in both locales, keyboard journeys (menu, tiles, FAQ, lightbox, form, consent), 200% zoom/reflow at 320 CSS px (no horizontal scroll: WCAG 1.4.10), `prefers-reduced-motion`, forced colors (`forcedColors: 'active'`) sanity check, target size checks for the action bar. Manual pass with VoiceOver (iOS Safari) and NVDA or Narrator, with findings in PROGRESS.
**AC:** Zero axe violations; all journeys pass on mobile/tablet/desktop projects (chromium + webkit).
**Done check:** `pnpm e2e` green in CI.

### T11.2 — Visual regression baselines — SKIPPED (ADR-011)
**Steps:** Playwright `toHaveScreenshot` for `/styleguide` sections and 5 key pages at 3 widths, with masks for dynamic content (dates, announcement) and `reducedMotion`, fonts awaited. Baselines generated in CI's Linux container (document `pnpm e2e:update-shots` via a workflow_dispatch job that commits baselines, to avoid OS font differences). Threshold `maxDiffPixelRatio: 0.01`.
**AC:** An intentional token change shows a diff; unchanged code passes 3 consecutive runs (no flakiness).
**Done check:** CI run links in PROGRESS.

### T11.3 — Security headers and CSP
**Steps:** Implement ARCHITECTURE §10 headers. CSP in `Content-Security-Policy-Report-Only` first (allowlist built from `src/config/csp.ts`, derived from enabled features/analytics provider); route `/admin` gets its own relaxed policy (Studio needs `'unsafe-eval'`? verify against Sanity docs and keep it scoped to `/admin`). Test on preview with the browser console and `securityheaders.com`/Mozilla Observatory. Switch to enforcing after a clean week on a real client (document the switch step in NEW-CLIENT). Add a Cloudflare WAF rate-limiting rule recommendation for the form POST (documented, client-owned).
**AC:** Observatory grade ≥ A on preview (with Report-Only noted); no CSP violations on any page journey in e2e (collect `securitypolicyviolation` events).
**Done check:** e2e assertion + Observatory result in PROGRESS.

### T11.4 — Backup workflow and restore drill
**Steps:** `.github/workflows/backup.yml` per ARCHITECTURE §11 (weekly cron + manual; `npx sanity@<pinned> dataset export production backup.tar.gz` using `SANITY_WRITE_TOKEN` or a read token with export permission; upload artifact with 90-day retention). Restore runbook in NEW-CLIENT (import into a new dataset `restore-YYYYMMDD`, verify, then switch the env var or `--replace`). Perform one drill on the sandbox.
**AC:** The drill succeeds and its timing is recorded; the runbook matches what was done.
**Done check:** artifact link + drill notes in PROGRESS.

### T11.5 — Editor guide and handover pack
**Steps:** `docs/handover/EDITOR-GUIDE.bg.md` (Bulgarian, non-technical, with screenshots): logging in, editing pages and sections, Presentation (preview + click-to-edit), translations workflow (create EN from BG, AI-assisted translation via Sanity MCP/agent by the developer, review), images (alt text, hotspot, child photo consent), announcements (holiday hours), publishing and what happens after (≈10 s live in ISR, 3–5 min in Static), what not to do. `docs/handover/OWNERSHIP.bg.md`: accounts the client owns (Cloudflare, Sanity, Resend, domain, GitHub optional), roles, billing expectations ($0 baseline; R2 card; optional Workers Paid $5/mo), DSR procedure (T09.4).
**AC:** A non-technical reviewer can follow the guide to publish an announcement unaided (dry run with Silvena).
**Done check:** dry-run notes.

### T11.6 — Launch checklist automation
**Steps:** `scripts/launch-check.ts` (`pnpm launch-check --url https://…`): fetches the sitemap and checks every URL (200, canonical = self, hreflang pairs reciprocal, `noindex` absent, OG image reachable, JSON-LD parses), robots allows indexing and points to the sitemap, no `[[placeholders]]` in legal pages, `NEXT_PUBLIC_ENV=production`, styleguide disabled (404), security headers present, contact form test submission (optional flag), DNS email records (SPF/DKIM/DMARC via DoH lookup). Prints a pass/fail table and exits non-zero on failures. NEW-CLIENT §9 references this task.
**AC:** Run against the sandbox production: all automated checks pass, and the remaining manual items are listed at the end of the output.
**Done check:** output pasted into PROGRESS.

### T11.7 — Template packaging and v1.0.0
**Steps**
1. `scripts/new-client.ts` (interactive, `@clack/prompts`): asks the NEW-CLIENT §2 questions, writes `src/config/site.ts`, `.env.local`, `.dev.vars`, `wrangler.jsonc` (worker name, bindings per profile), `open-next.config.ts` (profile), resets `docs/PROGRESS.md` to a client copy, removes demo seed images if requested, and prints the next manual steps. It's idempotent and has a `--dry-run`.
2. Theme presets: `src/styles/presets/{neutral,rumi-dent}.css` (tokens only); `new-client` copies the chosen one into `tokens.css`.
3. Mark the GitHub repo as a **template repository**. Document "Use this template" → private repo in the client's or Silvena's org (NEW-CLIENT §2), and the upstream-sync strategy (NEW-CLIENT: `git remote add template …`, cherry-pick or merge tagged releases).
4. `CHANGELOG.md` v1.0.0, tag `v1.0.0`, and a release note listing the pinned versions and known limitations (from PROGRESS follow-ups).
5. Fresh-clone test: follow NEW-CLIENT end-to-end on a throwaway Sanity project + Cloudflare account and time it (target < 1 day including content seeding; < 2 h technical setup).
**AC:** The fresh-clone test succeeds without undocumented steps (fix the docs where needed).
**Done check:** timing + issues logged in PROGRESS; tag pushed.
