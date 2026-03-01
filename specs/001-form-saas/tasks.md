---
description: "Task list for SaaS Form Submission Platform"
---

# Tasks: SaaS Form Submission Platform

**Input**: Design documents from `/specs/001-form-saas/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: API contract tests and E2E tests are MANDATORY per the project constitution
(Principles II and III). API contract tests MUST be written before or alongside
endpoint implementation. E2E tests MUST be included for every P1 user story.

**Organization**: Tasks are grouped by user story to enable independent implementation
and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Every task includes an exact file path

---

## Phase 1: Setup

**Purpose**: Repository scaffolding, toolchain initialization, and dev environment
configuration. All tasks produce artifacts required by every subsequent phase.

- [x] T001 Create root directory structure: `backend/pb_hooks/`, `backend/pb_migrations/`, `frontend/`, `scripts/`
- [x] T002 [P] Create `scripts/download-pocketbase.sh` — detect OS/arch (`uname -s`/`uname -m`), download matching PocketBase release from GitHub (`https://github.com/pocketbase/pocketbase/releases`), unzip to `backend/pocketbase`, `chmod +x`; make the script idempotent (skip if binary exists and matches target version)
- [x] T003 Initialize Next.js 15 project in `frontend/` with TypeScript, Tailwind CSS, and App Router: `npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir`; then move `src/` layout: create `frontend/src/app/` and `frontend/src/lib/` directories manually
- [x] T004 Install and initialize shadcn/ui in `frontend/` — run `npx shadcn@latest init` accepting defaults (New York style, CSS variables); then add required components: `npx shadcn@latest add button card input label dialog alert dropdown-menu`
- [x] T005 [P] Install `pocketbase` npm SDK in `frontend/`: `npm install pocketbase`
- [x] T006 [P] Install Playwright in `frontend/`: `npm install -D @playwright/test`; run `npx playwright install --with-deps chromium` to install Chromium browser
- [x] T007 Create `frontend/playwright.config.ts` with two projects: `api-contracts` (testMatch: `tests/contract/**/*.spec.ts`, no browser, baseURL: `http://127.0.0.1:8090`) and `e2e` (testMatch: `tests/e2e/**/*.spec.ts`, use: `{ browserName: 'chromium' }`, baseURL: `http://localhost:3000`); set `webServer` entries for both PocketBase (port 8090) and Next.js (port 3000)
- [x] T008 [P] Create `backend/.env.example` (fields: `TELEGRAM_BOT_TOKEN=`, `FRONTEND_URL=http://localhost:3000`) and `frontend/.env.local.example` (fields: `NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090`, `NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000`); add both real `.env` files to `.gitignore`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before any user story begins.
Defines the database schema, access rules, and shared client utilities.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T009 Create `backend/pb_hooks/main.pb.js` skeleton — define `isValidRedirectUrl(url)` helper (regex: `/^https?:\/\/.+/.test(url)`); add empty `routerAdd` placeholder comment for the submission route; add empty `onRecordAfterCreateSuccess` placeholder comment for the Telegram hook; no functional code yet
- [x] T010 Create `backend/pb_migrations/1_create_forms.js` — PocketBase JS migration that calls `migrate((app) => {...}, (app) => {...})`; forward: `new Collection({ name: "forms", type: "base", fields: [{ name: "name", type: "text", required: true, min: 1, max: 100 }, { name: "user", type: "relation", collectionId: "_pb_users_auth_", required: true, cascadeDelete: true }, { name: "telegram_chat_id", type: "text" }], listRule: "@request.auth.id = user", viewRule: "@request.auth.id = user", createRule: "@request.auth.id != \"\"", updateRule: "@request.auth.id = user", deleteRule: "@request.auth.id = user" })`, then `app.save(collection)`; rollback: `app.delete(app.findCollectionByNameOrId("forms"))`
- [x] T011 Create `backend/pb_migrations/2_create_submissions.js` — same migration pattern; forward: `new Collection({ name: "submissions", type: "base", fields: [{ name: "form", type: "relation", collectionId: "forms", required: true, cascadeDelete: true }, { name: "data", type: "json", required: true }], listRule: "@request.auth.id = form.user", viewRule: "@request.auth.id = form.user", createRule: "", updateRule: "", deleteRule: "@request.auth.id = form.user" })`; rollback: delete the `submissions` collection
- [x] T012 [P] Create `frontend/src/lib/pocketbase-browser.ts` — export `getPocketBase(): PocketBase`; module-level singleton (`let client: PocketBase | null = null`); on first call: `new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)`, call `client.authStore.loadFromCookie(document.cookie)`, register `client.authStore.onChange(() => { document.cookie = client!.authStore.exportToCookie({ httpOnly: false }) })`; return singleton; guard against SSR (if `typeof window === "undefined"` return a throwaway instance)
- [x] T013 [P] Create `frontend/src/lib/pocketbase-server.ts` — export `async function getServerPocketBase(): Promise<PocketBase>`; inside: `new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)` (never a module-level singleton); read `pb_auth` cookie via `await cookies()` from `next/headers`; call `pb.authStore.loadFromCookie(...)` if cookie exists; return `pb`
- [x] T014 Create `frontend/src/app/(dashboard)/layout.tsx` — async server component; call `getServerPocketBase()`; if `!pb.authStore.isValid` call `redirect("/login")`; render `<html>` wrapper with a top navigation bar containing the platform name and a `<LogoutButton />` slot; export `metadata`; do NOT implement logout logic here (added in T020)

