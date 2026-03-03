# Tasks: Service Documentation Pages

**Input**: Design documents from `/specs/005-service-docs/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No new API endpoints in this feature — API contract tests are N/A. E2E tests are MANDATORY for P1 user stories (constitution Principle III). Unit tests are not requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/` for source code, `frontend/public/` for static assets, `frontend/middleware.ts` for middleware

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend dictionary interface and JSON files with docs-related navigation strings

- [x] T001 Extend Dictionary interface with docs fields (`header.docs`, `header.formEndpointsDocs`, `header.inquiryWidgetDocs`, `services.form.docsLabel`, `services.widget.docsLabel`) in `frontend/src/lib/dictionaries.ts`
- [x] T002 [P] Add docs navigation keys to English dictionary in `frontend/src/dictionaries/en.json` (`header.docs: "Docs"`, `header.formEndpointsDocs: "Form Endpoints"`, `header.inquiryWidgetDocs: "Inquiry Widget"`, `services.form.docsLabel: "View Docs"`, `services.widget.docsLabel: "View Docs"`)
- [x] T003 [P] Add docs navigation keys to Chinese dictionary in `frontend/src/dictionaries/zh.json` (`header.docs: "文档"`, `header.formEndpointsDocs: "表单接收端点"`, `header.inquiryWidgetDocs: "询盘聊天组件"`, `services.form.docsLabel: "查看文档"`, `services.widget.docsLabel: "查看文档"`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Auth redirect fix, middleware update, shared CodeBlock component, and docs layout that all doc pages depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create CodeBlock client component with copy-to-clipboard button (`navigator.clipboard.writeText`), `<pre><code>` block, checkmark feedback on success, and fallback behavior on clipboard API failure (select text for manual copy) in `frontend/src/components/docs/code-block.tsx`
- [x] T005 [P] Update middleware matcher from `["/", "/en", "/zh"]` to `["/", "/en/:path*", "/zh/:path*"]` and update locale detection to use `pathname.startsWith("/en")` / `pathname.startsWith("/zh")` in `frontend/middleware.ts`
- [x] T006 [P] Move auth redirect (`if (pbAuth?.value) redirect("/dashboard")`) from `frontend/src/app/[locale]/layout.tsx` into `frontend/src/app/[locale]/page.tsx` so doc pages remain accessible to logged-in users (FR-012). The layout should only render JSON-LD and pass children through.
- [x] T007 Create shared docs layout that loads dictionary, renders `<LandingHeader>` and `<LandingFooter>`, wraps `{children}` in `frontend/src/app/[locale]/docs/layout.tsx`

**Checkpoint**: Foundation ready — doc page implementation can now begin

---

## Phase 3: User Story 1 — Form Endpoints Documentation (Priority: P1) MVP

**Goal**: Visitors can navigate to the Form Endpoints documentation page and learn how to set up, embed, and use the Form Submission service through a step-by-step quickstart guide and detailed reference sections, in both English and Chinese.

**Independent Test**: Navigate to `/en/docs/form-endpoints` and `/zh/docs/form-endpoints`, verify all sections render (quickstart steps, code examples, reference sections, screenshots), verify code blocks are copyable.

### Implementation for User Story 1

- [x] T008 [US1] Create Form Endpoints doc page with bilingual content (locale conditional), numbered quickstart steps (1. create form → 2. copy endpoint URL → 3. embed in HTML form → 4. receive submission), minimal code snippet (`<form action="..." method="post">` with `YOUR_FORM_ID` placeholder), reference sections (`_next` redirect field, viewing submissions, Telegram notification setup), and "Full Example" section with complete self-contained HTML page in `frontend/src/app/[locale]/docs/form-endpoints/page.tsx`
- [x] T009 [US1] Add `generateMetadata` with SEO metadata (title, description, canonical URL, hreflang alternates, Open Graph, Twitter Card) to Form Endpoints doc page in `frontend/src/app/[locale]/docs/form-endpoints/page.tsx`
- [x] T010 [P] [US1] Capture English dashboard screenshots for Form Endpoints docs (create-form.png, form-endpoint-url.png, form-submissions.png, telegram-setup.png) and save to `frontend/public/docs/screenshots/en/`
- [x] T011 [P] [US1] Capture Chinese dashboard screenshots for Form Endpoints docs (same files) and save to `frontend/public/docs/screenshots/zh/`
- [x] T012 [US1] Add screenshot `<Image>` references to Form Endpoints doc page quickstart steps and reference sections (locale-aware paths: `/docs/screenshots/${locale}/...`) in `frontend/src/app/[locale]/docs/form-endpoints/page.tsx`

### E2E Tests for User Story 1

- [x] T013 [US1] E2E test: Form Endpoints doc page loads at `/en/docs/form-endpoints` with quickstart steps, code examples, reference sections, and screenshots visible; verify same page loads at `/zh/docs/form-endpoints` with Chinese content in `frontend/e2e/docs-form-endpoints.spec.ts`

**Checkpoint**: Form Endpoints documentation is fully functional and testable independently

---

## Phase 4: User Story 2 — Inquiry Widget Documentation (Priority: P1)

**Goal**: Visitors can navigate to the Inquiry Widget documentation page and learn how to create, configure, embed, and use the chat widget through a step-by-step quickstart guide and detailed reference sections, in both English and Chinese.

**Independent Test**: Navigate to `/en/docs/inquiry-widget` and `/zh/docs/inquiry-widget`, verify all sections render (quickstart steps, code examples, reference sections, screenshots), verify code blocks are copyable.

> **Note**: US2 can be implemented in parallel with US1 — they are in different files with no dependencies between them.

### Implementation for User Story 2

- [x] T014 [P] [US2] Create Inquiry Widget doc page with bilingual content (locale conditional), numbered quickstart steps (1. create widget → 2. configure questions → 3. copy embed code → 4. paste on website → 5. receive inquiry), minimal code snippet (`<script>` tag with `YOUR_WIDGET_ID` placeholder), reference sections (question types: text/email/single-select, widget customization, viewing inquiries, Telegram notifications, visitor analytics), and "Full Example" section with complete self-contained HTML page in `frontend/src/app/[locale]/docs/inquiry-widget/page.tsx`
- [x] T015 [US2] Add `generateMetadata` with SEO metadata (title, description, canonical URL, hreflang alternates, Open Graph, Twitter Card) to Inquiry Widget doc page in `frontend/src/app/[locale]/docs/inquiry-widget/page.tsx`
- [x] T016 [P] [US2] Capture English dashboard screenshots for Inquiry Widget docs (create-widget.png, widget-questions.png, widget-embed-code.png, widget-inquiries.png, visitor-analytics.png) and save to `frontend/public/docs/screenshots/en/`
- [x] T017 [P] [US2] Capture Chinese dashboard screenshots for Inquiry Widget docs (same files) and save to `frontend/public/docs/screenshots/zh/`
- [x] T018 [US2] Add screenshot `<Image>` references to Inquiry Widget doc page quickstart steps and reference sections (locale-aware paths) in `frontend/src/app/[locale]/docs/inquiry-widget/page.tsx`

### E2E Tests for User Story 2

- [x] T019 [US2] E2E test: Inquiry Widget doc page loads at `/en/docs/inquiry-widget` with quickstart steps, code examples, reference sections, and screenshots visible; verify same page loads at `/zh/docs/inquiry-widget` with Chinese content in `frontend/e2e/docs-inquiry-widget.spec.ts`

**Checkpoint**: Inquiry Widget documentation is fully functional and testable independently

---

## Phase 5: User Story 3 — Landing Page Links to Documentation (Priority: P2)

**Goal**: The landing page header navigation includes a "Docs" dropdown menu linking to both documentation pages, and each service card shows a "View Docs" link. All documentation links preserve the current locale.

**Independent Test**: Visit the landing page at `/en` and `/zh`, verify "Docs" dropdown appears in header with both links, verify each service card has a "View Docs" link, verify all links navigate to the correct locale-matched documentation page.

### Implementation for User Story 3

- [x] T020 [US3] Convert LandingHeader to `"use client"` component, add "Docs" dropdown menu using shadcn/ui `DropdownMenu` (with `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`), change anchor links from `#services`/`#contact` to `/${locale}#services`/`/${locale}#contact`, add new optional props (`docsLabel`, `formEndpointsDocsLabel`, `inquiryWidgetDocsLabel`) in `frontend/src/components/landing/landing-header.tsx`
- [x] T021 [P] [US3] Add optional `docsText` and `docsHref` props to ServiceCard, render a secondary "View Docs" link next to the existing CTA when props are provided in `frontend/src/components/landing/service-card.tsx`
- [x] T022 [US3] Update landing page to pass docs dictionary strings to `<LandingHeader>` and pass `docsHref`/`docsText` to each `<ServiceCard>` in `frontend/src/app/[locale]/page.tsx`
- [x] T023 [US3] Update docs layout to pass docs dropdown props (`docsLabel`, `formEndpointsDocsLabel`, `inquiryWidgetDocsLabel`) to `<LandingHeader>` in `frontend/src/app/[locale]/docs/layout.tsx`

### E2E Tests for User Story 3

- [x] T024 [US3] E2E test: Landing page header "Docs" dropdown shows both links and navigates to correct doc pages; service card "View Docs" links navigate to correct doc pages; verify locale is preserved when navigating in `frontend/e2e/docs-landing-links.spec.ts`

**Checkpoint**: All user stories are complete — documentation pages are accessible from landing page navigation

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation, lint, and final quality checks

- [x] T025 Run lint validation (`cd frontend && npm run lint`) and fix any TypeScript or ESLint issues across all changed files
- [x] T026 Run quickstart.md validation steps: start dev server, verify all doc pages render at `/en/docs/form-endpoints`, `/en/docs/inquiry-widget`, `/zh/docs/form-endpoints`, `/zh/docs/inquiry-widget`, verify header dropdown, verify responsive layout on mobile viewport
- [x] T027 Verify SEO metadata for all doc pages: check `<title>`, `<meta description>`, canonical URLs, hreflang tags, Open Graph tags using browser dev tools or `view-source`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational phase completion
- **US2 (Phase 4)**: Depends on Foundational phase completion — can run in PARALLEL with US1
- **US3 (Phase 5)**: Depends on Foundational phase completion — can start after or in parallel with US1/US2
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories, can run in parallel with US1
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) — Integrates with doc pages from US1/US2 (links must have targets) but the header/card changes are independent file modifications

