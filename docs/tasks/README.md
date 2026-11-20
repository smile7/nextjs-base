# Task files

One file per phase. Each task is sized for **one Cursor chat** (roughly 30–120 min of agent work) and ends with a commit.

Task format
- **Context:** why the task exists and the docs to read.
- **Steps:** the expected outline. The agent refines it into a concrete plan in Plan Mode.
- **Files:** created/modified (indicative).
- **Acceptance criteria (AC):** what must be true. Verify every AC before claiming done.
- **Done check:** commands/observations that prove it.

Phase order and gates

| Phase | File | Gate at the end |
| --- | --- | --- |
| 00 | `00-setup.md` | Spike results recorded. ADR-003/004/010 confirmed or amended |
| 01 | `01-design-foundation.md` | Styleguide screenshots reviewed by Silvena |
| 02 | `02-i18n-routing.md` | Both locales route correctly |
| 03 | `03-sanity-studio.md` | Studio usable with seed content |
| 04 | `04-content-layer.md` | Publish → page updates (ISR on preview deploy) |
| 05 | `05-layout-shell.md` | Header/menu/action bar pass the keyboard + screenshot review |
| 06 | `06-sections.md` | Every section in the styleguide + home renders the seed |
| 07 | `07-routes-pages.md` | All routes in both locales, smoke tests green |
| 08 | `08-contact-integrations.md` | Form sends real email from preview |
| 09 | `09-consent-analytics-legal.md` | Banner logic correct with GA4 on/off |
| 10 | `10-seo-performance.md` | Lighthouse budgets green on preview |
| 11 | `11-qa-launch.md` | Template v1.0.0 tagged |

Dependencies: phases run in order. Inside a phase, tasks run in numeric order unless marked "parallel-safe".