**Checkpoint**: Foundation ready — collections exist, client utilities in place, auth guard active.

---

## Phase 3: User Story 1 — User Registration and Login (Priority: P1) 🎯 MVP

**Goal**: Visitors can register, verify email, log in, and log out. All subsequent
dashboard functionality depends on this story.

**Independent Test**: Register a new account → click verification email link → log in
→ verify dashboard loads → log out → verify redirect to `/login`.

### Tests for User Story 1

> **Write these tests FIRST, ensure they FAIL before implementation.**
>
> API contract tests and E2E tests are MANDATORY (constitution Principles II & III).

- [x] T015 [P] [US1] Write auth contract tests CT-010–CT-013 in `frontend/tests/contract/forms-api.spec.ts` — CT-010: `POST /api/collections/users/records` with unique email → 200, user record returned; CT-011: same email twice → 400 with `email` validation error; CT-012: `POST /api/collections/users/auth-with-password` with valid credentials → 200, `token` field present; CT-013: wrong password → 400
- [x] T016 [US1] Write E2E tests for US1 in `frontend/tests/e2e/auth.spec.ts` — four scenarios: (1) full registration flow: fill register form, submit, see verification-sent confirmation; (2) login with correct credentials → dashboard visible; (3) login with wrong password → inline error message shown, still on login page; (4) logout: click logout button → redirected to `/login`, dashboard route redirects back to `/login`; use Playwright's `page.goto`, `page.fill`, `page.click`, `expect(page).toHaveURL`

### Implementation for User Story 1

- [x] T017 [P] [US1] Create `frontend/src/app/(auth)/register/page.tsx` — client component (`"use client"`); shadcn `Card` > `CardHeader` (title "Create account") > `CardContent` (email `Input`, password `Input`, confirm-password `Input`) > `CardFooter` (`Button` "Create account", link to `/login`); on submit: call `getPocketBase().collection("users").create(...)` then `.collection("users").requestVerification(email)`; states: loading (disable button, show spinner), success (show "Check your email" message), error (show error text below form)
- [x] T018 [P] [US1] Create `frontend/src/app/(auth)/login/page.tsx` — client component; shadcn `Card` with email + password `Input`; on submit: call `getPocketBase().collection("users").authWithPassword(email, password)`; `authStore.onChange` fires and syncs token to cookie automatically; on success: `router.push("/dashboard")`; states: loading (disable button), error (show "Invalid email or password" below form); link to `/register` and `/reset-password`
- [x] T019 [P] [US1] Create `frontend/src/app/(auth)/reset-password/page.tsx` — client component; shadcn `Card` with email `Input` and "Send reset link" `Button`; on submit: call `getPocketBase().collection("users").requestPasswordReset(email)`; success state: replace form with "If that email exists, a reset link has been sent" message (no email enumeration); error state: show generic error
- [x] T020 [US1] Create `frontend/src/components/logout-button.tsx` — client component; shadcn `Button` variant ghost; on click: `getPocketBase().authStore.clear()` (triggers onChange, clears cookie), then `router.push("/login")`; import and render `<LogoutButton />` in `frontend/src/app/(dashboard)/layout.tsx` nav bar (depends on T014)

