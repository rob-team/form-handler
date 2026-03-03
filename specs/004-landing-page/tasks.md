# Tasks: Landing Page

**Input**: Design documents from `/specs/004-landing-page/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: API contract tests and E2E tests are MANDATORY per the project constitution
(Principles II and III). API contract tests MUST be written before or alongside
endpoint implementation. E2E tests MUST be included for every P1 user story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/`, `frontend/middleware.ts`, `frontend/public/`
- **Backend**: `backend/pb_migrations/`
- **Tests**: `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure, dictionary system, and translation files needed by all user stories

- [x] T001 Create landing page directory structure: `frontend/src/components/landing/`, `frontend/src/dictionaries/`, `frontend/src/app/[locale]/`
- [x] T002 Create dictionary type definition and async loader in `frontend/src/lib/dictionaries.ts` — export `getDictionary(locale)` using dynamic `import()` for code splitting, define `Dictionary` type matching the JSON structure
- [x] T003 [P] Create English translation dictionary in `frontend/src/dictionaries/en.json` — include all sections: metadata (title, description), header (login, getStarted), hero (headline, subheadline, cta), services.form (title, description, benefits[3], cta), services.widget (title, description, benefits[3], cta), contact (title, namePlaceholder, emailPlaceholder, messagePlaceholder, submit, success, error), footer (copyright). Content must naturally describe the B2B lead-generation value proposition
- [x] T004 [P] Create Chinese translation dictionary in `frontend/src/dictionaries/zh.json` — same structure as en.json, naturally written Chinese (not literal translation). Content must convey the same value proposition and service benefits for Chinese-speaking B2B sellers

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Middleware routing, locale layout with SEO metadata, and root layout updates that MUST be complete before any landing page content can render

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create Next.js middleware in `frontend/middleware.ts` — matcher config for `['/', '/en', '/zh']`; for `/`: read `Accept-Language` header, redirect 302 to `/zh` if starts with `zh`, otherwise `/en`; for `/en` and `/zh`: check `pb_auth` cookie, redirect 302 to `/dashboard` if present; set `x-locale` response header for root layout
- [x] T006 Update root layout in `frontend/src/app/layout.tsx` — read `x-locale` from `headers()`, set `<html lang={locale || 'en'}>` dynamically instead of hardcoded `"en"`
- [x] T007 Update root page in `frontend/src/app/page.tsx` — remove the existing `redirect('/login')` call since middleware now handles `/` routing. Keep the file as a minimal fallback or remove entirely
- [x] T008 Create locale layout in `frontend/src/app/[locale]/layout.tsx` — implement `generateMetadata()` with localized title, description, canonical URL, `alternates.languages` for hreflang (`{'en': '/en', 'zh': '/zh'}`), Open Graph tags (title, description, url, type, locale), Twitter Card tags; add JSON-LD structured data (`SoftwareApplication` + `Organization` schemas) as `<script type="application/ld+json">`; export `generateStaticParams()` returning `[{locale:'en'},{locale:'zh'}]` with `dynamicParams = false`
- [x] T009 [P] Create robots.txt in `frontend/public/robots.txt` — allow all user agents including GPTBot and ClaudeBot with `User-agent: * Allow: /`

**Checkpoint**: Middleware routing works (/ redirects to /en or /zh, auth redirect to dashboard), SEO metadata renders in HTML head, locale layout ready

---

## Phase 3: User Story 1 — Visitor Understands the Product Value (Priority: P1) MVP

**Goal**: Visitor sees hero section with value proposition + two service description sections, all bilingual (EN/ZH), with clean minimal design

**Independent Test**: Navigate to `/en` and `/zh`, verify hero headline, two service sections with descriptions and benefits are visible

### Implementation for User Story 1

- [x] T010 [P] [US1] Create hero section component in `frontend/src/components/landing/hero.tsx` — server component accepting dictionary props; render centered hero with large headline, subheadline text, and prominent "Get Started" CTA button (shadcn Button, link to `/login`); use Tailwind for generous whitespace, large typography; responsive (full-width on mobile, max-width container on desktop)
- [x] T011 [P] [US1] Create reusable service card component in `frontend/src/components/landing/service-card.tsx` — server component accepting props: title, description, benefits (string array), ctaText, ctaHref, icon (React node or string); render card with icon, title, description paragraph, bulleted benefits list, and CTA link; use shadcn Card or plain semantic HTML with Tailwind; responsive (side-by-side on desktop, stacked on mobile)
- [x] T012 [P] [US1] Create landing footer component in `frontend/src/components/landing/landing-footer.tsx` — server component accepting dictionary props; minimal footer with copyright line centered; use Tailwind with muted text color
- [x] T013 [US1] Create landing page in `frontend/src/app/[locale]/page.tsx` — server component; load dictionary via `getDictionary(locale)`; compose page: Hero section → Services section (two service-cards in a grid: Form Endpoints + Inquiry Widget) → Footer; use semantic HTML (`<main>`, `<section>` with id anchors for scroll-to); ensure all content renders server-side (no client JS needed for primary content)

### Tests for User Story 1

- [x] T014 [US1] Write E2E test in `frontend/tests/e2e/landing-page.spec.ts` — test P1 scenarios: navigate to `/en`, verify hero headline visible, verify two service sections visible with titles and benefits; navigate to `/zh`, verify equivalent Chinese content visible; verify page loads without JS errors; verify semantic HTML structure (main, section elements)

**Checkpoint**: Landing page renders at `/en` and `/zh` with hero + service descriptions + footer. Content is bilingual. E2E tests pass.

---

## Phase 4: User Story 2 — Visitor Navigates to Sign Up or Log In (Priority: P2)

**Goal**: All CTA buttons navigate to login page; authenticated users visiting landing page are redirected to dashboard

**Independent Test**: Click "Get Started" and service CTAs → arrive at `/login`; log in → visit `/` → arrive at `/dashboard`

### Implementation for User Story 2

- [x] T015 [US2] Verify and adjust CTA links in `frontend/src/components/landing/hero.tsx` and `frontend/src/components/landing/service-card.tsx` — ensure all CTA buttons/links use Next.js `<Link href="/login">` (or `/register`); verify middleware auth redirect is working (already implemented in T005)

### Tests for User Story 2

- [x] T016 [US2] Add E2E tests to `frontend/tests/e2e/landing-page.spec.ts` — test P2 scenarios: click hero "Get Started" button → verify navigation to `/login`; click service section CTA → verify navigation to `/login`; simulate authenticated user (set pb_auth cookie) → navigate to `/` → verify redirect to `/dashboard`; simulate authenticated user → navigate to `/en` → verify redirect to `/dashboard`

**Checkpoint**: All CTA buttons navigate to login. Auth redirect works. E2E tests pass.

---

## Phase 5: User Story 3 — Page Header with Navigation (Priority: P3)

**Goal**: Landing page has a header/navbar with product name, section navigation links, language switcher, and login button

**Independent Test**: Verify header renders with logo, language switcher toggles between /en and /zh, section links scroll to correct sections, login button navigates to /login

### Implementation for User Story 3

- [x] T017 [P] [US3] Create language switcher component in `frontend/src/components/landing/language-switcher.tsx` — server component accepting current locale prop; render two links/buttons: "EN" and "中文" with active state styling; link to `/en` and `/zh` respectively; use subtle styling (muted color for inactive, bold for active)
- [x] T018 [US3] Create landing header component in `frontend/src/components/landing/landing-header.tsx` — server component accepting dictionary + locale props; render sticky/fixed header with: Logo component (existing `frontend/src/components/logo.tsx`) on left, section anchor links (Services, Contact) in center, LanguageSwitcher + "Log In" button on right; responsive: collapse nav links into simplified layout on mobile; use Tailwind with white/transparent background and border-bottom
- [x] T019 [US3] Integrate header into landing page in `frontend/src/app/[locale]/page.tsx` — add LandingHeader component at top of page; add `id` attributes to service and contact sections for anchor scroll; ensure header navigation links use `href="#services"` and `href="#contact"` for smooth scroll

**Checkpoint**: Header renders with logo, nav links, language switcher, and login button. Language switcher toggles locale. Section links scroll correctly.

---

## Phase 6: User Story 4 — Visitor Interacts with Live Services (Priority: P2)

**Goal**: Landing page dogfoods both platform services — "Contact Us" form submits via Form Submission endpoint, floating Inquiry Widget is embedded live

**Independent Test**: Submit contact form → verify success message + submission appears in PocketBase; click floating widget → complete inquiry → verify inquiry appears in PocketBase

### Implementation for User Story 4

- [x] T020 [REMOVED] ~~Seed migration~~ — replaced by manual setup: admin creates form + widget in PocketBase dashboard, sets `NEXT_PUBLIC_LANDING_FORM_ID` and `NEXT_PUBLIC_LANDING_WIDGET_ID` env vars
- [x] T021 [P] [US4] Update frontend env example in `frontend/.env.local.example` — add `NEXT_PUBLIC_LANDING_FORM_ID` and `NEXT_PUBLIC_LANDING_WIDGET_ID` variables with placeholder comments

### Tests for User Story 4

- [x] T022 [US4] Write contract test in `frontend/tests/contract/landing-contact.spec.ts` — test AJAX form submission pattern: POST JSON to `/api/submit/{formId}` with `redirect: 'manual'`, verify 302 redirect (opaqueredirect) for valid form ID, verify 404 for invalid form ID; requires PocketBase running

### Implementation for User Story 4 (continued)

- [x] T023 [US4] Create contact form component in `frontend/src/components/landing/contact-form.tsx` — `'use client'` component accepting dictionary props; render form with name (text input), email (email input with validation), message (textarea) fields using shadcn Input/Textarea/Button; implement `fetch()` submission to `${NEXT_PUBLIC_POCKETBASE_URL}/api/submit/${NEXT_PUBLIC_LANDING_FORM_ID}` with `redirect: 'manual'`; handle states: idle, loading (spinner on button), success (green confirmation message), error (red message with retry); email validation before submission
- [x] T024 [US4] Add widget embed script to landing page in `frontend/src/app/[locale]/page.tsx` — use Next.js `<Script strategy="afterInteractive">` to set `window.FormHandler = { widgetId: NEXT_PUBLIC_LANDING_WIDGET_ID, apiBase: NEXT_PUBLIC_POCKETBASE_URL }` then load widget script from `NEXT_PUBLIC_WIDGET_URL/widget.js`
- [x] T025 [US4] Integrate contact form into landing page in `frontend/src/app/[locale]/page.tsx` — add ContactForm component between services section and footer; wrap in `<section id="contact">` with heading from dictionary

### E2E Tests for User Story 4

- [x] T026 [US4] Add E2E tests to `frontend/tests/e2e/landing-page.spec.ts` — test US4 scenarios: verify contact form section visible with 3 fields; fill and submit contact form → verify success message appears; verify floating inquiry widget button appears on page (widget script loads); test form validation: submit with invalid email → verify error

**Checkpoint**: Contact form submits via platform endpoint. Widget floats on page. E2E + contract tests pass.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Responsive verification, lint, build, and final validation

- [x] T027 Responsive design verification — manually verify landing page renders correctly at 320px (mobile), 768px (tablet), and 1920px (desktop) viewports; verify all sections stack properly on mobile, hero text is readable, service cards stack vertically, contact form is usable, header collapses gracefully
- [x] T028 Run lint and build checks — execute `npm run lint` and `npm run build` in `frontend/`; fix any TypeScript or ESLint errors
- [x] T029 Run full test suite — execute `npx playwright test` in `frontend/`; verify all new E2E and contract tests pass alongside existing tests

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3–6)**: All depend on Foundational phase completion
  - US1 (P1) can proceed independently after Phase 2
  - US2 (P2) depends on US1 (CTAs are built into US1 components)
  - US3 (P3) depends on US1 (integrates header into existing page)
  - US4 (P2) depends on US1 (integrates contact form + widget into existing page); requires admin to manually create form + widget in PocketBase
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ↓
Phase 3 (US1 - Content)
    ↓
Phase 4 (US2 - Navigation) ──┐
Phase 5 (US3 - Header)    ──┤── These three can run in any order after US1
Phase 6 (US4 - Live Services)┘
    ↓
Phase 7 (Polish)
```

