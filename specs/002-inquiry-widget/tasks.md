# Tasks: B2B Inquiry Widget

**Input**: Design documents from `/specs/002-inquiry-widget/`
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

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize widget project and create PocketBase collection schemas

- [x] T001 Initialize widget/ project with package.json (preact, esbuild devDeps), tsconfig.json (JSX for preact), and esbuild build script in widget/build.mjs per research.md R4
- [x] T002 [P] Create widgets collection migration in backend/pb_migrations/3_create_widgets.js with fields: name (text, required, 1-100), user (relation → users, cascadeDelete), button_text (text, max 30), greeting (text, max 500), questions (json, required), telegram_chat_id (text), active (bool, default true). Access rules per data-model.md
- [x] T003 [P] Create inquiries collection migration in backend/pb_migrations/4_create_inquiries.js with fields: widget (relation → widgets, cascadeDelete), responses (json, required), page_url (url), visitor_ip (text, max 45), country (text, max 2). Access rules: list/view = `@request.auth.id = widget.user`, create/update = disabled, delete = owner only per data-model.md
- [x] T004 [P] Create visitor_records collection migration in backend/pb_migrations/5_create_visitor_records.js with fields: widget (relation → widgets, cascadeDelete), page_url (url, required), visitor_ip (text, max 45), country (text, max 2). Access rules: list/view = `@request.auth.id = widget.user`, create/update/delete = disabled per data-model.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Public widget API endpoints that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Add GET /api/widget/{widgetId} public endpoint in backend/pb_hooks/main.pb.js — returns only id, button_text, greeting, questions for active widgets; returns 404 for inactive/missing; CORS is handled automatically by PocketBase's built-in middleware per contracts/widget-api.md
- [x] T006 Add POST /api/widget/{widgetId}/submit endpoint in backend/pb_hooks/main.pb.js — validates responses array (non-empty, each has question_id/question_label/answer), extracts visitor IP from request headers (X-Forwarded-For, X-Real-IP, CF-Connecting-IP), derives country from CF-IPCountry header or fallback $http.send() to ip-api.com, creates inquiry record per contracts/widget-api.md
- [x] T007 [P] Write contract tests for GET /api/widget/{widgetId} in frontend/tests/contract/widget-api.spec.ts — test: active widget returns config (200), inactive widget returns 404, non-existent widget returns 404, response excludes internal fields (user, telegram_chat_id)
- [x] T008 [P] Write contract tests for POST /api/widget/{widgetId}/submit in frontend/tests/contract/widget-api.spec.ts — test: valid submission returns 200 with id, empty responses returns 400, missing fields returns 400, non-existent widget returns 404, inquiry record created with correct metadata

**Checkpoint**: Public widget API ready — widget embed and dashboard features can now begin

---

## Phase 3: User Story 1 - Create Widget and Configure Questions (Priority: P1) 🎯 MVP

**Goal**: Users create a widget, configure questions, get embed code. Visitors see conversational form on embedded pages, complete questions step-by-step, and submit inquiries.

**Independent Test**: Register → create widget → customize questions → copy embed code → paste into test HTML → floating button appears → click → conversational form with configured questions → complete all fields → submit → inquiry saved in PocketBase

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
>
> API contract tests and E2E tests are MANDATORY (constitution Principles II & III).

- [x] T009 [P] [US1] Write contract tests for widget CRUD in frontend/tests/contract/widget-crud.spec.ts — test: create widget with default questions (201), list widgets returns only owner's (200), update widget questions (200), delete widget cascades inquiries (200), unauthenticated access denied (401/403)
- [x] T010 [P] [US1] Write E2E test for widget creation and question configuration in frontend/tests/e2e/widget-setup.spec.ts — test: login → navigate to dashboard → create widget → verify default questions → edit questions (add/remove/reorder) → save → verify embed code displayed
- [x] T011 [P] [US1] Write E2E test for widget embed and conversational form in frontend/tests/e2e/widget-embed.spec.ts — test: load test page with embed code → floating button visible → click → chat window opens with greeting → answer each question type (text, email, single-select) → go back and edit → submit → confirmation shown

### Implementation for User Story 1

#### Dashboard: Widget Management

