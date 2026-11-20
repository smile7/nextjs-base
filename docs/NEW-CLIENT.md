# New Client Checklist

Spin up a new client site from the template. Target: **≤ 2 developer days to "content-ready"**. Work top to bottom. Each step says who does it: **[D]** developer, **[C]** client, **[D+C]** together.

## 0. Before you start (sales/contract)
- [ ] [D] The contract clause says: "Third-party service fees (hosting, CMS, email, domain) are borne by the client. Expected $0–10/month."
- [ ] [D] Decide the **cache profile**: ISR (needs a card on the Cloudflare account for R2, still $0) or Static (card-free, publishes go live in ~3–5 min). Decide the **Workers plan**: Free, or Paid $5/mo (recommended if the Phase 00 spike showed CPU-limit hits).
- [ ] [D] Gather: legal entity data (name, ЕИК, address, registrations), domain registrar access, logo/wordmark wishes, brand colors (if any), photos, team bios, services list, hours, phones, socials, booking method.

## 1. Accounts (client-owned, developer invited)
- [ ] [C] **Cloudflare** account with the client's email. Invite [D] as Administrator (or a custom role: Workers Admin, DNS, R2, D1, Turnstile, Analytics). If ISR: add a payment method.
- [ ] [C] **Sanity** account/organization → [D] creates the project inside the client's org (or transfers it later). Invite [D] as Administrator. Client editors are invited as Administrator too (Free plan roles: Administrator/Viewer only).
- [ ] [C] **Resend** account (or [D]'s account if agreed; Free allows 3 domains). Add the sending domain `mail.<domain>`.
- [ ] [C] **Google**: Business Profile (owner = client), Search Console (client owner, [D] full user). GA4 only if requested.
- [ ] [C] Optional: Umami Cloud Hobby (1 site free).
- [ ] [D] Store all credentials in a shared password manager vault for the client.

## 2. Repository
- [ ] [D] GitHub: "Use this template" → `client-<slug>-site` (private).
- [ ] [D] `pnpm install`, then `pnpm new-client` (interactive). It asks for: client slug, brand names per locale, production domain, Sanity project ID, datasets, cache profile, locales (default `bg`, `en`) and analytics provider. It writes `src/config/site.ts`, `.env.local`, `.dev.vars`, `wrangler.jsonc` (worker name, bindings per profile) and `open-next.config.ts`, and resets `docs/PROGRESS.md` for the client.
- [ ] [D] Update the `README.md` header (client name, URLs, who to contact).

## 3. Sanity
- [ ] [D] `pnpm sanity login`, then confirm `sanity.cli.ts` has the project ID and dataset.
- [ ] [D] Create datasets: `production`, `development` (both public on Free).
- [ ] [D] API → Tokens: `SANITY_API_READ_TOKEN` (Viewer) for the site, `SANITY_WRITE_TOKEN` (Editor) for seeding/backups, kept local + GH secret only.
- [ ] [D] API → CORS origins (with credentials): `http://localhost:3000`, the preview URL pattern (`https://*.<account>.workers.dev`), `https://<domain>`, `https://www.<domain>`.
- [ ] [D] `pnpm seed --client --dataset production` → structure: system pages (home/services/about/gallery/blog/contact) with default sections, empty settings, legal templates.
- [ ] [D] Optional: `pnpm sanity deploy` → `<slug>.sanity.studio` (hosted Studio as a backup entry point).
- [ ] [D] Webhook (Manage → API → Webhooks), **1 of the 2 allowed on Free**:
  - ISR: URL `https://<domain>/api/revalidate` (use the workers.dev URL until DNS is ready), dataset `production`, triggers create/update/delete, filter `!(_type match "sanity.*")`, projection `{_id, _type, "slug": slug.current, language}`, secret = `SANITY_REVALIDATE_SECRET`, POST, **"Trigger webhook when drafts are modified" off**.
  - Static: URL `https://api.github.com/repos/<owner>/<repo>/dispatches`, headers `Authorization: Bearer <fine-grained PAT with contents:write on this repo>`, `Accept: application/vnd.github+json`, body projection `{"event_type": "sanity-publish"}`.

## 4. Cloudflare
- [ ] [D] `wrangler login` (or an API token scoped to the client account), then check `account_id`.
- [ ] [D] ISR profile: `wrangler r2 bucket create <slug>-next-cache --jurisdiction eu`, `wrangler d1 create <slug>-tag-cache`, and paste the IDs into `wrangler.jsonc`. The DO queue needs no setup beyond `migrations`.
- [ ] [D] Turnstile: add a widget (managed mode) for `<domain>` + `localhost`, giving the site key + secret.
- [ ] [D] Secrets: `wrangler secret put SANITY_API_READ_TOKEN`, `SANITY_REVALIDATE_SECRET` (random 32+ chars), `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`. Vars in `wrangler.jsonc`: `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`.
- [ ] [D] GitHub repo secrets: `CLOUDFLARE_API_TOKEN` (Workers Scripts:Edit, Account Settings:Read, R2/D1 edit if ISR, Workers Routes, Zone DNS), `CLOUDFLARE_ACCOUNT_ID`, `SANITY_WRITE_TOKEN` (backup), plus build vars (`NEXT_PUBLIC_*`) as repository **variables**.
- [ ] [D] First deploy: push to `main` → check the workers.dev URL works.
- [ ] [D] Observability: `"observability": { "enabled": true }` in wrangler. Check the logs appear.

## 5. Theme and brand (Phase "client design", 0.5–1 day)
- [ ] [D] Collect references + real photos → put photos in `seed/client-images/` (not `public/`, since content photos belong in Sanity).
- [ ] [D] In Cursor with the `frontend-design` skill: "Propose 2 theme directions for <client> based on @docs/DESIGN-SYSTEM.md §13-style analysis and these photos @seed/client-images/…". Pick one.
- [ ] [D] Edit `src/styles/tokens.css` (palette, tones, radius family, shadows), `src/config/fonts.ts` (Cyrillic check), and the `Wordmark` styling. Logo SVG → `public/brand/`.
- [ ] [D] Favicons/app icons from the logo/wordmark (`app/[locale]/icon.png`, `apple-icon.png`). OG fallback image.
- [ ] [D] Run `pnpm shots` → send `/styleguide` screenshots + preview URL to the client → **[C] sign-off** (written, by email). Then set `NEXT_PUBLIC_ENABLE_STYLEGUIDE=false` for production.

## 6. Content
- [ ] [D+C] siteSettings: names, address, geo (from Google Maps), phones (E.164 + display), hours (incl. special hours), map embed URL, socials, booking mode, form recipient, SEO defaults, legal entity.
- [ ] [D+C] Navigation: header items, CTA, footer columns, action bar options.
- [ ] [C] Team (real photos, bios), services (categories first, e.g. Children → Adults), FAQ, gallery (consent flags!), testimonials (consent), 1–3 launch articles.
- [ ] [D] Pages: arrange sections per page (home: hero → tiles → team → process → FAQ → testimonials → blog teaser → contact/hours).
- [ ] [D] EN translations: "Translate → EN" per document, translate (Claude via Sanity MCP on the **development** dataset first, or directly on production drafts), **[C] reviews**, publish.
- [ ] [D] Legal pages: fill `[[placeholders]]`, then lawyer review **[C]**.
- [ ] [D] Image alt texts present in both locales (Studio validation + `pnpm content:check`).

## 7. Email deliverability
- [ ] [D] Resend domain `mail.<domain>`: add the SPF, DKIM and (return-path) records from Resend in Cloudflare DNS. Add DMARC at the root: `v=DMARC1; p=none; rua=mailto:<client>` (tighten to `quarantine` after 4 weeks of clean reports).
- [ ] [D] `CONTACT_FROM_EMAIL = "<Brand> <noreply@mail.<domain>>"`. Send test submissions in both locales and check spam placement (Gmail, Abv.bg, Outlook).

## 8. Domain and go-live
- [ ] [C/D] Move DNS to Cloudflare (change nameservers at the registrar), or add a CNAME setup if the registrar requires it.
- [ ] [D] Worker → Settings → Domains & Routes → add the custom domain (`<domain>` and `www.<domain>`). Redirect Rule: `www` → apex (or the reverse), 301.
- [ ] [D] ISR: enable `cachePurge` in `open-next.config.ts` + secrets `CACHE_PURGE_API_TOKEN`, `CACHE_PURGE_ZONE_ID` (only now that a zone exists).
- [ ] [D] Update `NEXT_PUBLIC_SITE_URL`, the Sanity webhook URL, CORS and the Presentation `previewUrl` to the real domain, then redeploy.
- [ ] [D] SSL mode Full (strict). "Always Use HTTPS" on. HSTS via our headers (no preload until stable).
- [ ] [D] Old site? Redirect map in `src/config/redirects.ts` (SEO.md §9).

## 9. Launch QA (run `pnpm launch-check --url https://<domain>` from T11.6, then the manual items below)
- [ ] `pnpm check`, `pnpm e2e`, Lighthouse CI budgets green on the production URL.
- [ ] Manual: iPhone Safari + Android Chrome (call, directions, menu, tiles, form, map, language switch), keyboard-only walkthrough, screen-reader spot check (VoiceOver/TalkBack) of the home + contact pages.
- [ ] SEO: view-source canonical/hreflang, Rich Results Test (home, article), sitemap reachable, robots correct, `llms.txt` content correct.
- [ ] Legal checklist (LEGAL-GDPR.md §10).
- [ ] Publish test: edit a text → live in < 60 s (ISR) / < 10 min (Static).
- [ ] Search Console: add the property, submit the sitemap. Bing Webmaster import. GBP website link with UTM.

## 10. Handover
- [ ] [D] 30-minute Studio training for the client (record it): editing texts, hours/special hours, adding an article, translating, gallery consent flags, Presentation preview, announcements.
- [ ] [D] Write a one-page "How to edit your site" in the client's language (BG) and add it as a Studio dashboard/help link (optional).
- [ ] [D] Confirm the weekly backup workflow ran. Do a test restore into `development` (`sanity dataset import`).
- [ ] [D] Calendar reminders: dependency updates monthly (Renovate PRs), DMARC tighten in 4 weeks, GSC check in 2 weeks.

## Restore runbook
1. Download the latest `backup.yml` artifact (`production-YYYY-MM-DD.tar.gz`).
2. `pnpm sanity dataset import production-YYYY-MM-DD.tar.gz development --replace` → verify in the Studio (switch dataset) → if OK, `… production --replace`.
3. Trigger a full revalidate: `curl -X POST <site>/api/revalidate` with a signed test payload for `_type: siteSettings` (tags `sanity`), or redeploy.

## Upstream changes (template ↔ client repos)
- The template repo is the source of truth for components and infra. Client repos add the template as a remote: `git remote add template git@github.com:<you>/site-starter.git`.
- Improve generic things in the template first (PR there), then `git fetch template && git merge template/main` (or cherry-pick) into client repos. Client-specific files (`src/config/*`, `tokens.css`, `fonts.ts`, `messages/*`, `public/brand/*`) are designed not to conflict.
- Keep `CHANGELOG.md` in the template (semver). Client repos note which template version they're on.
