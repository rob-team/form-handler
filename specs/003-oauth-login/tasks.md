# Tasks: OAuth Login (Google & GitHub)

**Input**: Design documents from `/specs/003-oauth-login/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: API contract tests and E2E tests are MANDATORY per the project constitution
(Principles II and III). API contract tests MUST be written before or alongside
endpoint implementation. E2E tests MUST be included for every P1 user story.
Unit tests are OPTIONAL — include only if explicitly requested in the feature spec.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/` (PocketBase), `frontend/src/` (Next.js)
- Tests in `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database migration and shared utilities needed for OAuth

- [x] T001 Create PocketBase migration to add `name` (text) and `avatar` (file) fields to the users collection in `backend/pb_migrations/6_add_user_profile_fields.js`. Follow existing migration patterns (see `backend/pb_migrations/1_create_forms.js`). Only add fields if they don't already exist.
- [x] T002 [P] Document PocketBase Admin UI OAuth2 provider configuration steps (Google + GitHub client ID/secret, redirect URI `{PB_URL}/api/oauth2-redirect`, optional field mappings for name and avatar) in `specs/003-oauth-login/quickstart.md` — already done during planning, verify quickstart.md is accurate and complete.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core OAuth component that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create the `OAuthButtons` Client Component in `frontend/src/components/oauth-buttons.tsx`. This component: (1) calls `pb.collection('users').listAuthMethods()` on mount to discover enabled OAuth2 providers, (2) renders a branded button for each provider (Google icon + "Sign in with Google", GitHub icon + "Sign in with GitHub"), (3) on click calls `pb.collection('users').authWithOAuth2({ provider })` which opens a popup, (4) on success navigates to the `redirect` query parameter or `/dashboard`, (5) handles errors (user cancelled, provider unavailable, account conflict) by displaying an Alert with a user-friendly message. Use existing shadcn/ui `Button` and `Alert` components. The `authWithOAuth2()` call MUST be directly in the click handler (not wrapped in async callback) to avoid popup blockers. Include loading state per button. Import `getPocketBase` from `@/lib/pocketbase-browser`. Use `useSearchParams()` to read `redirect` query param.

**Checkpoint**: Foundation ready — the OAuthButtons component can be imported into any page

---

## Phase 3: User Story 1 — Sign In with Google (Priority: P1) MVP

**Goal**: Users can sign in to the dashboard using their Google account. New users are auto-created; existing users (same email) are auto-linked.

**Independent Test**: Click "Sign in with Google" on login page → complete Google consent → land on dashboard authenticated with profile info.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
>
> API contract tests and E2E tests are MANDATORY (constitution Principles II & III).

- [x] T004 [P] [US1] Write API contract tests for the auth-methods endpoint in `frontend/tests/contract/oauth-api.spec.ts`. Tests CT-OA-001 and CT-OA-002: (1) `GET /api/collections/users/auth-methods` returns 200 with `oauth2.providers` array containing a provider with `name: "google"`, (2) response includes `password.enabled: true`. Use Playwright `request` fixture. Follow pattern from `frontend/tests/contract/widget-api.spec.ts`. PocketBase URL: `http://127.0.0.1:8090`.
- [x] T005 [P] [US1] Write E2E test for OAuth sign-in flow in `frontend/tests/e2e/oauth.spec.ts`. Since real OAuth providers cannot be tested in CI without credentials, write the test to: (1) navigate to `/login`, (2) verify "Sign in with Google" button is visible, (3) verify "Sign in with GitHub" button is visible, (4) verify clicking a provider button attempts to open a popup (test that the SDK method is called). Also test the error state: mock a failed OAuth by verifying the error alert is displayed when `authWithOAuth2` rejects. Follow pattern from `frontend/tests/e2e/auth.spec.ts`.

### Implementation for User Story 1

