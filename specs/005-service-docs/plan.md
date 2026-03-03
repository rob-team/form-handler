# Implementation Plan: Service Documentation Pages

**Branch**: `005-service-docs` | **Date**: 2026-03-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-service-docs/spec.md`

## Summary

Add bilingual documentation pages for both services (Form Endpoints and Inquiry Widget) with step-by-step quickstart guides, reference sections, copyable code examples, and dashboard screenshots. Integrate documentation links into the landing page via a header dropdown menu and "View Docs" links on service cards. All documentation is static frontend content — no backend changes required.

## Technical Context

**Language/Version**: TypeScript 5 (frontend)
**Primary Dependencies**: Next.js 16, React 19, shadcn/ui, Tailwind CSS 4
**Storage**: N/A (no backend changes — static content only)
**Testing**: E2E tests for P1 user stories (doc pages render, content present, navigation works)
**Target Platform**: Web (responsive: 320px–1920px)
**Project Type**: Web application (frontend only for this feature)
**Performance Goals**: Documentation pages load in under 3 seconds
**Constraints**: Bilingual (EN/ZH), no authentication required, SEO metadata required
**Scale/Scope**: 2 new documentation pages, ~8 modified files, ~6 new files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality | PASS | Standard frontend additions following existing patterns |
| II. API Testing | N/A | No new API endpoints — purely frontend feature |
| III. E2E Testing | PASS | E2E tests required for P1 stories (doc pages accessible, content rendered, links functional) |
| IV. UX Consistency | PASS | Reuses existing header/footer, design tokens from shared design system, terminology matches spec |
| V. Simplicity | PASS | Static content pages using existing dictionary pattern, no CMS or dynamic generation |

| Gate | Status |
|------|--------|
| Gate 1 — Lint & Static Analysis | Will verify during implementation |
| Gate 2 — API Contract Tests | N/A (no API changes) |
| Gate 3 — E2E Tests | Required: doc pages render, navigation links work, content sections present |
| Gate 4 — UX Review | Required: responsive layout, code block copy, screenshots display |
| Gate 5 — Code Review | Required |

## Project Structure

### Documentation (this feature)

```text
specs/005-service-docs/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
frontend/
├── middleware.ts                                    # MODIFY: extend matcher for locale doc routes
├── public/
│   └── docs/
│       └── screenshots/
│           ├── en/                                  # NEW: English dashboard screenshots
│           │   ├── create-form.png
│           │   ├── form-endpoint-url.png
│           │   ├── form-submissions.png
│           │   ├── telegram-setup.png
│           │   ├── create-widget.png
│           │   ├── widget-questions.png
│           │   ├── widget-embed-code.png
│           │   ├── widget-inquiries.png
│           │   └── visitor-analytics.png
│           └── zh/                                  # NEW: Chinese dashboard screenshots
│               └── (same files as en/)
├── src/
│   ├── app/[locale]/
│   │   ├── layout.tsx                               # MODIFY: remove auth redirect (move to page.tsx)
│   │   ├── page.tsx                                 # MODIFY: add docsHref/docsText to ServiceCards + receive auth redirect from layout
│   │   └── docs/
│   │       ├── layout.tsx                           # NEW: shared doc layout (header + footer)
│   │       ├── form-endpoints/
│   │       │   └── page.tsx                         # NEW: Form Endpoints doc page
│   │       └── inquiry-widget/
│   │           └── page.tsx                         # NEW: Inquiry Widget doc page
│   ├── components/
│   │   ├── landing/
│   │   │   ├── landing-header.tsx                   # MODIFY: add "Docs" dropdown, make nav links absolute
│   │   │   └── service-card.tsx                     # MODIFY: add optional docsHref/docsText props
│   │   └── docs/
│   │       └── code-block.tsx                       # NEW: copyable code block component
│   ├── dictionaries/
│   │   ├── en.json                                  # MODIFY: add header.docs, services.*.docsLabel
│   │   └── zh.json                                  # MODIFY: add header.docs, services.*.docsLabel
│   └── lib/
│       └── dictionaries.ts                          # MODIFY: extend Dictionary interface
```

**Structure Decision**: Frontend-only additions following the existing `[locale]` routing pattern. Documentation pages live under `[locale]/docs/` with a shared layout for header/footer. A dedicated `docs/layout.tsx` avoids modifying the existing `[locale]/layout.tsx`. The `landing-header.tsx` component is updated in-place to add the "Docs" dropdown, and anchor links are changed to absolute locale-prefixed URLs so they work from any page.

## Key Design Decisions

### 1. Documentation Content Storage

Documentation content is stored as structured JSX directly in the doc page components (`form-endpoints/page.tsx`, `inquiry-widget/page.tsx`). Short translatable strings (navigation labels, page titles, section headings) are added to the dictionary JSON files. Prose content and code examples are in the page TSX files using locale conditionals where needed.

**Rationale**: The documentation has substantial structured content (numbered steps, code blocks, screenshots) that doesn't map well to flat JSON. Page-level JSX gives full control over layout and keeps code examples as real strings (no JSON escaping). Dictionary files remain for navigation strings that appear in shared components (header, service cards).

### 2. Docs Layout vs. Duplicated Header/Footer

A shared `[locale]/docs/layout.tsx` renders the `LandingHeader` and `LandingFooter` for all doc pages, avoiding duplication across multiple doc page files.

**Rationale**: With 2 doc pages (and potentially more in the future), a shared layout is the right level of abstraction (serves 2 concrete use cases per Principle V).

### 3. Header Navigation Updates

The `LandingHeader` component is updated to:
- Add a "Docs" dropdown using the existing shadcn/ui `DropdownMenu` component (already available)
- Change anchor links (`#services`, `#contact`) to absolute locale-prefixed URLs (`/${locale}#services`) so they work from doc pages too

The header becomes a `"use client"` component since the `DropdownMenu` requires client-side interactivity.

### 4. Middleware Extension

The middleware matcher is extended from `["/", "/en", "/zh"]` to also match `/en/:path*` and `/zh/:path*` so that doc pages get the `x-locale` header set correctly for `<html lang>`.

### 5. Screenshot Management

Screenshots are static PNG files stored in `public/docs/screenshots/{locale}/`. Each screenshot captures a key dashboard screen. The doc pages reference them with standard `<Image>` (or `<img>`) tags. English and Chinese versions are separate files since the dashboard UI language differs.

## Complexity Tracking

> No constitution violations to justify.
