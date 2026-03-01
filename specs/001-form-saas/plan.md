# Implementation Plan: SaaS Form Submission Platform

**Branch**: `001-form-saas` | **Date**: 2026-03-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-form-saas/spec.md`

## Summary

Build a Formspree-like SaaS platform where authenticated users create named form
endpoints, accept POST submissions from any external website, view submitted data,
and optionally receive Telegram notifications.

**Backend**: PocketBase (binary, no Docker) extended with JavaScript hooks only.
Custom submission endpoint (`POST /api/submit/{formId}`) implemented as a PocketBase
JS hook. Submission storage and Telegram notification dispatched from hook.

**Frontend**: Next.js 15 (App Router) with shadcn/ui. PocketBase SDK (`pocketbase`
npm package) for auth and data. Playwright for mandatory API contract tests and E2E
tests.

**Key flow**: External form POSTs → PocketBase JS hook saves submission → redirects
to `_next` URL or to Next.js `/success` page.

## Technical Context

**Language/Version**: JavaScript (PocketBase JSVM, goja ES5+ES6, synchronous only);
TypeScript 5.x (Next.js frontend)
**Primary Dependencies**: PocketBase v0.23+ (v0.36.x), Next.js 15, shadcn/ui,
`pocketbase` npm SDK, Playwright
**Storage**: SQLite via PocketBase (embedded, zero-config)
**Testing**: Playwright (API contract tests + E2E browser tests)
**Target Platform**: Linux/macOS server — PocketBase binary + Node.js (Next.js)
**Project Type**: Web service (PocketBase backend) + Web application (Next.js frontend)
**Performance Goals**: Form submission end-to-end < 2 seconds (SC-002)
**Constraints**: No Docker; PocketBase extensions in JS only (no Go); 1 MB POST body
limit (FR-016)
**Scale/Scope**: Single-region SaaS MVP; no horizontal scaling required initially

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Code Quality | ESLint + TypeScript strict for frontend; SRP enforced in PocketBase hooks (submission route separate from notification hook) | ✅ PASS |
| II. API Testing (NON-NEGOTIABLE) | Playwright API contract tests defined for all public endpoints — submission endpoint (CT-001–CT-008) and PocketBase API (CT-010–CT-021) | ✅ PASS — planned |
| III. E2E Testing (NON-NEGOTIABLE) | Playwright E2E tests for all 3 P1 user stories (auth, form management, submission flow) | ✅ PASS — planned |
| IV. UX Consistency | shadcn/ui design tokens throughout; all interactive states (loading, success, error, empty) handled in every view | ✅ PASS — planned |
| V. Simplicity | PocketBase eliminates separate auth service, DB, and file server; Next.js App Router avoids extra state library; form token = PocketBase record ID (no separate UUID field) | ✅ PASS |

**Gate Status: PASS — proceed to Phase 0**

*Post-Phase 1 re-check*: ✅ All gates confirmed after design. No new violations.
No complexity exceptions required.

## Project Structure

### Documentation (this feature)

```text
specs/001-form-saas/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── submission-endpoint.md   # Custom PocketBase endpoint contract
│   └── pocketbase-api.md        # PocketBase REST API contract (frontend-facing)
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
backend/
├── pocketbase                   # PocketBase binary (gitignored, downloaded via script)
├── .env                         # TELEGRAM_BOT_TOKEN (gitignored)
├── pb_hooks/
│   └── main.pb.js               # Custom submission route + Telegram notification hook
└── pb_migrations/               # PocketBase auto-generated migration files

frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              # Auth guard: redirect to /login if no session
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx            # Form list with submission counts
│   │   │   └── forms/
│   │   │       └── [formId]/
│   │   │           ├── page.tsx        # Submission list for a form (paginated)
│   │   │           └── settings/
│   │   │               └── page.tsx   # Telegram chat ID configuration
│   │   ├── success/
│   │   │   └── page.tsx               # Default submission success page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── ui/                        # shadcn/ui generated components
│   └── lib/
│       ├── pocketbase-browser.ts      # PocketBase singleton for Client Components
│       └── pocketbase-server.ts       # PocketBase factory for Server Components
├── tests/
│   ├── contract/
│   │   ├── submission-api.spec.ts     # CT-001–CT-008 (submission endpoint)
│   │   └── forms-api.spec.ts          # CT-010–CT-021 (PocketBase REST API)
│   └── e2e/
│       ├── auth.spec.ts               # US1: registration + login flow
│       ├── forms.spec.ts              # US2: form creation + management
│       └── submission.spec.ts         # US3: submission + redirect logic
├── playwright.config.ts
├── package.json
└── .env.local                         # NEXT_PUBLIC_POCKETBASE_URL (gitignored)