- [x] T006 [US1] Modify the login page in `frontend/src/app/(auth)/login/page.tsx` to integrate OAuth sign-in. Changes: (1) import and render the `OAuthButtons` component between the email/password form and the "Forgot password?" link, (2) add a visual separator ("or" divider using a horizontal rule with centered text) between the OAuth buttons and the email/password form, (3) add `redirect` query parameter support — read `searchParams.get('redirect')` and pass it as a prop to `OAuthButtons`, (4) wrap the page in a `Suspense` boundary for `useSearchParams()` (see pattern in `frontend/src/app/auto-login/page.tsx`). Keep all existing email/password login functionality unchanged.
- [x] T007 [US1] Update the dashboard auth guard in `frontend/src/app/(dashboard)/layout.tsx` to pass the current path as a `redirect` query parameter when redirecting to `/login`. Change `redirect("/login")` to `redirect("/login?redirect=" + encodeURIComponent(currentPath))` where `currentPath` comes from Next.js `headers()` (the `x-pathname` header or similar). This ensures users land on their originally requested page after OAuth sign-in (FR-012). If getting the current path reliably is complex, use `/dashboard` as the default redirect — keep it simple per Principle V.
- [x] T008 [US1] Handle profile data on first OAuth sign-in. In the `OAuthButtons` component (created in T003), after `authWithOAuth2()` resolves successfully, check `authData.meta?.isNew`. If true and the user record doesn't already have a `name`, call `pb.collection('users').update(authData.record.id, { name: authData.meta.name })` to set the display name. Avatar should be handled by PocketBase Admin UI field mappings (no client code needed). This is a fallback for when Admin UI field mappings are not configured.

**Checkpoint**: At this point, Google sign-in should be fully functional. A user can click "Sign in with Google" on the login page, complete the consent flow, and land on the dashboard authenticated.

---

## Phase 4: User Story 2 — Sign In with GitHub (Priority: P2)

**Goal**: Users can sign in using their GitHub account. Works identically to Google sign-in.

**Independent Test**: Click "Sign in with GitHub" on login page → complete GitHub authorization → land on dashboard authenticated.

### Tests for User Story 2

> API contract tests and E2E tests are MANDATORY (constitution Principles II & III).

- [x] T009 [P] [US2] Extend API contract tests in `frontend/tests/contract/oauth-api.spec.ts` to verify GitHub provider. Add test CT-OA-001b: `GET /api/collections/users/auth-methods` returns `oauth2.providers` array containing a provider with `name: "github"`. This verifies GitHub is configured alongside Google.

### Implementation for User Story 2

- [x] T010 [US2] No additional code changes needed for GitHub sign-in — the `OAuthButtons` component (T003) already dynamically discovers all enabled providers via `listAuthMethods()` and renders buttons for each. The popup OAuth flow works identically for GitHub. **Verify**: ensure the GitHub icon/branding is correct in the `OAuthButtons` component. Use a GitHub SVG icon (either from a package like `lucide-react` or an inline SVG). Google should also have its branded icon. If T003 used generic icons, update to provider-specific branded icons now.

**Checkpoint**: Both Google and GitHub sign-in should work. Login page shows both buttons. Each provider triggers the popup flow independently.

---

## Phase 5: User Story 3 — Account Linking & Provider Management (Priority: P3)

**Goal**: Authenticated users can view, connect, and disconnect OAuth providers from their account settings page.

**Independent Test**: Sign in → go to settings → see linked providers → connect a new provider → disconnect a provider → verify the last provider cannot be disconnected.

### Tests for User Story 3

> API contract tests and E2E tests are MANDATORY (constitution Principles II & III).

- [x] T011 [P] [US3] Extend API contract tests in `frontend/tests/contract/oauth-api.spec.ts` for external auths endpoints. Add tests CT-OA-003 through CT-OA-008: (1) CT-OA-003: authenticated user `GET /api/collections/users/records/{userId}/external-auths` returns 200 with array, (2) CT-OA-004: unauthenticated request returns 401, (3) CT-OA-005: user with no OAuth providers returns 200 with empty array, (4) CT-OA-006: authenticated user `DELETE /api/collections/users/records/{userId}/external-auths/{provider}` returns 204, (5) CT-OA-007: unlink non-existent provider returns 404, (6) CT-OA-008: unauthenticated unlink returns 401. Create test users via PocketBase API. Note: CT-OA-006 requires a user with a linked OAuth provider — this may need to be created via PocketBase admin API or skipped if OAuth providers aren't configured in CI.
- [x] T012 [P] [US3] Write E2E test for account settings page in `frontend/tests/e2e/oauth.spec.ts`. Test: (1) authenticated user navigates to `/settings`, (2) page shows "Connected Accounts" section, (3) for a user without OAuth, shows "No providers connected" and "Connect" buttons, (4) "Disconnect" button is disabled when it's the only auth method. Since real OAuth linking can't be tested in CI, focus on verifying the UI renders correctly.