**Checkpoint**: US1 complete — registration, verification, login, logout all functional independently.

---

## Phase 4: User Story 2 — Form Creation and Management (Priority: P1)

**Goal**: Logged-in users create named forms and receive unique submission endpoint
URLs. Forms can be renamed and deleted from the dashboard.

**Independent Test**: Log in → create form named "Contact" → copy endpoint URL →
`curl -X POST {url} -d "name=test"` → verify 302 response (submission route exists
from foundation even before US3) → rename form → verify URL unchanged → delete form
→ verify POST returns 404.

### Tests for User Story 2

> **Write these tests FIRST, ensure they FAIL before implementation.**

- [x] T021 [P] [US2] Append forms CRUD contract tests CT-014–CT-019 to `frontend/tests/contract/forms-api.spec.ts` — CT-014: authenticated `POST /api/collections/forms/records` with `{ name, user }` → 200, record with `id` returned; CT-015: `GET /api/collections/forms/records` authenticated → 200, only caller's forms in `items`; CT-016: unauthenticated GET → 403; CT-017: authenticated `PATCH /api/collections/forms/records/{id}` with new name → 200, name updated; CT-018: non-owner PATCH → 403; CT-019: owner `DELETE /api/collections/forms/records/{id}` → 204
- [x] T022 [US2] Write E2E tests for US2 in `frontend/tests/e2e/forms.spec.ts` — use `test.beforeEach` to log in via API (`request.post(.../auth-with-password)`); scenarios: (1) create form: click "New Form" button, enter name "My Form", submit → card appears with name + endpoint URL; (2) rename form: open dropdown → rename → enter "Renamed Form" → save → card shows new name, endpoint URL unchanged; (3) delete form: open dropdown → delete → confirm → card removed from list; (4) empty state: new user sees "No forms yet" message

### Implementation for User Story 2

- [x] T023 [P] [US2] Create `frontend/src/components/create-form-dialog.tsx` — client component; shadcn `Dialog` triggered by a "New Form" `Button`; `DialogContent` contains form name `Input` (min 1 char, max 100 chars) and "Create" `Button`; on submit: call `getPocketBase().collection("forms").create({ name, user: pb.authStore.record?.id })`; loading state (disable button); error state (show message in dialog); on success: close dialog, call `onCreated()` callback prop to refresh list; clear input on close
- [x] T024 [P] [US2] Create `frontend/src/components/form-card.tsx` — client component; shadcn `Card` displaying: form name (`CardTitle`), created date (formatted), submission count (fetched or passed as prop), endpoint URL in a copyable `Input` (read-only with copy-to-clipboard `Button`); shadcn `DropdownMenu` with "Rename" and "Delete" actions; rename: inline `Input` replaces title, save with PATCH call; delete: shadcn `AlertDialog` confirmation, then DELETE call; calls `onUpdated()` / `onDeleted()` callbacks on success; all states handled (loading, error, success)
- [x] T025 [US2] Create `frontend/src/app/(dashboard)/dashboard/page.tsx` — async server component; call `getServerPocketBase()`, fetch `pb.collection("forms").getFullList({ sort: "-created", expand: "" })`; for each form, also fetch submission count via `pb.collection("submissions").getList(1, 1, { filter: \`form="${form.id}"\` })`; render `<CreateFormDialog />` button and grid of `<FormCard />` components (pass form + count as props); empty state: shadcn `Card` with "You haven't created any forms yet" and a "Create your first form" button; loading: use React `Suspense` with skeleton cards (depends on T023, T024)

