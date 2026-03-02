# Implementation Plan: B2B Inquiry Widget

**Branch**: `002-inquiry-widget` | **Date**: 2026-03-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-inquiry-widget/spec.md`

## Summary

Build an embeddable conversational inquiry widget for B2B trade websites. The widget is a Preact-based chat-like floating button (rendered in Shadow DOM for CSS isolation) that guides visitors through configurable questions step-by-step, saves inquiries to PocketBase, and sends Telegram notifications. The dashboard (Next.js + shadcn/ui) lets users configure widgets, manage questions, view inquiries, and track visitor activity. Reuses the existing auth system and shared Telegram bot from 001-form-saas.

## Technical Context

**Language/Version**: TypeScript 5 (frontend + widget), JavaScript ES5+ES6 (PocketBase JSVM hooks)
**Primary Dependencies**: Next.js 16, React 19, shadcn/ui, Tailwind CSS 4, Preact 10 (widget), esbuild (widget build)
**Storage**: PocketBase v0.36.x (SQLite-backed, existing instance from 001)
**Testing**: Playwright (contract tests + E2E), following existing 001 patterns
**Target Platform**: Web — dashboard runs on modern browsers; widget targets Chrome 63+, Firefox 63+, Safari 11.1+, Edge 79+ (desktop + mobile)
**Project Type**: Web application (backend + frontend + embeddable widget)
**Performance Goals**: Widget loads in <2s, inquiry submission completes in <1s, Telegram notification within 30s
**Constraints**: PocketBase JSVM is synchronous-only (no async/await); widget must not interfere with host site styles; widget bundle <30KB gzipped
**Scale/Scope**: Single-tenant widgets (1 per user), moderate traffic (suitable for SMB B2B sites)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality | ✅ Pass | Linting via existing ESLint config; widget has its own build with strict TypeScript |
| II. API Testing (NON-NEGOTIABLE) | ✅ Pass | Contract tests planned for all 3 public widget endpoints + dashboard CRUD |
| III. E2E Testing (NON-NEGOTIABLE) | ✅ Pass | E2E tests planned for P1 user story (widget embed + conversational form) |
| IV. UX Consistency | ✅ Pass | Dashboard uses existing shadcn/ui design tokens; widget uses its own contained styles matching the chat widget pattern |
| V. Simplicity | ✅ Pass | Questions stored as JSON in widget record (not separate collection); Preact chosen over React for minimal bundle; Shadow DOM for isolation (no iframe complexity) |

**Post-Phase 1 re-check**: All gates still pass. Data model uses JSON fields for questions and responses (simplicity). Contracts define 3 public endpoints (minimal surface). No unnecessary abstractions introduced.

## Project Structure

### Documentation (this feature)

```text
specs/002-inquiry-widget/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── widget-api.md    # Public widget endpoints (GET config, POST submit, POST visit)
│   ├── dashboard-api.md # Dashboard CRUD (PocketBase standard API)
│   └── telegram-notification.md  # Telegram message format
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── pb_hooks/
│   └── main.pb.js              # Extended: widget submit/visit/stats endpoints + Telegram hook
└── pb_migrations/
    ├── 1_create_forms.js        # Existing (unchanged)
    ├── 2_create_submissions.js  # Existing (unchanged)
    ├── 3_create_widgets.js      # NEW: widgets collection schema
    ├── 4_create_inquiries.js    # NEW: inquiries collection schema
    └── 5_create_visitor_records.js  # NEW: visitor_records collection schema

frontend/
├── src/
│   ├── app/
│   │   └── (dashboard)/
│   │       ├── dashboard/
│   │       │   └── page.tsx         # Extended: show widgets section
│   │       └── widgets/             # NEW: widget management
│   │           └── [widgetId]/
│   │               ├── page.tsx     # Inquiries list + detail
│   │               ├── loading.tsx  # Loading skeleton
│   │               └── settings/
│   │                   └── page.tsx # Widget config: questions editor, embed code, Telegram
│   ├── components/
│   │   ├── widget-card.tsx              # NEW: widget card for dashboard
│   │   ├── question-editor.tsx          # NEW: drag-to-reorder question list editor
│   │   ├── inquiry-item.tsx             # NEW: inquiry detail display
│   │   ├── embed-code-snippet.tsx       # NEW: copyable embed code block
│   │   └── visitor-activity.tsx         # NEW: visitor log + summary stats
│   └── lib/
│       └── (reuses existing pocketbase-browser.ts, pocketbase-server.ts, utils.ts)
└── tests/
    ├── contract/
    │   ├── widget-api.spec.ts           # NEW: widget public endpoint tests
    │   └── widget-crud.spec.ts          # NEW: dashboard CRUD tests
    └── e2e/
        ├── widget-setup.spec.ts         # NEW: create widget + configure questions
        └── widget-embed.spec.ts         # NEW: embed code + conversational form flow

widget/                          # NEW: standalone embeddable widget
├── src/
│   ├── index.ts                 # Entry: Shadow DOM creation + Preact mount
│   ├── App.tsx                  # Root component: manages open/close state
│   ├── components/
│   │   ├── ChatBubble.tsx       # Floating circular button
│   │   ├── ChatWindow.tsx       # Conversation container with header + messages
│   │   ├── QuestionStep.tsx     # Renders one question (text input / email / select)
│   │   └── SelectOptions.tsx    # Button group for single-select options
│   ├── styles/
│   │   └── widget.css           # All widget styles (injected into Shadow DOM)
│   └── lib/
│       └── api.ts               # fetch() calls to PocketBase widget endpoints
├── build.mjs                    # esbuild build script (IIFE, ES2015 target)
├── package.json                 # Preact, esbuild as devDependencies
└── dist/
    └── widget.js                # Built output (~20-30KB gzipped)
```

**Structure Decision**: Three-part architecture (backend + frontend + widget) extending the existing 001-form-saas layout. The `widget/` directory is a new standalone project with its own build pipeline (esbuild), separate from the Next.js frontend. The backend and frontend directories are extended in-place.

## Complexity Tracking

No constitution violations to justify. All design decisions favor simplicity:
- Questions stored as JSON in widget record (not a separate collection)
- Preact (~4KB) instead of full React for widget
- Shadow DOM instead of iframe for CSS isolation
- PocketBase standard CRUD for dashboard (no custom endpoints needed for authenticated operations)