### Implementation for User Story 3

- [x] T013 [US3] Create the `LinkedProviders` Client Component in `frontend/src/components/linked-providers.tsx`. This component: (1) takes the current user ID as a prop, (2) calls `pb.collection('users').listExternalAuths(userId)` on mount to fetch linked providers, (3) calls `pb.collection('users').listAuthMethods()` to get the full list of available providers, (4) renders each linked provider with provider name, "Connected" badge, and a "Disconnect" button, (5) renders each unlinked-but-available provider with a "Connect" button, (6) "Connect" calls `pb.collection('users').authWithOAuth2({ provider })` (works while authenticated — links to current account), (7) "Disconnect" calls `pb.collection('users').unlinkExternalAuth(userId, provider)`, (8) prevents disconnecting the last auth method — disable "Disconnect" when the user has only one linked provider AND no password set (check via auth methods), (9) shows loading and error states. Use shadcn/ui `Card`, `Button`, `Badge` components.
- [x] T014 [US3] Create account settings page at `frontend/src/app/(dashboard)/settings/page.tsx`. This page: (1) is a Server Component that reads the current user from `getServerPocketBase()`, (2) passes the user ID to the `LinkedProviders` Client Component, (3) displays a heading "Account Settings", (4) includes a "Connected Accounts" section with the `LinkedProviders` component, (5) optionally includes the user's email and name as read-only info. Use existing dashboard layout (auth guard in `(dashboard)/layout.tsx` protects this page automatically).
- [x] T015 [US3] Replace the `LogoutButton` in the dashboard nav with a `UserAvatarMenu` component. This task has 4 sub-steps:
  1. Install shadcn/ui `avatar` component: run `npx shadcn@latest add avatar` in `frontend/` to create `frontend/src/components/ui/avatar.tsx` (`Avatar`, `AvatarImage`, `AvatarFallback`).
  2. Create `UserAvatarMenu` Client Component in `frontend/src/components/user-avatar-menu.tsx`. Props: `{ email: string; name?: string; avatar?: string }`. Renders an `Avatar` (shows `AvatarImage` if avatar URL provided, else `AvatarFallback` with initials from name or first letter of email) as the `DropdownMenuTrigger`. `DropdownMenuContent` contains: (a) `DropdownMenuLabel` showing user name (or email if no name), (b) `DropdownMenuSeparator`, (c) `DropdownMenuItem` with `Settings` icon linking to `/settings`, (d) `DropdownMenuSeparator`, (e) `DropdownMenuItem` with `LogOut` icon that calls `getPocketBase().authStore.clear()` then `window.location.href = "/login"` (reuse logout logic from `logout-button.tsx`). Use existing `DropdownMenu*` from `@/components/ui/dropdown-menu`, `Avatar*` from `@/components/ui/avatar`, icons from `lucide-react` (`LogOut`, `Settings`).
  3. Update `frontend/src/app/(dashboard)/layout.tsx`: extract user data from `pb.authStore.record` (email, name, avatar), build avatar file URL as `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/users/${record.id}/${record.avatar}` if avatar exists, pass as props to `<UserAvatarMenu>`, replacing `<LogoutButton />`.
  4. Delete `frontend/src/components/logout-button.tsx` (logic moved into `UserAvatarMenu`).
  5. Update E2E test in `frontend/tests/e2e/auth.spec.ts:88` — the logout test currently uses `page.getByRole("button", { name: /log ?out|sign ?out/i })`. Change to: first click the avatar trigger, then click `page.getByRole("menuitem", { name: /log ?out/i })`.

**Checkpoint**: Users can manage their OAuth providers from account settings. They can connect additional providers and disconnect existing ones (with safeguard against removing the last method).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: UX consistency, edge case handling, and final quality checks