### Within Each User Story

- Models/data before services
- Services before UI components
- Components before page assembly
- Page assembly before tests
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T003 (en.json) and T004 (zh.json) can run in parallel
- **Phase 2**: T009 (robots.txt) can run in parallel with T005–T008
- **Phase 3**: T010 (hero), T011 (service-card), T012 (footer) can run in parallel
- **Phase 5**: T017 (language-switcher) can run in parallel with earlier tasks
- **Phase 6**: T021 (env example) can start as early as Phase 2 completes

---

## Parallel Example: User Story 1

```bash
# Launch all US1 components in parallel (different files, no dependencies):
Task T010: "Create hero.tsx in frontend/src/components/landing/hero.tsx"
Task T011: "Create service-card.tsx in frontend/src/components/landing/service-card.tsx"
Task T012: "Create landing-footer.tsx in frontend/src/components/landing/landing-footer.tsx"

# Then assemble (depends on T010, T011, T012):
Task T013: "Create page.tsx in frontend/src/app/[locale]/page.tsx"

# Then test (depends on T013):
Task T014: "E2E test in frontend/tests/e2e/landing-page.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (dictionaries + loader)
2. Complete Phase 2: Foundational (middleware + locale layout + SEO)
3. Complete Phase 3: User Story 1 (hero + services + footer + page)
4. **STOP and VALIDATE**: Landing page renders at `/en` and `/zh` with bilingual content
5. Deploy/demo if ready — visitors can see the product value proposition

### Incremental Delivery

1. Setup + Foundational → routing and SEO infrastructure ready
2. Add US1 → bilingual landing page with content → Deploy (MVP!)
3. Add US2 → CTA buttons verified working → Deploy
4. Add US3 → header with navigation and language switcher → Deploy
5. Add US4 → live contact form + embedded widget → Deploy (full feature!)
6. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No new npm dependencies — uses existing shadcn/ui + Tailwind
- All components in `components/landing/` are isolated from dashboard UI
- Dictionaries must be naturally written in each language (not machine translated)
- Seed migration (T020) should be tested by restarting PocketBase and verifying records are created
- Environment variables `NEXT_PUBLIC_LANDING_FORM_ID` and `NEXT_PUBLIC_LANDING_WIDGET_ID` must be set after first migration run