- [x] T012 [P] [US1] Create widget-card.tsx component in frontend/src/components/widget-card.tsx — displays widget name, active status badge, inquiry count, embed code copy button; includes rename and delete actions with confirmation dialogs (follow existing form-card.tsx pattern)
- [x] T013 [P] [US1] Create embed-code-snippet.tsx component in frontend/src/components/embed-code-snippet.tsx — generates and displays the embed `<script>` snippet per quickstart.md format with widgetId and apiBase substituted; includes copy-to-clipboard button
- [x] T014 [P] [US1] Create question-editor.tsx component in frontend/src/components/question-editor.tsx — ordered list of questions with drag-to-reorder (or up/down buttons); each question editable: label (text input), type (select: text/email/single-select), required (checkbox), options (shown only for single-select, add/remove option items); add question button; minimum 1 question enforced (FR-019)
- [x] T015 [US1] Extend dashboard page to show widgets section in frontend/src/app/(dashboard)/dashboard/page.tsx — add "Widgets" section below existing forms; list user's widgets via PocketBase getList; "New Widget" button creates widget with default questions per data-model.md default template; display widget-card for each
- [x] T016 [US1] Create widget settings page in frontend/src/app/(dashboard)/widgets/[widgetId]/settings/page.tsx — widget name editor, question-editor component, embed-code-snippet component, button_text and greeting configuration, active toggle; save updates via PocketBase PATCH; follow existing settings/page.tsx patterns
- [x] T017 [P] [US1] Create loading skeleton in frontend/src/app/(dashboard)/widgets/[widgetId]/loading.tsx — skeleton layout matching the widget detail page structure (follow existing loading.tsx pattern)

#### Widget: Embeddable Preact App

- [x] T018 [P] [US1] Create widget API client in widget/src/lib/api.ts — fetchWidgetConfig(widgetId): GET /api/widget/{widgetId}; submitInquiry(widgetId, responses, pageUrl): POST /api/widget/{widgetId}/submit; uses fetch() with JSON headers; handles errors and returns typed responses
- [x] T019 [P] [US1] Create widget styles in widget/src/styles/widget.css — all CSS for floating button (fixed bottom-right, circular, 56px, shadow, z-index 9999), chat window (fixed bottom-right, 380px wide, 520px tall, border-radius, shadow, flex column), message bubbles (system vs visitor), input fields, select buttons, responsive (full-width on mobile <480px); all class names prefixed with `fh-` to avoid any leakage
- [x] T020 [P] [US1] Create ChatBubble.tsx component in widget/src/components/ChatBubble.tsx — circular floating button at bottom-right; displays configurable button_text; onClick toggles chat window open/close; includes open/close animation; accessible (aria-label, role="button")
- [x] T021 [P] [US1] Create QuestionStep.tsx component in widget/src/components/QuestionStep.tsx — renders one question based on type: text → text input, email → email input with validation, single-select → button group via SelectOptions; shows question label; handles required/optional; submit answer on Enter or button click
- [x] T022 [P] [US1] Create SelectOptions.tsx component in widget/src/components/SelectOptions.tsx — renders array of option buttons for single-select questions; highlights selected option; calls onSelect callback with chosen value
- [x] T023 [US1] Create ChatWindow.tsx component in widget/src/components/ChatWindow.tsx — header with title + close button; scrollable message area showing conversation flow (system questions as left-aligned bubbles, visitor answers as right-aligned bubbles); current question input at bottom; back button for navigation (FR-004); progress indicator (e.g., "3/6"); final submit button after all questions answered; confirmation message after submission; loading/error states
- [x] T024 [US1] Create App.tsx root component in widget/src/App.tsx — manages state: closed/open/loading/conversation/submitted; on mount fetches widget config via api.ts; passes config to ChatBubble and ChatWindow; manages question flow (current step, answers array, back navigation); handles submit by calling api.submitInquiry
- [x] T025 [US1] Create entry point with Shadow DOM mounting in widget/src/index.ts — reads window.FormHandler.widgetId and apiBase; creates host div; attaches closed Shadow DOM; injects widget.css as <style>; mounts Preact App into shadow root; waits for DOMContentLoaded if document still loading; per research.md R3

**Checkpoint**: User Story 1 complete — widget is fully functional: create, configure, embed, collect inquiries

---

## Phase 4: User Story 2 - Receive Telegram Notifications (Priority: P2)

**Goal**: When a visitor submits an inquiry, the widget owner's configured Telegram chat receives a structured notification immediately.

**Independent Test**: Configure Telegram chat ID in settings → submit inquiry via widget → verify formatted message appears in Telegram chat within 30 seconds

### Tests for User Story 2