**Checkpoint**: US2 complete — dashboard fully functional; forms can be created, listed, renamed, deleted.

---

## Phase 5: User Story 3 — Form Submission Handling with Redirect Logic (Priority: P1)

**Goal**: External HTML forms POST to `{PB_URL}/api/submit/{formId}`. Data is saved.
If `_next` is a valid absolute URL, caller is redirected there. Otherwise, caller is
redirected to the Next.js `/success` page.

**Independent Test**: (a) `curl -X POST .../api/submit/{id} -d "email=a@b.com&_next=https://example.com" -L` → lands on `example.com`; (b) same without `_next` → lands on `/success` page; (c) `_next=not-a-url` → `/success` page; (d) non-existent id → 404.

### Tests for User Story 3

> **Write these tests FIRST, ensure they FAIL before implementation.**

- [x] T026 [P] [US3] Write submission endpoint contract tests CT-001–CT-011 in `frontend/tests/contract/submission-api.spec.ts` — each test uses `request.post` with `maxRedirects: 0` to intercept the 302 before it is followed:
  - CT-001: form-encoded POST with `email=a@b.com&_next=https://example.com` → status 302, `location` header = `https://example.com`
  - CT-002: POST with `email=a@b.com` (no `_next`) → 302, `location` contains `/success`
  - CT-003: POST with `_next=not-a-url` (relative path) → 302, `location` contains `/success` (not `not-a-url`)
  - CT-004: POST to non-existent formId `doesnotexist` → 404
  - CT-005: POST body of exactly 1 MB + 1 byte → 413
  - CT-006: POST with `email=a@b.com&_next=https://example.com` → fetch saved submission via admin API, assert `data` object has `email` key but NOT `_next` key
  - CT-007: POST with empty body → 302; fetch submission via admin API, assert `data = {}`
  - CT-008: POST with `Content-Type: application/json`, body `{"email":"a@b.com","message":"hi"}` → 302; fetch submission, assert both fields present
  - CT-009: POST with `email=a@b.com&topic=Support&message=Hello` → 302; fetch submission, assert `data` has exactly `email`, `topic`, `message` keys, all with correct values
  - CT-010: POST with `email=a@b.com` only → 302; fetch submission, assert `data` has only `email` key (no `topic`, no `message` keys present)
  - CT-011: POST with `email=a@b.com&custom_field=xyz&another=123` → 302; fetch submission, assert all three fields present in `data`
- [x] T027 [US3] Write E2E tests for US3 in `frontend/tests/e2e/submission.spec.ts` — use `test.beforeAll` to create a test user + test form via API; scenarios: (1) `page.goto` to a test HTML page that POSTs to the endpoint with `_next=https://example.com` → assert `page.url()` equals `https://example.com`; (2) POST without `_next` → assert URL contains `/success`, page contains "successfully submitted" text; (3) POST with `_next=bad-url` → assert URL contains `/success`; (4) directly navigate to `{PB_URL}/api/submit/nonexistent` method POST → assert 404 page or error; cleanup: delete test form in `test.afterAll`

### Implementation for User Story 3

