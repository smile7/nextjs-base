# New Client Checklist

Spin up a new client site from the template. Target: **≤ 2 developer days to "content-ready"**. Work top to bottom. Each step says who does it: **[D]** developer, **[C]** client, **[D+C]** together.

## 0. Before you start (sales/contract)
- [ ] [D] The contract clause says: "Third-party service fees (hosting, CMS, email, domain) are borne by the client. Expected $0–10/month."
- [ ] [D] Tell the client how publishing works (ADR-012): the site is static, a publish goes live in about 3–5 minutes, and Cloudflare runs on the Free plan with **no payment card**.
- [ ] [D] Gather: legal entity data (name, ЕИК, address, registrations), domain registrar access, logo/wordmark wishes, brand colors (if any), photos, team bios, services list, hours, phones, socials, booking method.

## 1. Accounts (client-owned, developer invited)
- [ ] [C] **Cloudflare** account with the client's email. Invite [D] as Administrator (or a custom role: Workers Admin, DNS, Turnstile, Analytics). **Never add a payment method** (ADR-012).
- [ ] [C] **Sanity** account/organization → [D] creates the project inside the client's org (or transfers it later). Invite [D] as Administrator. Client editors are invited as Administrator too (Free plan roles: Administrator/Viewer only).
- [ ] [C] **Resend** account (or [D]'s account if agreed; Free allows 3 domains). Add the sending domain `mail.<domain>`.
- [ ] [C] **Google**: Business Profile (owner = client), Search Console (client owner, [D] full user). GA4 only if requested.
- [ ] [C] Optional: Umami Cloud Hobby (1 site free).
- [ ] [D] Store all credentials in a shared password manager vault for the client.

## 2. Repository
- [ ] [D] GitHub: "Use this template" → `client-<slug>-site` (private).
- [ ] [D] `pnpm install`, then `pnpm new-client` (interactive). It asks for: client slug, brand names per locale, production domain, Sanity project ID, datasets, locales (default `bg`, `en`) and analytics provider. It writes `src/config/site.ts`, `.env.local`, `.dev.vars` and the worker name in `wrangler.jsonc`, and resets `docs/PROGRESS.md` for the client.
- [ ] [D] Update the `README.md` header (client name, URLs, who to contact).

## 3. Sanity
- [ ] [D] `pnpm sanity login`, then confirm `sanity.cli.ts` has the project ID and dataset.
- [ ] [D] Create datasets: `production`, `development` (both public on Free).
- [ ] [D] API → Tokens: `SANITY_API_READ_TOKEN` (Viewer) for the site, `SANITY_WRITE_TOKEN` (Editor) for seeding, kept in `.env.local` only.
- [ ] [D] API → CORS origins (with credentials): `http://localhost:3000`, `http://localhost:8787` (`pnpm preview`), the preview URL pattern (`https://*.<account>.workers.dev`), `https://<domain>`, `https://www.<domain>`.
- [ ] [D] `pnpm seed --client --dataset production` → structure: system pages (home/services/about/gallery/blog/contact) with default sections, empty settings, legal templates.
- [ ] [D] Optional: `pnpm sanity deploy` → `<slug>.sanity.studio` (hosted Studio as a backup entry point).
- [ ] [D] Publish webhook (Manage → API → Webhooks), **1 of the 2 allowed on Free** (ARCHITECTURE §6.2): URL `https://api.github.com/repos/<owner>/<repo>/dispatches`, dataset `production`, triggers create/update/delete, filter `!(_type match "sanity.*")`, **"Trigger webhook when drafts are modified" off**, POST, headers `Authorization: Bearer <fine-grained PAT with contents:write on this repo only>` and `Accept: application/vnd.github+json`, projection `{"event_type": "sanity-publish"}`. Add a calendar reminder to rotate the PAT before it expires.

## 4. Cloudflare
- [ ] [D] `wrangler login` (or an API token scoped to the client account), then check `account_id`.
- [ ] [D] Turnstile: add a widget (managed mode) for `<domain>` + `localhost`, giving the site key + secret.
- [ ] [D] Secrets: `wrangler secret put SANITY_API_READ_TOKEN`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`. Vars in `wrangler.jsonc`: `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`.
- [ ] [D] GitHub repo secrets: `CLOUDFLARE_API_TOKEN` (Workers Scripts:Edit, Account Settings:Read, Workers Routes, Zone DNS), `CLOUDFLARE_ACCOUNT_ID`, plus build vars (`NEXT_PUBLIC_*`) as repository **variables**.
- [ ] [D] First deploy: push to `main` → check the workers.dev URL works.
- [ ] [D] Observability: `"observability": { "enabled": true }` in wrangler. Check the logs appear.

## 5. Theme and brand (Phase "client design", 0.5–1 day)
- [ ] [D] Collect references + real photos → put photos in `seed/client-images/` (not `public/`, since content photos belong in Sanity).
- [ ] [D] In Cursor with the `frontend-design` skill: "Propose 2 theme directions for <client> based on @docs/DESIGN-SYSTEM.md §13-style analysis and these photos @seed/client-images/…". Pick one.
- [ ] [D] Edit `src/styles/tokens.css` (palette, tones, radius family, shadows), `src/config/fonts.ts` (Cyrillic check), and the `Wordmark` styling. Logo SVG → `public/brand/`.
- [ ] [D] Favicons/app icons from the logo/wordmark (`app/[locale]/icon.png`, `apple-icon.png`). OG fallback image.
- [ ] [D] Take `/styleguide` screenshots at 360/768/1280 by hand → send them + preview URL to the client → **[C] sign-off** (written, by email). Then set `NEXT_PUBLIC_ENABLE_STYLEGUIDE=false` for production.

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
- [ ] [D] Update `NEXT_PUBLIC_SITE_URL`, CORS and the Presentation `previewUrl` to the real domain, then redeploy. (The publish webhook points at GitHub, so it doesn't change.)
- [ ] [D] SSL mode Full (strict). "Always Use HTTPS" on. HSTS via our headers (no preload until stable).
- [ ] [D] Contact form rate limit (client-owned zone, Free includes one rate-limiting rule): Security → WAF → Rate limiting rules → "Contact form POST": `http.request.method eq "POST" and http.request.uri.path in {"/bg/kontakti" "/en/contact"}` (the localized contact paths), counting by IP, 5 requests per 10 seconds, action Block for 10 seconds. Works only on the custom domain (not `workers.dev`).
- [ ] [D] Old site? Redirect map in `src/config/redirects.ts` (SEO.md §9): one `{ source, destination }` per old URL, served as 308. `www` ↔ apex is the Cloudflare Redirect Rule above, not a list entry.

## 9. Launch QA (run `pnpm launch-check --url https://<domain>` from T11.6, then the manual items below)
- [ ] `pnpm check`, manual Lighthouse run (mobile) within the SEO.md §8 budgets on the production URL.
- [ ] Manual: iPhone Safari + Android Chrome (call, directions, menu, tiles, form, map, language switch), keyboard-only walkthrough, screen-reader spot check (VoiceOver/TalkBack) of the home + contact pages.
- [ ] SEO: view-source canonical/hreflang, Rich Results Test (home, article), sitemap reachable, robots correct, `llms.txt` content correct.
- [ ] Legal checklist (LEGAL-GDPR.md §10).
- [ ] Publish test: edit a text → the GitHub deploy run starts → live in < 10 min.
- [ ] Search Console: add the property, submit the sitemap. Bing Webmaster import. GBP website link with UTM.
- [ ] CSP (`src/config/csp.ts`, T11.3) ships as `Content-Security-Policy-Report-Only`. After about a week live with no violations in the browser console (walk every page journey: home, services, a service, about, gallery, blog, an article, contact with the form and the map loaded, a legal page, the cookie dialog, `/admin` + Presentation), set `CSP_HEADER = 'Content-Security-Policy'`, deploy, and walk the same journeys again. If something breaks, revert that one line. A new analytics provider or embed means a new host in `csp.ts` first.

## 10. Handover
- [ ] [D] 30-minute Studio training for the client (record it): editing texts, hours/special hours, adding an article, translating, gallery consent flags, Presentation preview, announcements.
- [ ] [D] Write a one-page "How to edit your site" in the client's language (BG) and add it as a Studio dashboard/help link (optional).
- [ ] [D] Export the content once at handover (no automated backups, ADR-012): `pnpm sanity dataset export production production-YYYY-MM-DD.tar.gz`, stored in the client's vault.
- [ ] [D] Calendar reminders: dependency review monthly (`pnpm outdated`, merge template upgrades), publish-webhook PAT rotation, DMARC tighten in 4 weeks, GSC check in 2 weeks.
- [ ] [D] Fill Site settings → Legal → "Privacy contact email" (footer `mailto:`), and hand the clinic the page below (print it or add it to the "How to edit your site" document).

### Handover sheet: искания по GDPR (BG, one page for the clinic)
**Процедура при искане от лице относно личните му данни** (достъп, изтриване, коригиране, възражение)

1. **Приемане.** Искането може да дойде по имейл (адресът за защита на данните в долната част на сайта), по пощата или лично. Запишете датата: отговаряте до **1 месец**. При сложно искане срокът може да се удължи с още 2 месеца, но трябва да уведомите лицето в първия месец.
2. **Самоличност.** Проверете, че искането е от самото лице (или от родителя/настойника на дете), само доколкото е нужно: например отговор от същия имейл или телефон, или документ при лично посещение. Не искайте копие от лична карта по имейл.
3. **Къде да търсите:**
   - **Пощата на клиниката:** запитванията от формата за контакт идват само тук. Сайтът не ги пази. Потърсете по име, имейл и телефон, после изпратете копие или ги изтрийте.
   - **Съдържанието на сайта (Sanity Studio):** отзиви с име, снимки в галерията, профили в екипа. Вижте „Премахване на човек“ по-долу.
   - **Статистика:** ако сайтът е със статистика без бисквитки (по подразбиране), там няма лични данни. Ако е включен Google Analytics, помолете разработчика да подаде искане за изтриване в Google Analytics.
   - **Медицински картони:** те не са част от сайта и се пазят по здравното законодателство.
4. **Отговор.** Пишете ясно и безплатно, в срока. Ако откажете (например ако законът изисква да пазите данните), посочете причината и правото на жалба до КЗЛД (www.cpdp.bg).
5. **Запис.** Водете кратък дневник: дата на искането, вид, какво направихте, дата на отговора. Без излишни лични данни.

**Премахване на човек от сайта (Studio)**
- [ ] **Отзиви:** Testimonials → намерете отзива → Unpublish → Delete.
- [ ] **Галерия:** Gallery → всяка снимка с този човек → Delete. Кажете на разработчика да изтрие и самия файл на снимката (иначе адресът ѝ продължава да работи) до 7 дни.
- [ ] **Екип:** Team → профилът → Delete (снимката също се изтрива от разработчика). Сменете автора на статиите му.
- [ ] **И двата езика:** проверете и английската версия на страниците, където е споменат.
- [ ] **Проверка:** след няколко минути сайтът се обновява сам. Отворете страниците и се уверете, че човекът вече не се показва.

## Upstream changes (template ↔ client repos)
- The template repo is the source of truth for components and infra. Client repos add the template as a remote: `git remote add template git@github.com:<you>/site-starter.git`.
- Improve generic things in the template first (PR there), then `git fetch template && git merge template/main` (or cherry-pick) into client repos. Client-specific files (`src/config/*`, `tokens.css`, `fonts.ts`, `messages/*`, `public/brand/*`) are designed not to conflict.
- Keep `CHANGELOG.md` in the template (semver). Client repos note which template version they're on.