- [x] T016 [P] Ensure all interactive states are handled in `OAuthButtons` and `LinkedProviders` components: (1) loading state — show spinner/disabled button while OAuth popup is open, (2) success state — brief success indicator before redirect, (3) error state — display user-friendly error messages in Alert (cancelled, provider unavailable, account conflict), (4) empty state — if no OAuth providers are configured in PocketBase Admin UI, hide the OAuth section entirely on the login page (don't show an empty area).
- [x] T017 [P] Verify UX consistency: (1) OAuth buttons use consistent styling with existing shadcn/ui buttons, (2) provider icons are clearly recognizable (Google "G" logo, GitHub octocat), (3) button text matches spec terminology ("Sign in with Google", "Sign in with GitHub"), (4) error messages are actionable (explain what went wrong + what to do next), (5) the "or" separator between OAuth and email/password form is visually clean.
- [x] T018 Run `npm run lint` in `frontend/` and fix any TypeScript or ESLint errors across all new and modified files.
- [ ] T019 Run the full existing test suite (`npx playwright test` in `frontend/`) to verify no regressions in existing auth, form, and widget functionality.
- [ ] T020 Validate quickstart.md by following all steps in `specs/003-oauth-login/quickstart.md` end-to-end on a fresh setup and confirming the OAuth flow works as documented.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (migration must exist before OAuth component references user name/avatar)
- **User Story 1 (Phase 3)**: Depends on Phase 2 (OAuthButtons component must exist)
- **User Story 2 (Phase 4)**: Depends on Phase 2 (OAuthButtons component already handles GitHub dynamically)
- **User Story 3 (Phase 5)**: Depends on Phase 2 (uses same PocketBase SDK methods). Does NOT depend on US1 or US2 — can be implemented independently.
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (Phase 2). No dependencies on other stories.
- **User Story 2 (P2)**: Depends on Foundational (Phase 2). Shares `OAuthButtons` component with US1 but is independently testable.
- **User Story 3 (P3)**: Depends on Foundational (Phase 2). Entirely separate UI (`/settings` page). No dependencies on US1/US2.

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Implementation tasks within a story are sequential (each builds on the previous)
- Commit after each task or logical group

### Parallel Opportunities

- T001 and T002 can run in parallel (Phase 1)
- T004 and T005 can run in parallel (US1 tests)
- T006, T007, T008 are sequential (US1 implementation — all modify login flow)
- T009 can run in parallel with US1 implementation (different test file section)
- T011 and T012 can run in parallel (US3 tests — different files)
- T013, T014, T015 are sequential (US3 implementation — component → page → nav link)
- T016 and T017 can run in parallel (different focus areas)

---

## Parallel Example: User Story 1

```
# Tests can be written in parallel:
Task T004: "Contract test for auth-methods endpoint in frontend/tests/contract/oauth-api.spec.ts"
Task T005: "E2E test for OAuth buttons in frontend/tests/e2e/oauth.spec.ts"

# After tests, implementation is sequential:
Task T006: "Add OAuth buttons to login page in frontend/src/app/(auth)/login/page.tsx"
Task T007: "Add redirect param to auth guard in frontend/src/app/(dashboard)/layout.tsx"
Task T008: "Handle profile data on first sign-in in frontend/src/components/oauth-buttons.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (migration)
2. Complete Phase 2: Foundational (OAuthButtons component)
3. Complete Phase 3: User Story 1 (Google sign-in on login page)
4. **STOP and VALIDATE**: Test Google sign-in independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → OAuthButtons component ready
2. Add User Story 1 → Google sign-in works → Deploy (MVP!)
3. Add User Story 2 → GitHub sign-in works → Deploy (adds no code if T003 was thorough — just verify)
4. Add User Story 3 → Account settings page → Deploy (provider management)
5. Polish → UX consistency, error handling, tests green → Deploy (final)

### Key Simplicity Notes

- **Zero backend code**: All OAuth logic is PocketBase built-in. No hooks, no custom endpoints.
- **US2 is nearly free**: The OAuthButtons component dynamically discovers providers. If Google works, GitHub works too (just needs provider config in Admin UI + branded icon).
- **US3 is isolated**: Account settings is a separate page with no impact on login flow.
- **Total new files**: 4 (oauth-buttons.tsx, linked-providers.tsx, settings/page.tsx, oauth-api.spec.ts) + 1 modified (login/page.tsx) + 1 migration

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- PocketBase OAuth2 providers must be configured in Admin UI before testing — this is a manual step documented in quickstart.md
- Real OAuth providers (Google/GitHub) cannot be tested in CI without credentials — E2E tests focus on UI rendering and error handling, not the full provider flow