- [x] T026 [P] [US2] Write contract test for Telegram notification in frontend/tests/contract/widget-api.spec.ts — test: submit inquiry with Telegram configured → inquiry saved (200); submit with invalid chat ID → inquiry still saved (200, Telegram failure doesn't block); submit without Telegram configured → inquiry saved, no Telegram attempt; POST /api/widget/{widgetId}/telegram-test returns 200 when chat_id valid (authenticated), returns 401 when unauthenticated, returns 403 when not widget owner

### Implementation for User Story 2

- [x] T027 [US2] Add Telegram notification hook and test endpoint in backend/pb_hooks/main.pb.js — (1) onRecordAfterCreateSuccess for inquiries collection: loads parent widget to get telegram_chat_id and name; reads TELEGRAM_BOT_TOKEN from env; formats message per contracts/telegram-notification.md; sends via $http.send() with 15s timeout; failures logged but never propagated (FR-010). (2) POST /api/widget/{widgetId}/telegram-test endpoint (authenticated, owner only): sends a test message "Connection test from FormHandler" to the widget's telegram_chat_id; returns 200 on success or 400 with error details on failure
- [x] T028 [US2] Add Telegram chat ID configuration and test-message button to widget settings page in frontend/src/app/(dashboard)/widgets/[widgetId]/settings/page.tsx — input field for chat ID; save via PocketBase PATCH; "Test Connection" button calls POST /api/widget/{widgetId}/telegram-test; shows loading/success/error feedback; include TelegramSetupInstructions component (reuse existing)

**Checkpoint**: Telegram notifications working — sales teams notified in real-time for each inquiry

---

## Phase 5: User Story 3 - View and Manage Inquiries in Dashboard (Priority: P3)

**Goal**: Users view all collected inquiries in a list, see full details of each, and filter by country or date.

**Independent Test**: Submit several inquiries with different countries → login to dashboard → navigate to widget → see inquiries list → click one → see full Q&A pairs and metadata → filter by country → results narrow correctly

### Tests for User Story 3

- [x] T029 [P] [US3] Write contract tests for inquiries API in frontend/tests/contract/widget-crud.spec.ts — test: list inquiries returns only widget owner's (200), list with filter by country (200), list with filter by date range (200), view single inquiry detail (200), delete inquiry (200), unauthenticated access denied
- [x] T030 [P] [US3] Write E2E test for inquiry management in frontend/tests/e2e/widget-setup.spec.ts — test: login → navigate to widget → inquiries list shows submitted inquiries in reverse chronological order → click inquiry → detail view shows all Q&A pairs and metadata → filter by country → results update

### Implementation for User Story 3

- [x] T031 [P] [US3] Create inquiry-item.tsx component in frontend/src/components/inquiry-item.tsx — displays question-answer pairs from responses JSON as definition list; shows metadata (country flag/code, visitor IP, page URL, timestamp); expandable/collapsible detail view; delete button with confirmation
- [x] T032 [US3] Create inquiries list page in frontend/src/app/(dashboard)/widgets/[widgetId]/page.tsx — loads widget details + paginated inquiries (20 per page); filter bar with country select and date range inputs; search by keyword; displays inquiry-item components; pagination controls; empty state when no inquiries; link to settings page

**Checkpoint**: Full inquiry management — users can browse, inspect, filter, and delete inquiries

---

## Phase 6: User Story 4 - Track Basic Visitor Activity (Priority: P4)

**Goal**: The embed code records page visits (URL, time, IP, country). Dashboard shows visitor activity log with summary statistics.

**Independent Test**: Embed widget on test page → visit page multiple times → login to dashboard → see visit records with page URL, time, IP, country → see summary stats (total visits, unique visitors, top countries)

### Tests for User Story 4

- [x] T033 [P] [US4] Write contract test for POST /api/widget/{widgetId}/visit in frontend/tests/contract/widget-api.spec.ts — test: valid visit recorded (200), non-existent widget returns 404, inactive widget returns 404, visitor_record created with IP and country metadata
- [x] T034 [P] [US4] Write contract test for GET /api/widget/{widgetId}/stats in frontend/tests/contract/widget-api.spec.ts — test: returns total_visits, unique_visitors, total_inquiries, top_countries; requires authentication; only widget owner can access

### Implementation for User Story 4

- [x] T035 [US4] Add POST /api/widget/{widgetId}/visit endpoint in backend/pb_hooks/main.pb.js — validates widget exists and is active; extracts visitor IP and country (same approach as submit endpoint); creates visitor_record; include CORS headers; per contracts/widget-api.md
- [x] T036 [US4] Add GET /api/widget/{widgetId}/stats endpoint in backend/pb_hooks/main.pb.js — requires authentication, validates widget ownership; queries visitor_records and inquiries for widget; computes total_visits, unique_visitors (distinct IPs), total_inquiries, top_countries (aggregated counts); returns JSON per contracts/dashboard-api.md
- [x] T037 [US4] Add visit tracking call to widget in widget/src/lib/api.ts and widget/src/index.ts — on widget load (after config fetch), fire POST /api/widget/{widgetId}/visit with current page URL; fire-and-forget (do not await response, do not block widget rendering)
- [x] T038 [P] [US4] Create visitor-activity.tsx component in frontend/src/components/visitor-activity.tsx — summary stats cards (total visits, unique visitors, total inquiries); top countries list; chronological visit log table (page URL, time, IP, country) with pagination
- [x] T039 [US4] Add visitor activity section to widget detail page in frontend/src/app/(dashboard)/widgets/[widgetId]/page.tsx — add tabbed or sectioned view: "Inquiries" (existing from T032) and "Visitor Activity" (visitor-activity component); fetch stats on load; fetch visitor_records with pagination

**Checkpoint**: Complete visitor analytics — users see traffic overview alongside inquiry data

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality improvements affecting multiple user stories

- [x] T040 Verify widget works across Chrome, Firefox, Safari, and Edge on desktop and mobile — test Shadow DOM rendering, floating button positioning, chat window responsiveness, input interactions on touch devices (FR-017)
- [x] T041 Optimize widget bundle size — verify <30KB gzipped output; audit dependencies; remove unused Preact features if possible; check esbuild tree-shaking (SC-006)
- [x] T042 Add NEXT_PUBLIC_WIDGET_URL environment variable to frontend/.env.local and update embed-code-snippet.tsx to use it for the widget.js URL per quickstart.md
- [x] T043 Run full quickstart.md validation end-to-end — fresh setup, all migrations, widget build, embed test, inquiry submission, Telegram notification, dashboard verification

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (migrations must exist before endpoints) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 — core MVP
- **User Story 2 (Phase 4)**: Depends on Phase 2 — can run parallel with US1 (backend hook is independent), but Telegram config UI extends US1 settings page
- **User Story 3 (Phase 5)**: Depends on Phase 2 — inquiry data created by US1, but dashboard pages are independent
- **User Story 4 (Phase 6)**: Depends on Phase 2 — visit endpoint independent, but widget integration extends US1 entry point
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: After Phase 2 — no dependencies on other stories
- **User Story 2 (P2)**: After Phase 2 — Telegram hook is backend-only; settings UI extends US1's settings page (T016), so implement after T016
- **User Story 3 (P3)**: After Phase 2 — inquiry list page is independent from widget embed; needs inquiries to exist (from US1 submissions) for meaningful testing
- **User Story 4 (P4)**: After Phase 2 — visit endpoint is independent; widget visit tracking (T037) extends US1 entry point (T025); dashboard section (T039) extends US3 page (T032)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models/migrations before services/endpoints
- Backend before frontend (endpoints must exist for UI to call)
- Components before pages (pages compose components)
- Core implementation before integration

### Parallel Opportunities

- T002, T003, T004 can run in parallel (different migration files)
- T007, T008 can run in parallel with T005, T006 (test files vs hook file)
- T009, T010, T011 can run in parallel (different test files)
- T012, T013, T014 can run in parallel (different component files)
- T018, T019, T020, T021, T022 can run in parallel (different widget files)
- T026, T029, T030, T033, T034 are test files that can run in parallel with their respective implementations

---

## Parallel Example: User Story 1

```bash
# Launch all US1 tests in parallel (write first, should FAIL):
Task T009: "Contract test for widget CRUD in frontend/tests/contract/widget-crud.spec.ts"
Task T010: "E2E test for widget setup in frontend/tests/e2e/widget-setup.spec.ts"
Task T011: "E2E test for widget embed in frontend/tests/e2e/widget-embed.spec.ts"

# Launch all US1 dashboard components in parallel:
Task T012: "widget-card.tsx in frontend/src/components/widget-card.tsx"
Task T013: "embed-code-snippet.tsx in frontend/src/components/embed-code-snippet.tsx"
Task T014: "question-editor.tsx in frontend/src/components/question-editor.tsx"

# Launch all US1 widget components in parallel:
Task T018: "api.ts in widget/src/lib/api.ts"
Task T019: "widget.css in widget/src/styles/widget.css"
Task T020: "ChatBubble.tsx in widget/src/components/ChatBubble.tsx"
Task T021: "QuestionStep.tsx in widget/src/components/QuestionStep.tsx"
Task T022: "SelectOptions.tsx in widget/src/components/SelectOptions.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T008)
3. Complete Phase 3: User Story 1 (T009-T025)
4. **STOP and VALIDATE**: Test US1 independently — create widget, configure questions, embed on test page, submit inquiry, verify saved
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Backend API ready
2. Add User Story 1 → Test independently → Deploy/Demo (**MVP!**)
3. Add User Story 2 → Test independently → Telegram notifications live
4. Add User Story 3 → Test independently → Full inquiry management
5. Add User Story 4 → Test independently → Visitor analytics
6. Polish → Cross-browser verified, bundle optimized

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 dashboard (T012-T017)
   - Developer B: User Story 1 widget (T018-T025)
3. After US1:
   - Developer A: User Story 2 (T026-T028) + User Story 3 (T029-T032)
   - Developer B: User Story 4 (T033-T039)
4. Polish together (T040-T043)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- PocketBase JSVM hooks are synchronous-only (no async/await) — use $http.send() for external calls
- Widget targets ES2015 for broadest browser compatibility
- Shadow DOM (closed mode) for CSS isolation — all styles injected via <style> element
