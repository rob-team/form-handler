# form Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-01

## Active Technologies
- TypeScript 5 (frontend + widget), JavaScript ES5+ES6 (PocketBase JSVM hooks) + Next.js 16, React 19, shadcn/ui, Tailwind CSS 4, Preact 10 (widget), esbuild (widget build) (002-inquiry-widget)
- PocketBase v0.36.x (SQLite-backed, existing instance from 001) (002-inquiry-widget)
- TypeScript 5 (frontend), JavaScript ES5+ES6 (PocketBase JSVM hooks — no new hooks needed for this feature) + Next.js 16, React 19, shadcn/ui, Tailwind CSS 4, PocketBase JS SDK (`pocketbase` v0.26.x) (003-oauth-login)
- PocketBase v0.36.x (SQLite-backed, existing instance from 001/002) — `_externalAuths` system collection for OAuth identities (003-oauth-login)
- TypeScript 5 (frontend) + Next.js 16, React 19, shadcn/ui, Tailwind CSS 4 (no new dependencies added) (004-landing-page)
- PocketBase v0.36.x (SQLite) — existing collections only, no backend changes (004-landing-page)
- N/A (no backend changes — static content only) (005-service-docs)

- JavaScript (PocketBase JSVM, goja ES5+ES6, synchronous only); + PocketBase v0.23+ (v0.36.x), Next.js 15, shadcn/ui, (001-form-saas)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

JavaScript (PocketBase JSVM, goja ES5+ES6, synchronous only);: Follow standard conventions

## Recent Changes
- 005-service-docs: Added TypeScript 5 (frontend) + Next.js 16, React 19, shadcn/ui, Tailwind CSS 4
- 004-landing-page: Added TypeScript 5 (frontend) + Next.js 16, React 19, shadcn/ui, Tailwind CSS 4 (no new dependencies, no backend changes)
- 003-oauth-login: Added TypeScript 5 (frontend), JavaScript ES5+ES6 (PocketBase JSVM hooks — no new hooks needed for this feature) + Next.js 16, React 19, shadcn/ui, Tailwind CSS 4, PocketBase JS SDK (`pocketbase` v0.26.x)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
