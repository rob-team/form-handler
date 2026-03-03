# Feature Specification: Service Documentation Pages

**Feature Branch**: `005-service-docs`
**Created**: 2026-03-03
**Status**: Draft
**Input**: User description: "为两个服务创建documentation，并在landing page中加入documentation链接"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor Reads Form Endpoints Documentation (Priority: P1)

A prospective or existing user navigates to the Form Endpoints documentation page to learn how to set up and use the Form Submission service. The page provides a clear, step-by-step guide covering form creation, embedding the endpoint URL in an HTML form, handling redirects with the `_next` field, and viewing submissions in the dashboard. The documentation also covers Telegram notification setup.

**Why this priority**: Without clear documentation, users cannot effectively onboard and use the Form Endpoints service. This is the most established service and documentation for it directly reduces user friction and support burden.

**Independent Test**: Can be fully tested by navigating to the Form Endpoints documentation URL and verifying that all sections are present, code examples are copyable, and the page is readable in both English and Chinese.

**Acceptance Scenarios**:

1. **Given** a visitor is on the landing page, **When** they click the "Docs" link for Form Endpoints in the services section or header navigation, **Then** they are taken to the Form Endpoints documentation page.
2. **Given** a visitor is on the Form Endpoints documentation page, **When** they read the page, **Then** they find sections covering: overview, creating a form, embedding the endpoint URL, the `_next` redirect field, viewing submissions, and Telegram notification setup.
3. **Given** a visitor is on the Form Endpoints documentation page, **When** they view the code examples (e.g., HTML form snippet), **Then** they can copy the example code.
4. **Given** a visitor is on the English documentation page, **When** they switch to Chinese, **Then** the same documentation is available in Chinese with naturally written content.

---

### User Story 2 - Visitor Reads Inquiry Widget Documentation (Priority: P1)

A prospective or existing user navigates to the Inquiry Widget documentation page to learn how to set up and use the embeddable widget. The page covers widget creation, question configuration, embedding the widget script on their website, and viewing inquiries in the dashboard. The documentation also covers Telegram notification setup and visitor analytics.

**Why this priority**: The Inquiry Widget has more configuration options (custom questions, question types, embed code) than Form Endpoints, making documentation even more critical for user success.

**Independent Test**: Can be fully tested by navigating to the Inquiry Widget documentation URL and verifying that all sections are present, embed code examples are copyable, and the page is readable in both English and Chinese.

**Acceptance Scenarios**:

1. **Given** a visitor is on the landing page, **When** they click the "Docs" link for Inquiry Widget in the services section or header navigation, **Then** they are taken to the Inquiry Widget documentation page.
2. **Given** a visitor is on the Inquiry Widget documentation page, **When** they read the page, **Then** they find sections covering: overview, creating a widget, configuring questions (text, email, single-select types), embedding the script tag, viewing inquiries, Telegram notifications, and visitor analytics.
3. **Given** a visitor is on the Inquiry Widget documentation page, **When** they view the embed code example, **Then** they can copy the example code.
4. **Given** a visitor is on the English documentation page, **When** they switch to Chinese, **Then** the same documentation is available in Chinese with naturally written content.

---

### User Story 3 - Landing Page Links to Documentation (Priority: P2)

The landing page header navigation and service cards include links to the documentation pages for each service, so visitors can easily learn more about how each service works before or after signing up.

**Why this priority**: Documentation links on the landing page connect the marketing message to actionable learning resources. While visitors can still sign up and explore without docs, having accessible documentation improves conversion and reduces hesitation.

**Independent Test**: Can be fully tested by visiting the landing page and verifying that documentation links are present in both the header navigation and the service card sections, and that each link navigates to the correct documentation page.

**Acceptance Scenarios**:

1. **Given** a visitor is on the landing page, **When** they hover or click the "Docs" link in the header navigation, **Then** a dropdown menu appears with direct links to the Form Endpoints and Inquiry Widget documentation pages.
2. **Given** a visitor is on the landing page, **When** they look at each service card, **Then** they see a "Learn More" or "View Docs" link alongside the existing call-to-action button.
3. **Given** a visitor clicks a documentation link from the landing page, **When** the page loads, **Then** the documentation page matches the current language (English or Chinese) of the landing page.
4. **Given** a visitor is on a documentation page, **When** they want to return to the landing page, **Then** they can navigate back via the header logo or a breadcrumb/back link.

---

### Edge Cases