- [x] T028 [US3] Implement the submission route in `backend/pb_hooks/main.pb.js` — replace the placeholder with a fully working `routerAdd("POST", "/api/submit/{formId}", (e) => { ... }, $apis.bodyLimit(1048576))`: (1) `const formId = e.request.pathValue("formId")`; (2) look up form: `let form; try { form = $app.findRecordById("forms", formId) } catch(_) { return e.json(404, { code: 404, message: "Form not found." }) }`; (3) parse body: `const body = e.requestInfo().body || {}`; (4) extract next: `const nextUrl = (body["_next"] || "").toString(); delete body["_next"]`; (5) save submission: `const col = $app.findCollectionByNameOrId("submissions"); const rec = new Record(col); rec.set("form", formId); rec.set("data", body); $app.save(rec)`; (6) redirect: `if (isValidRedirectUrl(nextUrl)) { return e.redirect(302, nextUrl) } const referer = e.request.header.get("Referer") || ""; const frontendUrl = $os.getenv("FRONTEND_URL") || "http://localhost:3000"; return e.redirect(302, frontendUrl + "/success?ref=" + encodeURIComponent(referer))`
- [x] T029 [P] [US3] Create `frontend/src/app/success/page.tsx` — async server component; read `ref` search param from `props.searchParams`; validate `ref` with `/^https?:\/\/.+/.test(ref)`; render shadcn `Card` centered on page: `CardHeader` "Form submitted successfully", `CardContent` with success icon and "Your message has been received." text; if `ref` is valid: `CardFooter` with a `Button` `<a href={ref}>Return to site</a>`; if no valid `ref`: show generic "You may close this page." message; page must render with no JavaScript (pure server component)

**Checkpoint**: US3 complete — full submission pipeline operational end-to-end.

---

## Phase 6: User Story 4 — Submission Data Viewing (Priority: P2)

**Goal**: Form owners log in and browse all submissions for a form, newest first,
with all field name/value pairs visible and paginated.

**Independent Test**: Send 3 test POSTs to a form → log in → navigate to
`/forms/{formId}` → assert all 3 submissions appear newest-first, each showing
the correct field values → navigate to a form owned by another user → assert 403
or empty list.

### Tests for User Story 4

> **Write these tests FIRST, ensure they FAIL before implementation.**

- [x] T030 [P] [US4] Append submissions list contract tests CT-020–CT-021 to `frontend/tests/contract/forms-api.spec.ts` — CT-020: authenticated `GET /api/collections/submissions/records?filter=form%3D'{formId}'&sort=-created` for a form with 3 submissions → 200, `items` array has 3 entries, first entry `created` is most recent, `data` field contains the expected key/value pairs; CT-021: same request authenticated as a different user (non-owner) → `totalItems: 0` (access rule returns empty result, not 403, for list queries in PocketBase)

### Implementation for User Story 4

- [x] T031 [P] [US4] Create `frontend/src/components/submission-item.tsx` — server component; accepts `submission: { id: string, data: Record<string, unknown>, created: string }` prop; render shadcn `Card`: `CardHeader` with formatted timestamp (use `new Intl.DateTimeFormat` with date + time); `CardContent` with a `<dl>` definition list — for each key in `submission.data`, render `<dt>` (field name, styled as label) and `<dd>` (field value as string); handle empty `data` object with "No fields submitted" message; handle `data` values that are objects/arrays by JSON-stringifying them
- [x] T032 [US4] Create `frontend/src/app/(dashboard)/forms/[formId]/page.tsx` — async server component; call `getServerPocketBase()`; fetch form: `pb.collection("forms").getOne(formId)` — if throws (not found or not owner) redirect to `/dashboard`; fetch submissions: `pb.collection("submissions").getList(page, 20, { filter: \`form="${formId}"\`, sort: "-created" })`; render: page header with form name + endpoint URL (copyable); if no submissions: empty state shadcn `Card` with "No submissions yet" + code snippet showing how to use the endpoint URL; if submissions: list of `<SubmissionItem />` components; pagination controls using shadcn `Button` prev/next with `?page=N` search params (depends on T031)

**Checkpoint**: US4 complete — submission viewing functional with pagination and access control.

---

## Phase 7: User Story 5 — Telegram Notification Configuration (Priority: P3)

**Goal**: Form owners configure a Telegram chat ID on a form. When a submission
arrives, a notification is sent to that chat via the platform's Telegram bot.

**Independent Test**: Set `TELEGRAM_BOT_TOKEN` in environment → navigate to form
settings → enter chat ID → save → submit a test POST to the form → verify Telegram
message arrives with correct field summary.

### Implementation for User Story 5

