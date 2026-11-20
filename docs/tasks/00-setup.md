# Phase 00 — Repo, toolchain, Cloudflare spike

**Goal:** a clean, strict Next.js 16 project that builds, tests and deploys to Cloudflare Workers via OpenNext, and **proves the risky parts early** (proxy.ts on Workers, CPU time, Studio size).
**Read first:** `AGENTS.md`, `docs/ARCHITECTURE.md` §1, §6, §9, §11, `docs/DECISIONS.md` ADR-003/004/009/010.

---

### T00.1 — Scaffold the Next.js app
**Context:** The repo already contains `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/` and `.cursor/`. `create-next-app` now also generates `AGENTS.md`/`CLAUDE.md` and may refuse a non-empty folder, so scaffold in a temp dir and merge.
**Steps**
1. `pnpm create next-app@latest ../_scaffold --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --use-pnpm` (check `--help` first, because flags change between releases; React Compiler: **No** for v1; if it asks about AGENTS.md, say yes, since we merge it next).
2. Move everything except `AGENTS.md`, `CLAUDE.md` and `README.md` into the repo root. Append only the Next.js managed block (`<!-- BEGIN:nextjs-agent-rules -->…<!-- END… -->`) from the scaffold's AGENTS.md to the end of our `AGENTS.md`.
3. Pin exact versions from ARCHITECTURE §1 (`next`, `react`, `react-dom`, `typescript@6.0.3`, `eslint@9.39.x`, `eslint-config-next@16.4.6`, Tailwind 4.3.5). Add `"packageManager": "pnpm@12.21.0"`, `"engines": { "node": ">=24 <25" }` and `.nvmrc` (`24`).
4. `tsconfig.json`: `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`, `verbatimModuleSyntax: true`, `paths: { "@/*": ["./src/*"] }`.
5. Delete the demo page content. Leave a minimal `src/app/page.tsx` placeholder (it will be replaced by `[locale]` in Phase 02).
6. `.gitignore`: add `.open-next`, `.wrangler`, `.dev.vars`, `.env*.local`, `.screenshots`, `test-results`, `playwright-report`.
**Files:** `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `src/app/*`, `.nvmrc`, `.gitignore`, `AGENTS.md` (append only).
**AC:** `pnpm dev` serves the placeholder; `pnpm build` succeeds; versions match the table exactly; our AGENTS.md content is preserved.
**Done check:** `pnpm build && node -e "const p=require('./package.json');console.log(p.dependencies.next,p.devDependencies.typescript)"` prints `16.4.6 6.0.3`.

### T00.2 — Lint, format, test tooling and scripts
**Context:** `next lint` no longer exists in Next 16. Use the ESLint CLI with flat config.
**Steps**
1. `eslint.config.mjs`: `eslint-config-next` (core-web-vitals + typescript), `eslint-plugin-jsx-a11y` strict rules, `eslint-config-prettier` last. Rules: `no-restricted-imports` placeholder for the content boundary (filled in T04.6), `react/jsx-no-literals` **warn** in `src/components/**` (allow `aria-hidden` symbols, punctuation), `@typescript-eslint/no-explicit-any: error`.
2. Prettier 3.10 + `prettier-plugin-tailwindcss` (`tailwindStylesheet: ./src/styles/globals.css`), `.prettierrc`, `.prettierignore` (generated files).
3. Vitest 5: `vitest.config.ts` (jsdom for `*.test.tsx`, node for `*.test.ts`), `@vitejs/plugin-react`, path alias, `src/test/setup.ts`. One sample test.
4. Playwright 1.65: `playwright.config.ts` with projects `mobile` (Pixel 7), `tablet` (iPad Mini), `desktop` (1280×800). `webServer` runs `pnpm preview` in CI and `pnpm dev` locally (env `E2E_TARGET`). `@axe-core/playwright` helper `expectNoA11yViolations(page)`.
5. Scripts (note: call `pnpm run deploy`, since `pnpm deploy` is a pnpm built-in): `dev`, `build`, `start`, `lint`, `lint:fix`, `format`, `typecheck` (`tsc --noEmit`), `test`, `test:watch`, `e2e`, `check` (= lint + typecheck + test), `shots` (placeholder until T01.7), `preview`, `deploy`, `upload`, `cf-typegen`, `typegen` (placeholder until T03.1).
6. Optional pre-commit: `simple-git-hooks` + `lint-staged` (prettier + eslint on staged files).
**Files:** `eslint.config.mjs`, `.prettierrc`, `.prettierignore`, `vitest.config.ts`, `playwright.config.ts`, `e2e/helpers/a11y.ts`, `e2e/smoke.spec.ts`, `src/test/setup.ts`, `package.json`.
**AC:** `pnpm check` passes; `pnpm e2e` runs 1 smoke test on 3 projects; formatting sorts Tailwind classes.
**Done check:** `pnpm check && pnpm e2e`.

### T00.3 — Cloudflare / OpenNext configuration
**Context:** ARCHITECTURE §6. Start with the **ISR profile** files, and also commit the Static-profile variants in `infra/`.
**Steps**
1. `pnpm add -E @opennextjs/cloudflare@1.20.17` and `pnpm add -DE wrangler@4.165.0`. (You may run `npx @opennextjs/cloudflare migrate` and then review and trim its output to match the docs.)
2. `wrangler.jsonc`: `$schema`, `main: .open-next/worker.js`, `name: site-starter-demo`, `compatibility_date` = today, `compatibility_flags: ["nodejs_compat", "global_fetch_strictly_public"]`, `assets { directory: .open-next/assets, binding: ASSETS }`, `services` self-reference, `images { binding: IMAGES }`, `observability { enabled: true }`, plus ISR bindings (R2 `NEXT_INC_CACHE_R2_BUCKET`, D1 `NEXT_TAG_CACHE_D1`, DO `NEXT_CACHE_DO_QUEUE` with a `migrations` `new_sqlite_classes: ["DOQueueHandler"]`).
3. `open-next.config.ts` (ISR: r2IncrementalCache + doQueue + d1NextTagCache). `infra/static/open-next.config.ts` + `infra/static/wrangler.jsonc` (no R2/D1/DO).
4. `next.config.ts`: `initOpenNextCloudflareForDev()` call, `images.remotePatterns` for `cdn.sanity.io`, `images.qualities: [60, 75, 85]`, `poweredByHeader: false`, `trailingSlash: false`, `logging.fetches.fullUrl` in dev.
5. `public/_headers` (immutable `/_next/static/*`). `.dev.vars.example` with `NEXTJS_ENV=development`. `cf-typegen` → `cloudflare-env.d.ts`.
6. Create the R2 bucket (EU jurisdiction) + D1 database on the **developer sandbox account** and record the IDs in `wrangler.jsonc`.
**Files:** `wrangler.jsonc`, `open-next.config.ts`, `infra/static/*`, `next.config.ts`, `public/_headers`, `.dev.vars.example`, `cloudflare-env.d.ts`, `package.json`.
**AC:** `pnpm preview` serves the app in workerd locally; `pnpm cf-typegen` generates types; config matches the OpenNext docs for the installed version.
**Done check:** `pnpm preview` → `curl -I http://localhost:8787` gives 200.

### T00.4 — Deployment spike and measurements (GATE)
**Context:** Validate ADR-003, ADR-004 and ADR-010 before building on them. Temporary spike code lives under `src/app/(spike)/`. Remove it at the end, but keep the results.
**Steps**
1. Add a minimal `src/proxy.ts` (`next-intl` `createMiddleware` with a 2-locale routing stub) and a `[locale]/spike` page that is (a) static, (b) ISR with a tag, (c) has a Server Action form that does a `fetch` to `https://httpbin.org/post`. Also add a route handler calling `revalidateTag('spike', { expire: 0 })`.
2. Temporarily add the embedded Sanity Studio route (`next-sanity/studio` with an empty schema) to measure its impact on worker size and startup.
3. `pnpm run deploy` to the sandbox account (workers.dev).
4. Measure and record in `docs/PROGRESS.md` → "Spike results": Wrangler "Total Upload" size with/without the Studio, startup time (Wrangler output), CPU time per request type (static hit, ISR miss after revalidate, server action, `/admin` load) using `wrangler tail --format pretty` / dashboard Observability (CPU time field). Check whether `proxy.ts` works (redirect `/` → `/bg`, rewrite of a localized path).
5. Decide: proxy.ts OK, or fall back to `middleware.ts` (edge). Studio embedded or hosted. Free plan viable for ISR regeneration, or recommend Paid/Static. Write ADR updates in `docs/DECISIONS.md`.
6. Remove the spike code (keep the proxy file if it stays).
**AC:** All measurements recorded with numbers. ADR statuses updated. The spike code is removed.
**Done check:** the "Spike results" section is complete; `git grep -n "(spike)"` returns nothing.

### T00.5 — CI/CD workflows
**Context:** ARCHITECTURE §11, ADR-008.
**Steps**
1. `.github/workflows/ci.yml`: on PR + push to main. Steps: checkout, pnpm/action-setup, setup-node (from `.nvmrc`, pnpm cache), `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, Playwright install (chromium + webkit) + `pnpm e2e` with `E2E_TARGET=preview` (workerd). Upload the Playwright report on failure.
2. `.github/workflows/deploy.yml`: on push to main → `pnpm run deploy` (env: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, all `NEXT_PUBLIC_*` from repo variables). On PR (same repo only) → `pnpm upload` + comment the preview URL. Add `repository_dispatch: types: [sanity-publish]` → deploy (Static profile).
3. Concurrency groups (cancel in-progress on the same ref).
4. `renovate.json` (or Dependabot): weekly, group minor/patch, no automerge for next/opennext/wrangler/sanity majors.
**Files:** `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `renovate.json`.
**AC:** A PR shows green CI and a preview URL comment. Main deploys to production (sandbox).
**Done check:** open a test PR and verify both workflows (screenshot or link in PROGRESS).

### T00.6 — Typed environment variables
**Context:** ARCHITECTURE §9.
**Steps**
1. `src/env.ts`: Zod schemas `serverEnv` (secrets/vars; with `import 'server-only'` in `src/env.server.ts`) and `clientEnv` (`NEXT_PUBLIC_*`, explicitly referenced so Next inlines them). Parse lazily with clear error messages listing the missing keys. Allow test keys in development.
2. `.env.example` documenting every variable (grouped, with comments), `.dev.vars.example` for workerd.
3. Unit test: missing required var → helpful error.
**Files:** `src/env.ts`, `src/env.server.ts`, `.env.example`, `.dev.vars.example`, `src/env.test.ts`.
**AC:** The build fails fast with a readable message when a required public var is missing; no secret is importable from a client component (the `server-only` import errors).
**Done check:** `pnpm test src/env.test.ts`, and `NEXT_PUBLIC_SITE_URL= pnpm build` fails with a clear message.

### T00.7 — AI tooling wiring and repo docs
**Context:** README §2 (skills/MCP). Verify that everything the agent relies on is present and documented.
**Steps**
1. Confirm `.cursor/mcp.json` servers start (shadcn, next-devtools, Sanity, Cloudflare docs/bindings/observability). List any server needing OAuth in PROGRESS.
2. Confirm the skills are installed: `npx skills ls -a cursor -a claude-code` shows `frontend-design`, `web-design-guidelines`, `vercel-react-best-practices`, `next-dev-loop`, the Sanity skills and the Cloudflare skills (if chosen).
3. Add a `CHANGELOG.md` (Keep a Changelog), `LICENSE` (private/proprietary note) and `.editorconfig`.
**AC:** `docs/PROGRESS.md` lists the MCP/skills status. Repo hygiene files exist.
**Done check:** manual review.