- What happens when a visitor accesses a documentation page directly via URL without going through the landing page? The page renders normally with full navigation.
- What happens on mobile devices? Documentation pages are fully responsive and readable on all screen sizes, with code examples scrollable horizontally if needed.
- What happens when a visitor accesses a documentation URL without a locale prefix (e.g., `/docs/form-endpoints`)? The URL returns a 404 since all doc pages live under `/{locale}/docs/`. This is consistent with how other non-locale-prefixed paths behave — only the root `/` performs auto-detection and redirect. All internal links and navigation use locale-prefixed URLs.
- What happens if documentation content references features that have been updated? Documentation content is static and maintained alongside the codebase; updates are applied as part of regular development.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a documentation page for the Form Endpoints service accessible at a dedicated URL path under each locale (e.g., `/en/docs/form-endpoints`, `/zh/docs/form-endpoints`).
- **FR-002**: The system MUST provide a documentation page for the Inquiry Widget service accessible at a dedicated URL path under each locale (e.g., `/en/docs/inquiry-widget`, `/zh/docs/inquiry-widget`).
- **FR-003**: The Form Endpoints documentation MUST be structured as: (1) a numbered step-by-step quickstart at the top covering the minimum path from account creation to first submission (create form → copy endpoint URL → embed in HTML → receive submission), followed by (2) detailed reference sections for each feature: the `_next` redirect field, viewing and managing submissions, and configuring Telegram notifications.
- **FR-004**: The Inquiry Widget documentation MUST be structured as: (1) a numbered step-by-step quickstart at the top covering the minimum path from account creation to first inquiry (create widget → configure questions → copy embed code → paste on website → receive inquiry), followed by (2) detailed reference sections for each feature: question types and configuration (text, email, single-select), customizing the widget, viewing inquiries in the dashboard, configuring Telegram notifications, and visitor analytics.
- **FR-005**: Documentation pages MUST include copyable code examples (HTML form snippet for Form Endpoints, script tag snippet for Inquiry Widget).
- **FR-015**: Documentation pages MUST include screenshots of key dashboard screens at each quickstart step (e.g., form/widget creation screen, endpoint URL / embed code display, submission/inquiry list view, Telegram configuration). Screenshots MUST be provided for both English and Chinese UI versions. Screenshots are static image files stored in the repository and updated manually when the UI changes.
- **FR-006**: Documentation pages MUST be available in both English and Chinese, with naturally written content in each language (not literal translation).
- **FR-007**: The landing page header navigation MUST include a "Docs" dropdown menu that, on hover or click, reveals direct links to both documentation pages (Form Endpoints and Inquiry Widget).
- **FR-008**: Each service card on the landing page MUST include a secondary link (e.g., "View Docs") that navigates to the corresponding service documentation page.
- **FR-009**: Documentation links on the landing page MUST preserve the current locale when navigating to a documentation page.
- **FR-010**: Documentation pages MUST include the same header and footer as the landing page for consistent navigation.
- **FR-011**: Documentation pages MUST be fully responsive and readable on mobile, tablet, and desktop viewports.
- **FR-012**: Documentation pages MUST be accessible without authentication.
- **FR-013**: Documentation pages MUST have proper SEO metadata (title, description, canonical URL, hreflang tags) consistent with the landing page's SEO approach.
- **FR-014**: Code examples in the documentation MUST use placeholder values (e.g., `YOUR_FORM_ID`, `YOUR_WIDGET_ID`) that clearly indicate where users should insert their own values.
- **FR-016**: Each documentation page MUST include a "Full Example" reference section containing a complete, self-contained HTML page that users can save to a file and open in a browser to test the integration (with placeholder IDs). The quickstart steps use minimal snippets (just the `<form>` or `<script>` tag).

## Clarifications

### Session 2026-03-03

- Q: How should documentation be structured on each page? → A: Step-by-step quickstart at the top (numbered flow like Formspree's "3 steps"), followed by detailed reference sections for each feature (redirect, Telegram, etc.).
- Q: Should documentation include screenshots of the dashboard UI? → A: Yes, include screenshots of key dashboard steps (form creation, widget config, submission/inquiry views).
- Q: What scope should the code examples cover? → A: Minimal snippet in the quickstart (just the form/script tag) + a complete working HTML page example in a "Full Example" reference section below.
- Q: How should the "Docs" link in the landing page header work? → A: Dropdown menu — hovering/clicking "Docs" reveals two links (Form Endpoints, Inquiry Widget). No separate index page needed.
- Q: Should documentation screenshots be static image files or generated dynamically? → A: Static image files committed to the repo (e.g., `public/docs/screenshots/`), updated manually when UI changes.

## Assumptions

- Documentation is static content rendered as part of the frontend application — no CMS or dynamic content system is needed.
- Documentation content is stored as structured JSX in the page components (for prose, code examples, and screenshots) with short navigation labels in the dictionary JSON files. This approach was chosen over full dictionary storage because documentation has complex structured content (numbered steps, code blocks, inline images) that doesn't map well to flat JSON.
- No backend changes are required — documentation pages are purely frontend additions.
- The documentation covers the current feature set as already implemented in 001-form-saas and 002-inquiry-widget. It does not document planned or future features.
- Documentation pages share the same visual design system (header, footer, typography, colors) as the landing page.
- No in-page search or sidebar table-of-contents navigation is needed for this initial version — each documentation page is a single scrollable page.
- The "Docs" navigation link in the header uses a dropdown menu to link to both documentation pages directly. No separate docs index page is needed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can find and read the documentation for either service within 2 clicks from the landing page.
- **SC-002**: Documentation pages load completely in under 3 seconds on a standard connection.
- **SC-003**: Both English and Chinese documentation versions contain equivalent, complete content covering all sections specified in FR-003 and FR-004.
- **SC-004**: 100% of code examples in the documentation are copyable and syntactically correct when pasted into a text editor.
- **SC-005**: Documentation pages render correctly on viewports from 320px (mobile) to 1920px (desktop) wide.
- **SC-006**: Each documentation page has correct SEO metadata (title, description, hreflang, canonical URL) validated by manual inspection.
