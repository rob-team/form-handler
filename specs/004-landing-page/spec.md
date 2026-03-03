# Feature Specification: Landing Page

**Feature Branch**: `004-landing-page`
**Created**: 2026-03-03
**Status**: Draft
**Input**: User description: "前端加一个landing page, 介绍已经实现的两个服务。服务是为了B2B卖家更好更简单的获客。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor Understands the Product Value (Priority: P1)

A prospective B2B seller visits the landing page and immediately understands what the platform offers: two services that simplify customer acquisition. The page clearly communicates the value proposition, describes each service, and motivates the visitor to sign up or log in.

**Why this priority**: The landing page is the first impression for all potential users. If visitors cannot quickly understand the value of the platform, they will leave. This is the core purpose of the entire feature.

**Independent Test**: Can be fully tested by navigating to the landing page URL and verifying that the hero section, service descriptions, and call-to-action are visible and informative.

**Acceptance Scenarios**:

1. **Given** a visitor (not logged in) opens the root URL, **When** the page loads, **Then** they see a hero section with a clear headline communicating the platform's value for B2B sellers.
2. **Given** a visitor is on the landing page, **When** they scroll down, **Then** they see two distinct service sections: one for the Form Submission service and one for the Inquiry Widget service, each with a brief description and key benefits.
3. **Given** a visitor is on the landing page, **When** they look at the Form Submission service section, **Then** they understand it allows them to create form endpoints for their websites to collect customer submissions with notifications.
4. **Given** a visitor is on the landing page, **When** they look at the Inquiry Widget service section, **Then** they understand it provides an embeddable conversational chat widget that guides visitors through structured B2B trade inquiries.

---

### User Story 2 - Visitor Navigates to Sign Up or Log In (Priority: P2)

A visitor who is convinced by the landing page wants to start using the platform. They can easily find and click a call-to-action button that takes them to the sign-up or login page.

**Why this priority**: Converting visitors into users is the direct business goal of the landing page. Without clear call-to-action elements, the page fails its conversion purpose.

**Independent Test**: Can be fully tested by clicking the call-to-action buttons on the landing page and verifying they navigate to the authentication page.

**Acceptance Scenarios**:

1. **Given** a visitor is on the landing page, **When** they look at the hero section, **Then** they see a prominent "Get Started" (or equivalent) call-to-action button.
2. **Given** a visitor clicks the "Get Started" button, **When** the navigation completes, **Then** they are taken to the sign-up / login page.
3. **Given** a visitor scrolls through the service sections, **When** they reach the end of each service description, **Then** they see a call-to-action linking to the sign-up / login page.
4. **Given** a logged-in user visits the root URL, **When** the page loads, **Then** they are redirected to their dashboard instead of seeing the landing page.

---

### User Story 3 - Page Header with Navigation (Priority: P3)

The landing page has a header/navbar with the product name/logo and navigation links (e.g., links to service sections on the page, plus a "Log In" button) so visitors can quickly orient themselves.

**Why this priority**: Navigation enhances usability but the page is still functional without a sophisticated header. This is a polish item that improves overall user experience.

**Independent Test**: Can be fully tested by verifying the header renders with product branding and navigation links, and that links scroll to the correct sections or navigate to the login page.

**Acceptance Scenarios**:

1. **Given** a visitor is on the landing page, **When** the page loads, **Then** they see a header with the product name or logo.
2. **Given** a visitor is on the landing page, **When** they look at the header, **Then** they see a "Log In" (or "Sign In") link/button that navigates to the authentication page.
3. **Given** a visitor clicks a section navigation link in the header, **When** the page scrolls, **Then** the corresponding service section scrolls into view.

---

### User Story 4 - Visitor Interacts with Live Services on Landing Page (Priority: P2)

The landing page itself uses both platform services as a live demonstration: a "Contact Us" form powered by the Form Submission service and an embedded Inquiry Widget floating chat button. Visitors experience the products firsthand while the site owner captures real leads.