scripts/
└── download-pocketbase.sh             # Downloads PocketBase binary for host OS/arch
```

**Structure Decision**: Two-project layout — `backend/` (PocketBase) and `frontend/`
(Next.js). Tests live in `frontend/tests/` since Playwright covers both API and
browser. This is the simplest structure that reflects the actual deployment split
(PocketBase process + Next.js process), without introducing a monorepo toolchain.

## Complexity Tracking

> No constitution violations — table not required.

---

## Phase 0: Research

**Status**: ✅ Complete — see [research.md](./research.md)

Key decisions resolved:

| Question | Decision |
|----------|----------|
| PocketBase hooks mechanism | JS JSVM hooks (`routerAdd`, `onRecordAfterCreateSuccess`, `$http.send`) |
| Body parsing in hook | `e.requestInfo().body` handles JSON + form-encoded transparently |
| Redirect from hook | `e.redirect(302, url)` |
| Body limit enforcement | `$apis.bodyLimit(1048576)` middleware on custom route |
| CORS for submission | PocketBase default allows all origins — no custom config |
| Success page | Next.js `/success?ref={encodedReferer}` (avoids serving HTML from PocketBase) |
| Form token | PocketBase record ID (no separate UUID field — simpler) |
| Telegram approach | Direct `$http.send()` to Bot API `sendMessage` (outbound-only; no webhook/polling) |
| Telegram secret storage | `$os.getenv("TELEGRAM_BOT_TOKEN")` |
| Next.js PocketBase client | Singleton in browser; new instance per request on server |
| Testing framework | Playwright — `request` fixture for contracts; browser tests for E2E |

---

## Phase 1: Design

**Status**: ✅ Complete

### Data Model — see [data-model.md](./data-model.md)

Three collections in PocketBase:
- **users** — built-in auth collection (email/password, verification)
- **forms** — `name`, `user` (relation), `telegram_chat_id` (optional)
- **submissions** — `form` (relation), `data` (JSON field, stores all fields except `_next`)

### API Contracts — see [contracts/](./contracts/)

- `submission-endpoint.md` — custom `POST /api/submit/{formId}` PocketBase route
- `pocketbase-api.md` — standard PocketBase REST API used by the frontend

### Key Design Decisions

**Submission endpoint as PocketBase JS hook**

The endpoint `POST /api/submit/{formId}` is implemented as a PocketBase custom route
in `pb_hooks/main.pb.js`. This means:
- The external form's `action` attribute points to the PocketBase URL (not Next.js).
- PocketBase handles the redirect response directly.
- No Next.js server involvement in the hot path for form submissions.

**`_next` validation**

```javascript
function isValidRedirectUrl(url) {
    return typeof url === "string" && /^https?:\/\/.+/.test(url)
}
```

Simple regex check (no full URL parser needed). Only validates scheme — not the full
URL structure. Sufficient for the MVP per Principle V (Simplicity).

**Success page redirect**

On submission without a valid `_next`, the hook redirects to:
```
{FRONTEND_URL}/success?ref={encodeURIComponent(referer)}
```
The Next.js `/success` page reads `ref`, validates it as `https?://`, and renders a
"Return to site" link or a generic message if absent.

**Telegram notification — non-blocking**

Notifications are dispatched in `onRecordAfterCreateSuccess`, not in the route
handler. This keeps the HTTP response to the submitter free from Telegram latency.
The hook wraps `$http.send()` in a try/catch and logs failures without re-throwing
(FR-014 compliance).

**Auth guard in Next.js**

The `(dashboard)/layout.tsx` server component calls `getServerPocketBase()`,
checks `pb.authStore.isValid`, and redirects to `/login` if no valid session.
This pattern avoids an extra middleware layer (Principle V).

### Quickstart — see [quickstart.md](./quickstart.md)

Full local development setup: download PocketBase binary → configure `.env` →
start PocketBase → start Next.js → test with curl.

### Agent Context Update

Run agent context update after plan approval:
```bash
bash .specify/scripts/bash/update-agent-context.sh claude
```

---

## Phase 2: Tasks

**Status**: Pending — run `/speckit.tasks` to generate `tasks.md`.

### Suggested task groupings

| Phase | Scope |
|-------|-------|
| Setup | Repo init, download script, PocketBase binary, frontend scaffolding, shadcn/ui, Playwright config |
| Foundational | PocketBase collections (forms + submissions), access rules, migrations; Next.js PocketBase client utilities |
| US1 (P1) | Registration page, login page, email verification flow, auth guard, logout |
| US2 (P1) | Dashboard form list, create form, rename, delete, submission URL display |
| US3 (P1) | `POST /api/submit/{formId}` hook, `_next` redirect, success page, body limit, Telegram hook stub |
| US4 (P2) | Submission list page (paginated), empty state, access control |
| US5 (P3) | Telegram settings page, chat ID save, `$http.send()` notification, failure logging |
| Polish | ESLint config, all state handling audit (loading/error/empty/success), E2E test stabilization |

### Testing requirements per constitution

- **API contract tests** (Principle II — NON-NEGOTIABLE): CT-001–CT-021 MUST be
  written before or alongside each implementation task.
- **E2E tests** (Principle III — NON-NEGOTIABLE): `auth.spec.ts`, `forms.spec.ts`,
  and `submission.spec.ts` MUST be delivered with their respective P1 user stories.