- [x] T033 [P] [US5] Create `frontend/src/components/telegram-setup-instructions.tsx` — server component; render shadcn `Alert` with title "How to set up Telegram notifications" and step-by-step list: (1) Open Telegram and search for the platform's bot (show bot username from env or placeholder); (2) Send `/start` to the bot; (3) Use @userinfobot or similar to find your chat ID; (4) Paste the chat ID in the field below and save; note: include group chat ID format (negative number with `-100` prefix)
- [x] T034 [P] [US5] Create `frontend/src/app/(dashboard)/forms/[formId]/settings/page.tsx` — async server component for initial render; fetch form via `getServerPocketBase()` to pre-populate existing `telegram_chat_id`; render shadcn `Card` with: `<TelegramSetupInstructions />` component; chat ID `Input` (pre-filled with existing value or empty); "Save" `Button`; on save (client action): `PATCH /api/collections/forms/records/{formId}` with `{ telegram_chat_id }` via `getPocketBase()`; success state: shadcn `Alert` "Notifications enabled"; clear state: "Remove" button to PATCH with `{ telegram_chat_id: "" }` (depends on T033)
- [x] T035 [US5] Implement `onRecordAfterCreateSuccess` Telegram hook in `backend/pb_hooks/main.pb.js` — add after the submission route: `onRecordAfterCreateSuccess((e) => { try { const form = $app.findRecordById("forms", e.record.getString("form")); const chatId = form.getString("telegram_chat_id"); if (!chatId) { e.next(); return; } const data = e.record.get("data") || {}; const lines = ["📋 New form submission"]; for (const key in data) { lines.push(key + ": " + String(data[key])) } const token = $os.getenv("TELEGRAM_BOT_TOKEN"); if (!token) { console.error("TELEGRAM_BOT_TOKEN not set"); e.next(); return; } const res = $http.send({ url: "https://api.telegram.org/bot" + token + "/sendMessage", method: "POST", body: JSON.stringify({ chat_id: chatId, text: lines.join("\n") }), headers: { "content-type": "application/json" }, timeout: 8 }); if (res.statusCode !== 200) { console.error("Telegram notify failed:", res.statusCode) } } catch (err) { console.error("Telegram hook error:", err) } e.next() }, "submissions")`

**Checkpoint**: US5 complete — Telegram notifications working end-to-end.

---

## Polish & Cross-Cutting Concerns

**Purpose**: Quality gates, missing states, and environment hardening.

- [x] T036 [P] Configure ESLint and TypeScript strict mode in `frontend/` — create `frontend/eslint.config.mjs` enabling `@typescript-eslint/recommended` and `@typescript-eslint/strict`; update `frontend/tsconfig.json` to set `"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`; run `npm run lint` and fix all reported errors
- [x] T037 [P] Add loading skeleton states to all async server components — add shadcn `Skeleton` components in `frontend/src/app/(dashboard)/dashboard/loading.tsx` (skeleton grid of 3 form cards) and `frontend/src/app/(dashboard)/forms/[formId]/loading.tsx` (skeleton list of 5 submission items); Next.js App Router automatically uses `loading.tsx` for Suspense boundaries
- [x] T038 Audit all pages for missing interactive states per constitution Principle IV — check every page against the four-state checklist (loading ✓, success ✓, error ✓, empty ✓); fix any gaps: ensure register/login/settings pages all show error messages for network failures; ensure success page renders without back link when `ref` is absent; document any intentional omissions
- [x] T039 [P] Add `package.json` test scripts in `frontend/package.json` — `"test:contract": "playwright test --project=api-contracts"`, `"test:e2e": "playwright test --project=e2e"`, `"test": "playwright test"`, `"lint": "next lint"`; verify `npm run lint` and `npm run test:contract` exit 0 with the implementation in place
- [x] T040 Run full test suite and fix failures — run `npm run test:contract` (all CT-001–CT-021 + field combination tests); run `npm run test:e2e` (US1–US3 E2E specs); fix any failing tests by tracing the actual vs expected response; confirm all 40 tasks produce a green build

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Requires Phase 1 complete — BLOCKS all user stories
- **US1, US2, US3 (Phases 3–5)**: All require Foundation; can proceed in priority order P1→P1→P1 or in parallel if staffed
- **US4 (Phase 6)**: Requires Foundation + US3 (submission data must exist to view)
- **US5 (Phase 7)**: Requires Foundation + US3 (hook fires on submission creation)
- **Polish (Final)**: Requires all desired user stories complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundation only
- **US2 (P1)**: Depends on Foundation only (dashboard requires auth from US1, but US2 can be tested independently via API)
- **US3 (P1)**: Depends on Foundation only (submission endpoint is independent of auth UI)
- **US4 (P2)**: Depends on US3 (submissions must be created to display)
- **US5 (P3)**: Depends on US3 (hook fires on submission creation)