**Why this priority**: Dogfooding the services on the landing page is a powerful trust signal — visitors see the product working in a real context. It also serves as a functional lead capture mechanism, making it equal in priority to the sign-up CTA.

**Independent Test**: Can be fully tested by submitting the "Contact Us" form and completing an inquiry through the floating widget on the landing page, verifying both reach the system/admin account's dashboard.

**Acceptance Scenarios**:

1. **Given** a visitor is on the landing page, **When** they scroll to the "Contact Us" section, **Then** they see a form with name, email, and message fields.
2. **Given** a visitor fills out the "Contact Us" form with valid data and submits, **When** the submission completes, **Then** they see a success confirmation and the submission appears in the system/admin account's form submissions.
3. **Given** a visitor is on the landing page, **When** they click the floating "Send Inquiry" chat button, **Then** the Inquiry Widget opens and guides them through the conversational inquiry flow.
4. **Given** a visitor completes an inquiry through the widget, **When** the inquiry is submitted, **Then** the inquiry appears in the system/admin account's widget inquiries.

---

### Edge Cases

- What happens when a logged-in user visits the landing page? They should be redirected to the dashboard.
- What happens on mobile devices? The landing page must be responsive and readable on all screen sizes.
- What happens if the page is accessed via a direct deep link to a section anchor? The page should scroll to the referenced section.
- What happens when browser language cannot be detected? Default to English (`/en`).
- What happens when a search engine crawls `/`? The redirect should use a 302 (temporary) so search engines index `/en` and `/zh` independently via `hreflang` tags.
- What happens if the "Contact Us" form submission fails (e.g., backend unavailable)? Show a user-friendly error message and allow retry.
- What happens if the Inquiry Widget script fails to load? The landing page content remains fully usable; the floating button simply does not appear.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The landing page MUST be accessible at the root URL (`/`) without authentication.
- **FR-002**: The landing page MUST display a hero section with a headline and subheadline that clearly communicate the platform's value proposition for B2B sellers seeking easier customer acquisition.
- **FR-003**: The landing page MUST include a dedicated section for the Form Submission service, describing its purpose (create form endpoints, collect submissions, receive notifications) and key benefits.
- **FR-004**: The landing page MUST include a dedicated section for the Inquiry Widget service, describing its purpose (embeddable conversational widget for B2B trade inquiries) and key benefits.
- **FR-005**: The landing page MUST include at least one prominent call-to-action button in the hero section that navigates to the sign-up / login page.
- **FR-006**: The landing page MUST include call-to-action links within or after each service section that navigate to the sign-up / login page.
- **FR-007**: The landing page MUST redirect authenticated users to their dashboard.
- **FR-008**: The landing page MUST be fully responsive and usable on mobile, tablet, and desktop screen sizes.
- **FR-009**: The landing page MUST include a header/navbar with the product name and a "Log In" navigation link.
- **FR-010**: The landing page MUST load and display all content without requiring any user interaction (no loading spinners for primary content).
- **FR-011**: The landing page MUST be available in both English (`/en`) and Chinese (`/zh`), with each language version at its own URL path prefix.
- **FR-012**: The landing page MUST include a visible language switcher allowing visitors to toggle between English and Chinese.
- **FR-013**: When a visitor accesses the root URL (`/`), the system MUST auto-detect the browser language and redirect to `/zh` for Chinese-language browsers or `/en` for all others.
- **FR-014**: Each language version MUST have proper SEO metadata: unique `<title>`, meta description, canonical URL, and `hreflang` tags linking to the alternate language version.
- **FR-015**: The landing page MUST include structured data (schema.org) describing the product and its two services.
- **FR-016**: The landing page MUST include Open Graph and Twitter Card meta tags for rich previews when shared on social media or messaging platforms.
- **FR-017**: The landing page MUST NOT block AI crawlers (e.g., GPTBot, ClaudeBot, Googlebot) in `robots.txt`. The page MUST use clean semantic HTML so AI systems can accurately parse and summarize the content.
- **FR-018**: Both language versions MUST have the same page structure, sections, and call-to-action placement. Content MUST be naturally written in each language (not literal word-for-word translation).
- **FR-019**: The landing page MUST include a "Contact Us" form section that submits visitor inquiries through the platform's own Form Submission service endpoint.
- **FR-020**: The landing page MUST embed the actual Inquiry Widget (floating "Send Inquiry" chat button) so visitors can experience the conversational inquiry flow firsthand.
- **FR-021**: The form endpoint and widget configuration used on the landing page MUST be owned by a dedicated system/admin account, separate from regular user accounts.
- **FR-022**: The system/admin account, its form endpoint, and its widget configuration MUST be created automatically during deployment (seeded).
- **FR-023**: The "Contact Us" form MUST collect three fields: name, email, and message. Email MUST be validated before submission.

