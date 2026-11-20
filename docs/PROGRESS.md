# Progress

Tick tasks as they are completed (the agent updates this at the end of each task). Add notes, deviations and follow-ups.

Legend: [ ] todo · [~] in progress · [x] done · [!] blocked

## Phase 00 — Repo, toolchain, Cloudflare spike
- [x] T00.1 · [x] T00.2 · [~] T00.3 · [ ] T00.4 · [~] T00.5 · [x] T00.6 · [~] T00.7
## Phase 01 — Design tokens, primitives, styleguide
- [ ] T01.1 · [ ] T01.2 · [ ] T01.3 · [ ] T01.4 · [ ] T01.5 · [ ] T01.6 · [ ] T01.7
## Phase 02 — i18n and routing
- [ ] T02.1 · [ ] T02.2 · [ ] T02.3 · [ ] T02.4 · [ ] T02.5
## Phase 03 — Sanity Studio and schemas
- [ ] T03.1 · [ ] T03.2 · [ ] T03.3 · [ ] T03.4 · [ ] T03.5 · [ ] T03.6 · [ ] T03.7 · [ ] T03.8 · [ ] T03.9
## Phase 04 — Content layer, caching, preview
- [ ] T04.1 · [ ] T04.2 · [ ] T04.3 · [ ] T04.4 · [ ] T04.5 · [ ] T04.6 · [ ] T04.7
## Phase 05 — Layout shell
- [ ] T05.1 · [ ] T05.2 · [ ] T05.3 · [ ] T05.4 · [ ] T05.5 · [ ] T05.6
## Phase 06 — Sections
- [ ] T06.1 · [ ] T06.2 · [ ] T06.3 · [ ] T06.4 · [ ] T06.5 · [ ] T06.6 · [ ] T06.7
## Phase 07 — Routes and pages
- [ ] T07.1 · [ ] T07.2 · [ ] T07.3 · [ ] T07.4 · [ ] T07.5 · [ ] T07.6
## Phase 08 — Contact form and integrations
- [ ] T08.1 · [ ] T08.2 · [ ] T08.3 · [ ] T08.4 · [ ] T08.5
## Phase 09 — Consent, analytics, legal
- [ ] T09.1 · [ ] T09.2 · [ ] T09.3 · [ ] T09.4
## Phase 10 — SEO/AEO and performance
- [ ] T10.1 · [ ] T10.2 · [ ] T10.3 · [ ] T10.4 · [ ] T10.5
## Phase 11 — QA, launch, template packaging
- [ ] T11.1 · [ ] T11.2 · [ ] T11.3 · [ ] T11.4 · [ ] T11.5 · [ ] T11.6 · [ ] T11.7

## Task notes

Phases 00–01 were run in one batch chat at the owner's request (no per-task Plan Mode, the agent commits). Tasks needing Sanity, Cloudflare or Resend accounts were skipped.