### Within Each User Story

- Contract tests MUST be committed before or alongside the implementation they test
- E2E tests MUST be committed with the feature that closes the user story
- Implementation order within a story: utilities → components → pages → wiring

### Parallel Opportunities

All `[P]`-marked tasks within a phase can execute concurrently:
- Phase 1: T002, T005, T006, T008 in parallel (different files)
- Phase 2: T012, T013 in parallel (different files)
- US1: T015, T017, T018, T019 in parallel (different files); T016, T020 must follow T015, T018
- US2: T021, T023, T024 in parallel; T022, T025 follow
- US3: T026, T029 in parallel; T027, T028 follow T026
- US4: T030, T031 in parallel; T032 follows both
- US5: T033, T034 in parallel; T035 follows
- Polish: T036, T037, T039 in parallel; T038, T040 sequential

---

## Parallel Execution Examples

### US3 — Parallel Start

```text
# Both can start simultaneously after Foundation:
Task T026: "Write submission contract tests CT-001–CT-011 in frontend/tests/contract/submission-api.spec.ts"
Task T029: "Create success page in frontend/src/app/success/page.tsx"

# After T026 is done:
Task T028: "Implement submission route in backend/pb_hooks/main.pb.js"
Task T027: "Write E2E tests in frontend/tests/e2e/submission.spec.ts"
```

### US1 — Parallel Start

```text
# All four can start simultaneously after Foundation:
Task T015: "Write auth contract tests in frontend/tests/contract/forms-api.spec.ts"
Task T017: "Create register page in frontend/src/app/(auth)/register/page.tsx"
Task T018: "Create login page in frontend/src/app/(auth)/login/page.tsx"
Task T019: "Create reset-password page in frontend/src/app/(auth)/reset-password/page.tsx"

# After T015 and T018 are done:
Task T016: "Write E2E tests in frontend/tests/e2e/auth.spec.ts"
Task T020: "Create logout-button and wire into dashboard layout"
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks everything)
3. Complete Phase 3: US1 — auth works, dashboard accessible
4. Complete Phase 4: US2 — forms can be created, URLs obtained
5. Complete Phase 5: US3 — submission endpoint live, redirect logic working
6. **STOP and VALIDATE**: run `npm run test:contract` + `npm run test:e2e`, test manually with `curl`
7. Deploy/demo: platform is usable as a form endpoint SaaS at this point

### Incremental Delivery

1. Foundation → US1 → MVP auth ✓
2. + US2 → Forms can be created ✓
3. + US3 → Submissions accepted and redirected ✓ (deployable)
4. + US4 → Submissions visible in dashboard ✓
5. + US5 → Telegram notifications ✓

### Notes

- `[P]` tasks = different files, no blocking dependencies between them
- `[Story]` label maps each task to its user story for traceability
- Contract tests use `maxRedirects: 0` to intercept 302s before following
- All PocketBase JS hook code is **synchronous** — no async/await permitted (goja limitation)
- `$os.getenv("TELEGRAM_BOT_TOKEN")` reads from the shell environment where PocketBase is started
- The `data` field in submissions stores the raw POST body as a JSON object — all values as strings, no schema enforced, `_next` always stripped before storage
