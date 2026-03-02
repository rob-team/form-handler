# Feature Specification: B2B Inquiry Widget

**Feature Branch**: `002-inquiry-widget`
**Created**: 2026-03-02
**Status**: Draft
**Input**: User description: "B2B外贸官网结构化询盘收集工具：结构化询盘收集 + Telegram 实时通知，对话式表单 widget 嵌入客户官网"

## Clarifications

### Session 2026-03-02

- Q: How should user registration and login be handled? → A: Reuse the existing 001-form-saas authentication implementation (PocketBase email/password auth with email verification).
- Q: How should Telegram bot token be configured? → A: Use the existing shared bot token from environment variable (`TELEGRAM_BOT_TOKEN`). All users share one bot; users only configure their own Telegram chat ID.
- Q: Should the inquiry widget reuse the existing `forms` collection or be a separate new entity? → A: Separate `widgets` + `inquiries` collections. Users can configure their own question lists, which is fundamentally different from the existing forms model.
- Q: What question types should the widget support? → A: Text, email (with format validation), and single-select (dropdown with predefined options). Covers most B2B use cases with minimal complexity.
- Q: Can visitors navigate back to previous questions in the conversational form? → A: Yes, visitors can go back to review and edit previous answers before submitting.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Widget and Configure Questions (Priority: P1)

A B2B trade company registers, logs in, and creates a widget. They configure their question list — choosing from default B2B trade questions or adding custom ones. The system provides a default question template (country, company name, purchase quantity, order timeline, business email, requirement description) that users can modify. Once configured, they copy the embed code and paste it into their website's HTML.

**Why this priority**: This is the core product loop — without the embeddable widget with configurable questions, the product has no value. It enables personalized lead collection from day one.

**Independent Test**: Can be fully tested by registering an account, creating a widget, customizing questions, copying the embed code, pasting it into a test HTML page, and verifying the floating button appears and opens the configured conversational form.

**Acceptance Scenarios**:

1. **Given** a registered user is logged into the dashboard, **When** they create a new widget, **Then** the widget is initialized with a default set of B2B trade questions (country, company name, purchase quantity, order timeline, business email, requirement description).
2. **Given** a user is editing their widget, **When** they add, remove, or reorder questions, **Then** the changes are saved and reflected in the widget's conversational form.
3. **Given** a user has configured their widget, **When** they view the embed section, **Then** they see a copyable embed code snippet.
4. **Given** the embed code is pasted into a website's HTML, **When** a visitor loads the page, **Then** a floating circular button labeled "Send Inquiry" appears at the bottom-right corner.
5. **Given** a visitor clicks the floating button, **When** the widget opens, **Then** a conversational form begins with a greeting and presents the user-configured questions in order.
6. **Given** a visitor is on a question beyond the first, **When** they choose to go back, **Then** they can review and edit their previous answer.
7. **Given** a visitor completes all required fields, **When** they submit, **Then** they see a confirmation message and the inquiry is saved.

---

### User Story 2 - Receive Telegram Notifications for New Inquiries (Priority: P2)

After embedding the widget, the company configures their Telegram chat ID in the dashboard. The system uses a platform-wide shared Telegram bot to deliver notifications. When a visitor submits an inquiry, the company's sales team receives a structured summary notification in Telegram immediately.

**Why this priority**: Real-time notification ensures no lead is missed. Sales teams operate on messaging apps, not dashboards — Telegram delivery eliminates response delay.

**Independent Test**: Can be fully tested by configuring a Telegram chat ID, submitting a test inquiry through the widget, and verifying a formatted message arrives in the configured Telegram chat.

**Acceptance Scenarios**:

1. **Given** a user is on the widget settings page, **When** they enter their Telegram chat ID, **Then** the system validates the connection by sending a test message and confirms it is active.
2. **Given** Telegram is configured and a visitor submits an inquiry, **When** the submission is saved, **Then** a structured message containing all answered questions and responses is sent to the configured Telegram chat within 30 seconds.
3. **Given** the Telegram delivery fails (network error, invalid chat ID), **When** the system attempts to send, **Then** the inquiry is still saved and the failure is logged for the user to see in the dashboard.