### Within Each User Story

1. Page content and structure first (T008/T014)
2. SEO metadata (T009/T015) — same file, sequential
3. Screenshots (T010-T011 / T016-T017) — parallel, different directories
4. Screenshot integration into page (T012/T018) — depends on screenshots and page
5. E2E tests (T013/T019) — after page is complete

### Parallel Opportunities

**Phase 1**: T002 and T003 are parallel (different JSON files)
**Phase 2**: T004, T005, and T006 are parallel (different files)
**Phase 3 + Phase 4**: Entire US1 and US2 can run in parallel (different page files)
**Phase 5**: T020 and T021 are parallel (different component files)
**Screenshots**: EN and ZH captures for same service are parallel (T010‖T011, T016‖T017)

---

## Parallel Example: User Story 1 + User Story 2

```text
# US1 and US2 can be worked on simultaneously:

# Developer A — US1 (Form Endpoints):
Task T008: Create form-endpoints page content
Task T009: Add SEO metadata
Task T010: Capture EN screenshots → T012: Add to page
Task T011: Capture ZH screenshots
Task T013: E2E test

# Developer B — US2 (Inquiry Widget):
Task T014: Create inquiry-widget page content
Task T015: Add SEO metadata
Task T016: Capture EN screenshots → T018: Add to page
Task T017: Capture ZH screenshots
Task T019: E2E test
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (dictionary extensions)
2. Complete Phase 2: Foundational (auth fix, middleware, CodeBlock, docs layout)
3. Complete Phase 3: User Story 1 (Form Endpoints doc page)
4. **STOP and VALIDATE**: Visit `/en/docs/form-endpoints` — page renders with all sections
5. Deploy/demo if ready — Form Endpoints documentation is live

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Form Endpoints docs) → Test independently → Deploy (MVP!)
3. Add US2 (Inquiry Widget docs) → Test independently → Deploy
4. Add US3 (Landing page integration) → Test independently → Deploy (full feature)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With two developers:
1. Both complete Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Form Endpoints doc)
   - Developer B: User Story 2 (Inquiry Widget doc)
3. Either developer: User Story 3 (landing page links)
4. Polish together

---

## Notes

- [P] tasks = different files, no dependencies between them
- [Story] label maps task to specific user story for traceability
- No API contract tests needed — this feature has no API endpoints
- E2E tests are included for all P1 stories (US1, US2) per constitution Principle III
- Screenshots require a running dashboard with example data — capture manually
- All doc page content is in JSX (not dictionary JSON) — code examples stay readable
- Header becomes `"use client"` in US3 due to DropdownMenu requiring client-side JS
- T006 fixes a critical bug: the existing `[locale]/layout.tsx` auth redirect would block logged-in users from accessing doc pages
