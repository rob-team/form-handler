# Implementation Plan: OAuth Login (Google & GitHub)

**Branch**: `003-oauth-login` | **Date**: 2026-03-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-oauth-login/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add Google and GitHub OAuth2 sign-in to the dashboard. PocketBase v0.36.x provides built-in OAuth2 support — the entire backend flow (authorization URL, token exchange, user creation, account linking by email) is handled natively with zero custom backend code. The frontend adds OAuth login buttons to the login page using the PocketBase JS SDK's popup-based `authWithOAuth2()` method, and an account settings page for managing linked providers. Existing email/password authentication remains unchanged.

## Technical Context

**Language/Version**: TypeScript 5 (frontend), JavaScript ES5+ES6 (PocketBase JSVM hooks — no new hooks needed for this feature)
**Primary Dependencies**: Next.js 16, React 19, shadcn/ui, Tailwind CSS 4, PocketBase JS SDK (`pocketbase` v0.26.x)
**Storage**: PocketBase v0.36.x (SQLite-backed, existing instance from 001/002) — `_externalAuths` system collection for OAuth identities
**Testing**: Playwright (contract tests + E2E), following existing 001/002 patterns
**Target Platform**: Web — dashboard runs on modern browsers (same as 002)
**Project Type**: Web application (extending existing backend + frontend)
**Performance Goals**: OAuth sign-in flow completes in <10 seconds (excluding provider consent screen time)
**Constraints**: PocketBase JSVM is synchronous-only; OAuth2 popup flow requires browser context (Client Components only); provider credentials configured via Admin UI (not code)
**Scale/Scope**: Same as existing — single-tenant, moderate traffic

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality | ✅ Pass | TypeScript strict mode; minimal new code (leverages PocketBase built-in OAuth2) |
| II. API Testing (NON-NEGOTIABLE) | ✅ Pass | Contract tests planned for auth methods listing, external auths CRUD (CT-OA-001 through CT-OA-008) |
| III. E2E Testing (NON-NEGOTIABLE) | ✅ Pass | E2E tests planned for P1 (Google sign-in flow) and P2 (GitHub sign-in flow) user stories |
| IV. UX Consistency | ✅ Pass | OAuth buttons use shadcn/ui components with provider brand icons; all states handled (loading, success, error); terminology matches spec |
| V. Simplicity | ✅ Pass | Zero custom backend code — uses PocketBase built-in OAuth2 entirely; popup flow via SDK; auto account linking by email |

**Post-Phase 1 re-check**: All gates still pass. No custom endpoints needed — all OAuth operations use PocketBase built-in APIs. Data model extends users collection with two optional fields (name, avatar). No unnecessary abstractions introduced.

## Project Structure

### Documentation (this feature)

```text
specs/003-oauth-login/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── oauth-api.md     # PocketBase built-in OAuth endpoints contract
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── pb_hooks/
│   └── main.pb.js               # Existing — no changes needed for OAuth
├── pb_migrations/
│   ├── 1_create_forms.js         # Existing (unchanged)
│   ├── 2_create_submissions.js   # Existing (unchanged)
│   ├── 3_create_widgets.js       # Existing (unchanged)
│   ├── 4_create_inquiries.js     # Existing (unchanged)
│   ├── 5_create_visitor_records.js  # Existing (unchanged)
│   └── 6_add_user_profile_fields.js # NEW: add name + avatar fields to users collection
└── pb_data/                      # Existing (unchanged — OAuth config stored here via Admin UI)

frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx         # MODIFIED: add OAuth login buttons
│   │   └── (dashboard)/
│   │       ├── layout.tsx           # Existing auth guard (unchanged)
│   │       ├── dashboard/
│   │       │   └── page.tsx         # Existing (unchanged)
│   │       └── settings/
│   │           └── page.tsx         # NEW: account settings — linked OAuth providers
│   ├── components/
│   │   ├── oauth-buttons.tsx        # NEW: Google + GitHub sign-in buttons (Client Component)
│   │   ├── linked-providers.tsx     # NEW: connected providers list with disconnect
│   │   ├── user-avatar-menu.tsx     # NEW: avatar dropdown replacing LogoutButton (settings + logout)
│   │   ├── logout-button.tsx        # DELETED: logic moved into user-avatar-menu.tsx
│   │   └── ui/
│   │       ├── avatar.tsx           # NEW: shadcn/ui avatar (installed via CLI)
│   │       └── ...                  # Existing shadcn/ui components (unchanged)
│   └── lib/
│       ├── pocketbase-browser.ts    # Existing (unchanged — cookie sync already works)
│       └── pocketbase-server.ts     # Existing (unchanged)
└── tests/
    ├── contract/
    │   └── oauth-api.spec.ts        # NEW: auth methods + external auths contract tests
    └── e2e/
        └── oauth.spec.ts            # NEW: OAuth sign-in + account linking E2E tests
```