---

### User Story 3 - View and Manage Inquiries in Dashboard (Priority: P3)

The company logs into the dashboard and views all collected inquiries in a list. They can see each inquiry's details — visitor answers to configured questions, timestamp, and source page.

**Why this priority**: While Telegram provides real-time alerts, the dashboard serves as the persistent record. Sales teams need a central place to review, search, and follow up on all leads.

**Independent Test**: Can be fully tested by submitting several inquiries through the widget, logging into the dashboard, and verifying all submissions appear with complete details.

**Acceptance Scenarios**:

1. **Given** inquiries have been submitted, **When** the user navigates to the inquiries list, **Then** all inquiries are displayed in reverse chronological order with key fields visible.
2. **Given** the user clicks on an inquiry, **When** the detail view opens, **Then** all question-answer pairs and metadata (IP, country, source page, timestamp) are visible.
3. **Given** inquiries exist, **When** the user searches or filters by country or date range, **Then** matching results are displayed.

---

### User Story 4 - Track Basic Visitor Activity (Priority: P4)

The embed code records basic visitor data — page visited, visit time, visitor IP, and country. This data is viewable in the dashboard as a simple activity log, helping the company understand traffic patterns without complex analytics.

**Why this priority**: Visitor tracking adds context around inquiries and helps companies gauge whether their site is receiving traffic even when no inquiries are submitted.

**Independent Test**: Can be fully tested by embedding the widget on a test page, visiting the page from different locations, and verifying visit records appear in the dashboard.

**Acceptance Scenarios**:

1. **Given** the embed code is on a website, **When** a visitor loads the page, **Then** the system records the page URL, timestamp, visitor IP, and derived country.
2. **Given** visitor records exist, **When** the user views the visitor activity section in the dashboard, **Then** they see a chronological list showing page, time, IP, and country.
3. **Given** the user views visitor activity, **When** they look at summary statistics, **Then** they see total visits, unique visitors, and top countries for a selected time period.

---

### Edge Cases

- What happens when a visitor abandons the conversational form midway? Partial data is not saved as a completed inquiry but may be tracked as an incomplete interaction.
- What happens when the embed code is placed on multiple pages of the same website? The widget appears on each page and tracks which page the visitor was on when they submitted.
- What happens when Telegram is not configured? Inquiries are still saved; the user sees a reminder in the dashboard to configure notifications.
- What happens when the same visitor submits multiple inquiries? Each submission is saved as a separate inquiry record.
- What happens when the visitor's browser blocks cookies or JavaScript? The widget requires JavaScript to function; a graceful fallback message is not displayed (standard behavior for embedded widgets).
- What happens when the embed code is used on a site with Content Security Policy (CSP) restrictions? The embed documentation includes guidance on required CSP directives.
- What happens when a user modifies their question list after inquiries have already been collected? Existing inquiries retain their original question-answer pairs; new submissions use the updated question list.
- What happens when a user removes all questions from the widget? The system requires at least one question; removal of the last question is prevented.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a copyable embed code snippet (JavaScript) per widget.
- **FR-002**: The embed code MUST render a floating circular button at the bottom-right corner of the host website.
- **FR-003**: The floating button MUST display configurable text (default: "Send Inquiry").
- **FR-004**: Clicking the button MUST open a conversational form overlay that collects inquiry data step-by-step based on the widget's configured questions. Visitors MUST be able to navigate back to review and edit previous answers before final submission.
- **FR-005**: Each widget MUST have a configurable list of questions. The system provides a default B2B trade template (country, company name, purchase quantity, order timeline, business email, requirement description) that users can customize — adding, removing, or reordering questions.
- **FR-006**: Each question MUST have a label (displayed to the visitor), a type (text, email, or single-select), and a required/optional flag. Text questions accept free-text input. Email questions validate email format. Single-select questions display predefined options as choices.
- **FR-007**: The system MUST save each completed inquiry with all question-answer pairs plus metadata (IP, country, source page URL, timestamp).
- **FR-008**: The system MUST use a platform-wide shared Telegram bot token (from environment configuration). Users only configure their Telegram chat ID per widget.
- **FR-009**: Upon successful inquiry submission, the system MUST send a structured notification to the configured Telegram chat containing all question-answer pairs.
- **FR-010**: If Telegram notification delivery fails, the system MUST still save the inquiry and log the delivery failure.
- **FR-011**: The dashboard MUST display all inquiries in reverse chronological order with search and filter capabilities.
- **FR-012**: The dashboard MUST show inquiry details including all question-answer pairs and metadata.
- **FR-013**: The embed code MUST record basic visitor data (page URL, timestamp, IP, derived country) on each page load.
- **FR-014**: The dashboard MUST display visitor activity logs with summary statistics (total visits, unique visitors, top countries).
- **FR-015**: User registration and login MUST reuse the existing authentication system (PocketBase email/password auth with email verification) from 001-form-saas.
- **FR-016**: The widget MUST be visually styled to resemble common chat widgets (similar to Tawk.to or Intercom) while clearly functioning as a guided form, not a live chat.
- **FR-017**: The widget MUST work across modern browsers (Chrome, Firefox, Safari, Edge) and be responsive on both desktop and mobile devices.
- **FR-018**: The widget MUST not interfere with the host website's existing styles or functionality.
- **FR-019**: The widget MUST require at least one question to be configured before the embed code can be used.
- **FR-020**: Existing inquiries MUST retain their original question-answer pairs even if the widget's question list is later modified.

