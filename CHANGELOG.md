# Changelog

All notable changes to this template are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Next.js 16 scaffold with pinned toolchain, strict TypeScript, ESLint/Prettier and Vitest.
- OpenNext Cloudflare configuration, static only (ADR-012): static-assets cache, no R2/D1/Durable Objects, no payment card.
- CI (lint, typecheck, unit tests, build) and deploy workflows; Sanity publish triggers a rebuild via `repository_dispatch`.
- Typed, lazily validated environment variables.
- Agent skills for Cursor and Claude Code.