**Structure Decision**: Extends the existing two-project layout (backend + frontend) from 001/002. No new directories at the root level. The backend requires only a migration for user profile fields — all OAuth logic is PocketBase built-in. The frontend adds a login page modification, two new components, and an account settings page.

## Complexity Tracking

No constitution violations — table not required. All design decisions favor simplicity:
- Zero custom backend endpoints (PocketBase built-in OAuth2)
- Popup flow via SDK (no manual PKCE/state handling)
- Automatic account linking by email (PocketBase native)
- `_externalAuths` system collection (no custom data model for OAuth identities)
- Dynamic provider discovery via `listAuthMethods()` (no hardcoded provider list)

---

## Phase 0: Research

**Status**: ✅ Complete — see [research.md](./research.md)

Key decisions resolved:

| Question | Decision |
|----------|----------|
| OAuth2 backend approach | PocketBase built-in (zero custom backend code) |
| Provider configuration | PocketBase Admin UI (client ID + secret per provider) |
| Client auth flow | Popup-based `authWithOAuth2()` in Client Components |
| Account linking | Automatic by PocketBase (email match) |
| Profile data (name, avatar) | Admin UI field mappings + optional client-side fallback |
| OAuth identity storage | Built-in `_externalAuths` system collection |
| Provider discovery | `listAuthMethods()` API (dynamic) |
| CSRF protection | SDK built-in PKCE + state parameter |
| Post-auth redirect | Query parameter on login URL (`?redirect=`) + client-side navigation |
| Redirect URI for providers | `{POCKETBASE_URL}/api/oauth2-redirect` (PocketBase built-in) |

---

## Phase 1: Design

**Status**: ✅ Complete

### Data Model — see [data-model.md](./data-model.md)

Two relevant entities:
- **users** (existing, extended) — add `name` (text) and `avatar` (file) fields
- **_externalAuths** (PocketBase system, no changes) — stores OAuth provider links automatically

### API Contracts — see [contracts/](./contracts/)

- `oauth-api.md` — PocketBase built-in endpoints: list auth methods, OAuth2 redirect callback, list external auths, unlink external auth

### Key Design Decisions

**PocketBase built-in OAuth2 (zero backend code)**

The entire OAuth2 flow is handled by PocketBase natively. This includes:
- Authorization URL generation with PKCE
- Token exchange with the provider
- User creation (new email) or account linking (existing email)
- Session token generation
- External auth record management

No custom PocketBase hooks, routes, or middleware are needed.

**Popup-based flow for login**

The PocketBase JS SDK's `authWithOAuth2()` opens a popup window for the provider's consent screen. This is preferred over full-page redirects because:
- The parent page state is preserved
- The existing cookie sync (`authStore.onChange`) propagates auth to server components
- Better UX — no full-page reload

**Dynamic provider buttons**

The login page calls `listAuthMethods()` on mount to discover enabled providers. This means:
- Adding/removing providers in the Admin UI is reflected immediately
- No code changes needed to add future OAuth providers
- Login buttons render only for configured providers

**Account settings page**

A new `/settings` page under the dashboard layout allows users to:
- View linked OAuth providers (via `listExternalAuths()`)
- Connect additional providers (via `authWithOAuth2()` while authenticated)
- Disconnect providers (via `unlinkExternalAuth()`) with safeguard against removing the last auth method

**Redirect after login**

The auth guard in `(dashboard)/layout.tsx` redirects unauthenticated users to `/login?redirect={encodedPath}`. After successful OAuth sign-in, the login page reads the `redirect` query parameter and navigates there. Falls back to `/dashboard` if no redirect parameter.

### Quickstart — see [quickstart.md](./quickstart.md)

Local development setup: configure Google/GitHub OAuth apps → enable in PocketBase Admin UI → add name/avatar fields → test the flow.

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
| Setup | Migration for user profile fields (name, avatar); PocketBase Admin UI provider config documentation |
| US1 (P1) | Login page OAuth buttons, `authWithOAuth2()` integration, post-auth redirect, error handling |
| US2 (P2) | GitHub-specific handling (private email), provider brand icons, login page responsive layout |
| US3 (P3) | Account settings page, linked providers list, connect/disconnect functionality |
| Testing | Contract tests (CT-OA-001–CT-OA-008), E2E tests for OAuth sign-in and account linking |
| Polish | Loading states, error messages, empty states, UX consistency audit |

### Testing requirements per constitution

- **API contract tests** (Principle II — NON-NEGOTIABLE): CT-OA-001–CT-OA-008 MUST be written before or alongside implementation.
- **E2E tests** (Principle III — NON-NEGOTIABLE): `oauth.spec.ts` MUST cover P1 (Google sign-in) and P2 (GitHub sign-in) user stories.