### Key Entities

- **User**: A registered B2B company account (reuses existing PocketBase users collection). Key attributes: email, password, company name, verified status.
- **Widget**: An embeddable inquiry collector associated with a user. Key attributes: embed code identifier, button text, active status, Telegram chat ID, configured question list.
- **Question**: A configured question within a widget. Key attributes: label (displayed text), order position, required/optional flag, question type (text, email, or single-select), predefined options (for single-select type only).
- **Inquiry**: A completed visitor submission through the widget. Key attributes: question-answer pairs (preserving question text and visitor response), source page URL, visitor IP, derived country, submission timestamp, associated widget.
- **Visitor Record**: A page visit event recorded by the embed code. Key attributes: page URL, visit timestamp, visitor IP, derived country, associated widget.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can register, configure their widget questions, obtain their embed code, and have the widget visible on a test page within 10 minutes.
- **SC-002**: A visitor can complete a typical inquiry form (6 questions) within 2 minutes.
- **SC-003**: Telegram notifications arrive within 30 seconds of inquiry submission when properly configured.
- **SC-004**: 100% of completed inquiries are persisted regardless of Telegram delivery status.
- **SC-005**: Visitor activity data is recorded for every page view where the embed code is present.
- **SC-006**: The widget loads on the host website within 2 seconds without visibly impacting page load performance.
- **SC-007**: The dashboard displays inquiry and visitor data with filtering results returned within 1 second.
- **SC-008**: The widget functions correctly on Chrome, Firefox, Safari, and Edge on both desktop and mobile.

## Assumptions

- The system reuses the existing PocketBase instance and auth system from 001-form-saas. Both features share the same deployment.
- Telegram bot token is a platform-level environment variable (`TELEGRAM_BOT_TOKEN`), shared by all users. Users do not need to create their own bot.
- The `widgets` and `inquiries` collections are separate from the existing `forms` and `submissions` collections. Both feature sets coexist independently.
- Country detection from IP uses a standard geolocation approach; accuracy is approximate and best-effort.
- The widget embed code is a single `<script>` tag — no additional dependencies required on the host website.
- Users can create multiple widgets (e.g., one per website or product line). No limit on widget count per user.
- The system provides a default question template for B2B trade inquiries. Users can fully customize their questions but always start from a sensible default.
- Data retention follows standard practices — inquiry and visitor data is retained indefinitely unless the user deletes their account.
- The widget communicates with the backend over HTTPS; the host website does not need to be on HTTPS for the widget to function, but HTTPS is recommended.