- **T00.1:** Scaffolded with `create-next-app@16.4.6` in a temp dir (`--turbopack` no longer exists, Turbopack is the default; the scaffold refuses names starting with `_`). The scaffold now wires Tailwind via the `@tailwindcss/turbopack` loader in `next.config.ts`; we use `@tailwindcss/postcss` + `postcss.config.mjs` instead, as ARCHITECTURE §1 and the Next 16 CSS guide specify. Pinned `@types/node@24.19.2`, `@types/react(-dom)@19.3.0`. Demo SVGs dropped.
- **T00.2:** ESLint flat config (next core-web-vitals + typescript, jsx-a11y strict rules, `react/jsx-no-literals` warn in `src/components/**`, prettier last); `pnpm lint` runs with `--max-warnings 0`, so literal-string warnings fail `pnpm check`. Vitest 5 uses two inline projects (`node` for `*.test.ts`, `dom`/jsdom for `*.test.tsx`) and Vite's `resolve.tsconfigPaths`. `globals.css` moved to `src/styles/` now because Prettier's `tailwindStylesheet` points there. `package.json` is `"type": "module"`. pnpm 12 blocks build scripts: `esbuild` allowed in `pnpm-workspace.yaml`. Playwright needs `chromium` + `webkit` (iPad Mini is WebKit). Optional pre-commit hooks skipped. `preview`/`deploy`/`upload`/`cf-typegen` scripts work from T00.3.
- **T00.3 (partial):** ISR config (`wrangler.jsonc`, `open-next.config.ts`) and Static variants (`infra/static/`) match the OpenNext caching guide. `pnpm preview` serves 200 in workerd with all bindings simulated locally; `pnpm cf-typegen` writes `cloudflare-env.d.ts` (committed, regenerate after binding changes). `compatibility_date` is `2026-11-18` (the pinned workerd build date) rather than "today", because a later date fails locally. **Open (needs Cloudflare account):** step 6, create the R2 bucket (EU) and D1 database on the sandbox account and replace the placeholder `database_id` (commands are in `wrangler.jsonc` comments). pnpm `allowBuilds` now also allows `workerd`.
- **T00.4:** skipped in the batch run (needs the Cloudflare sandbox account). ADR-003/004/010 stay pending.
- **T00.5 (partial):** `ci.yml`, `deploy.yml` and `renovate.json` are written and pass `@action-validator/cli` schema validation. Actions pinned to current majors (checkout v7, setup-node v7, pnpm/action-setup v6, upload-artifact v7, github-script v9). CI runs e2e against workerd with Turnstile test keys. The preview job greps the `*.workers.dev` URL from the `opennextjs-cloudflare upload` output and upserts one PR comment. Renovate enforces the ADR-009 caps and requires dashboard approval for platform majors. The `pnpm typegen` + `git diff` CI step is added in T03.1. **Open (needs GitHub repo + Cloudflare secrets):** the Done check (test PR with green CI and a preview URL comment).
- **T00.6:** `readPublicEnv(...keys)` (`src/env.ts`) and `readServerEnv(...keys)` (`src/env.server.ts`, `server-only`) validate **only the requested keys** with Zod (`src/lib/env/reader.ts`), so missing Sanity/Resend config doesn't break pages that don't use it yet. Errors list every missing/invalid key. `next.config.ts` validates `BUILD_REQUIRED_PUBLIC_ENV` (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ENV`): `NEXT_PUBLIC_SITE_URL= pnpm build` fails with "NEXT_PUBLIC_SITE_URL: missing". In `next dev` only, `SITE_URL` defaults to `http://localhost:3000` and Turnstile falls back to the test keys. Verified a client component importing `env.server` fails the build. Deviation: the task's single `serverEnv`/`clientEnv` objects became per-key reader functions (same intent, lazy by design).
- **T00.7 (partial):** Skills installed with the README §3 commands and committed (`.agents/skills/`, `.claude/skills/` symlinks, `skills-lock.json`): frontend-design, web-design-guidelines, vercel-react-best-practices, next-dev-loop, next-bundle-optimizer, 5 Sanity skills, 4 Cloudflare skills (`npx skills ls` shows all 15). `CHANGELOG.md`, `LICENSE` (proprietary, holder name left generic) and `.editorconfig` added. **Blocked:** `.cursor/mcp.json`, `.mcp.json` and `.cursor/rules/*.mdc` from the planning pack are **missing from the repo**, so the MCP server status can't be confirmed and the scoped rules don't exist. Copy them from the original pack (not recreated, to avoid inventing their content). OAuth needed later: `sanity`, `cloudflare-bindings`, `cloudflare-observability`.

### MCP / skills status
| Item | Status |
| --- | --- |
| Skills (15, project-level) | Installed |
| `.cursor/mcp.json` / `.mcp.json` | Missing from repo |
| `.cursor/rules/*.mdc` | Missing from repo |

## Spike results (T00.4)
_To be filled: proxy.ts OK?, worker size, cold start, CPU ms for static hit / ISR miss / server action / draft mode._

## Follow-ups
-