## Clarifications

### Session 2026-03-03

- Q: How should visitors switch between Chinese and English? → A: URL path prefix (`/en`, `/zh`) — each language has its own crawlable URL.
- Q: What should happen when a visitor hits the root URL (`/`)? → A: Auto-detect browser language; redirect to `/zh` for Chinese browsers, `/en` otherwise.
- Q: What level of SEO optimization? → A: Comprehensive — semantic HTML, meta title/description, structured data (schema.org), Open Graph/Twitter meta tags, canonical URLs, `hreflang` tags for bilingual.
- Q: What does "AI-friendly" mean for this landing page? → A: Allow AI crawlers (do not block in robots.txt) + clean semantic HTML; rely on structured data from SEO for AI discoverability.
- Q: Should English and Chinese versions have identical content? → A: Same structure with localized tone — identical sections and CTAs, naturally written in each language (not literal translation).
- Q: How should the Form Submission service be used on the landing page? → A: "Contact Us" form section at the bottom that submits via the platform's own form endpoint.
- Q: How should the Inquiry Widget be used on the landing page? → A: Embed the actual floating chat widget — the same "Send Inquiry" button visitors would see on any client site.
- Q: Who owns the form endpoint and widget configuration for the landing page? → A: A dedicated system/admin account created during deployment, keeping landing page resources separate from regular user data.
- Q: What fields should the "Contact Us" form collect? → A: Minimal — name, email, message.

## Assumptions

- The landing page dogfoods (uses) both platform services: a "Contact Us" form via the Form Submission service and the embedded Inquiry Widget. No new backend collections or APIs are needed — it relies on existing service endpoints.
- The product name/branding ("FormHandler" or equivalent) already exists and can be referenced.
- The existing authentication flow (email/password and OAuth login) is already implemented and the landing page simply links to it.
- The landing page supports two languages: English and Chinese, served at separate URL path prefixes (`/en`, `/zh`). Each language version has its own crawlable URL for SEO.
- No analytics or tracking tools are required for this feature (can be added later as a separate feature).
- The landing page does not include pricing, detailed documentation, or a blog — only service descriptions and call-to-action.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Visitors can understand the platform's two core services within 30 seconds of landing on the page (validated by content being above the fold or within one scroll).
- **SC-002**: Every call-to-action button on the page successfully navigates the visitor to the sign-up / login page.
- **SC-003**: Authenticated users are redirected to the dashboard within 2 seconds of visiting the root URL.
- **SC-004**: The landing page renders correctly and is fully usable on viewports from 320px (mobile) to 1920px (desktop) wide.
- **SC-005**: The landing page loads completely (all primary content visible) in under 3 seconds on a standard connection.
- **SC-006**: Both English and Chinese versions contain equivalent content covering both services, with all text properly localized (not machine-translated placeholders).
- **SC-007**: Each language version has correct SEO metadata (`title`, meta description, `hreflang`, canonical URL, Open Graph tags) validated by an SEO audit tool or manual inspection.
- **SC-008**: AI crawlers (e.g., GPTBot, ClaudeBot) can access and parse the landing page content without being blocked.
- **SC-009**: A visitor can successfully submit the "Contact Us" form and the submission is recorded in the system/admin account's dashboard.
- **SC-010**: A visitor can complete a full inquiry through the embedded Inquiry Widget and the inquiry is recorded in the system/admin account's dashboard.
