# Feature Specification: SaaS Form Submission Platform

**Feature Branch**: `001-form-saas`
**Created**: 2026-03-01
**Status**: Draft
**Input**: User description: "Develop a SaaS system with functionality similar to a simplified version of Formspree..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Registration and Login (Priority: P1)

A visitor arrives at the platform, creates an account with an email address and
password, verifies their email, and subsequently logs in to access their dashboard.

**Why this priority**: All other features depend on authenticated access. Without
registration and login, no forms can be created or managed.

**Independent Test**: Can be fully tested by registering a new account, receiving a
verification email, clicking the verification link, and successfully logging in to
see the dashboard — delivering immediate value as the entry point to the product.

**Acceptance Scenarios**:

1. **Given** a visitor on the registration page, **When** they submit a valid email
   and password, **Then** their account is created and a verification email is sent.
2. **Given** an unverified account, **When** the user clicks the verification link in
   the email, **Then** the account becomes active and the user is redirected to the
   dashboard.
3. **Given** a verified account, **When** the user submits correct credentials on the
   login page, **Then** they are authenticated and land on their dashboard.
4. **Given** a login attempt with an incorrect password, **When** the user submits,
   **Then** an actionable error message is shown and no session is created.
5. **Given** an authenticated session, **When** the user logs out, **Then** the
   session is invalidated and they are redirected to the login page.

---

### User Story 2 - Form Creation and Management (Priority: P1)

A logged-in user creates a named form and receives a unique submission endpoint URL
that can be embedded in any external HTML form or called directly via HTTP POST.

**Why this priority**: The core product value — without the ability to create forms
and obtain endpoint URLs, the platform has no utility.

**Independent Test**: Can be fully tested by creating a form, copying the generated
endpoint URL, and sending a manual POST request (via curl or a browser form) that
returns the correct success response — independently verifiable without Telegram or
data-viewing features.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the dashboard, **When** they submit a form name,
   **Then** a new form record is created and a unique submission endpoint URL is
   displayed.
2. **Given** a created form, **When** the user views the form list, **Then** each
   form shows its name, creation date, submission count, and unique endpoint URL.
3. **Given** a created form, **When** the user renames it, **Then** the name updates
   but the endpoint URL remains unchanged.
4. **Given** a created form, **When** the user deletes it, **Then** the form and all
   its submissions are removed and the endpoint URL subsequently returns 404.
5. **Given** two different users, **When** each creates a form, **Then** the endpoint
   URLs are distinct and submissions only route to the owning user's form.

---

### User Story 3 - Form Submission Handling with Redirect Logic (Priority: P1)

An external website embeds a form pointing to the platform endpoint. When a visitor
submits the form, the data is saved and the visitor is either redirected to a custom
URL (if `_next` was included in the POST data) or shown a default success page
containing a link back to the referring page.

**Why this priority**: This is the core SaaS value proposition — the actual form
submission pipeline is the product's primary function.

**Independent Test**: Can be fully tested by POSTing to a valid endpoint URL with
sample fields and verifying: (a) data is persisted, (b) when `_next` is present the
response is an HTTP redirect to that URL, (c) when `_next` is absent the default
success page is returned with a back link pointing to the referring page.

**Acceptance Scenarios**:

1. **Given** a valid endpoint URL, **When** an external form POSTs to it with field
   data and a `_next` field containing a valid absolute HTTPS URL, **Then** the
   submission data (excluding `_next`) is saved and the HTTP response redirects the
   browser to the `_next` URL.
2. **Given** a valid endpoint URL, **When** an external form POSTs to it with field
   data but no `_next` field, **Then** the submission is saved and a default success
   page is returned containing a link that navigates the user back to the referring
   page (derived from the HTTP `Referer` header).
3. **Given** a valid endpoint URL, **When** a POST request arrives with a `_next`
   field containing a malformed or non-HTTP/HTTPS URL, **Then** the submission is
   saved and the default success page is shown instead of issuing the redirect.
4. **Given** an invalid or deleted endpoint URL, **When** a POST request arrives,
   **Then** a 404 error response is returned and no data is saved.
5. **Given** a successful submission, **When** the form owner views submissions,
   **Then** the saved data matches exactly what was POSTed and the `_next` field is
   absent from the stored record.

---

### User Story 4 - Submission Data Viewing (Priority: P2)

A logged-in form owner navigates to a specific form and browses all POST submissions
received, displayed in reverse-chronological order with all submitted field names
and values visible.

**Why this priority**: This is the primary reason a user continues to use the
platform after initial setup. Without it the platform is a black box.

**Independent Test**: Can be fully tested by submitting several test POSTs to a form
and then logging in to verify each submission appears with the correct timestamp and
all field name/value pairs displayed accurately.

**Acceptance Scenarios**:

1. **Given** a form with submissions, **When** the owner views it, **Then** all
   submissions are listed newest-first, each showing a timestamp and all field
   name/value pairs.
2. **Given** a form with no submissions, **When** the owner views it, **Then** an
   empty-state message is displayed with guidance on how to receive the first
   submission.
3. **Given** more submissions than fit on one page, **When** the owner navigates,
   **Then** all submissions are accessible via pagination.
4. **Given** a form owned by User A, **When** User B attempts to view its
   submissions, **Then** access is denied with an appropriate error response.

---

### User Story 5 - Telegram Notification Configuration (Priority: P3)

A form owner connects a Telegram account to a specific form so they receive an
instant notification message whenever a new submission arrives.

**Why this priority**: A valuable enhancement for real-time awareness, but the
platform is fully functional without it.

**Independent Test**: Can be fully tested by following the Telegram setup flow,
submitting a test POST to the configured form, and confirming the Telegram
notification arrives within a reasonable time — independently verifiable without
affecting other user stories.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they follow the Telegram setup instructions
   (messaging the platform bot and entering the returned chat ID in the form
   settings), **Then** the form is linked to that Telegram chat.
2. **Given** a form with Telegram notifications enabled, **When** a new submission
   arrives, **Then** a notification message is sent to the configured chat
   summarising the submitted field names and values.
3. **Given** a form with Telegram notifications enabled, **When** the user disables
   notifications, **Then** subsequent submissions no longer trigger a Telegram
   message.
4. **Given** an invalid or revoked Telegram chat configuration, **When** a submission
   arrives, **Then** the submission is saved successfully and the notification failure
   is logged internally, but the submitter's experience is unaffected.

---

### Edge Cases

- What happens when `_next` contains a malformed or non-HTTP(S) URL? The system
  MUST fall back to the default success page rather than issuing a potentially
  dangerous or broken redirect.
- What if the POST body exceeds a reasonable payload size? Submissions exceeding 1 MB
  MUST be rejected with an appropriate HTTP error response.
- What if the `Referer` header is absent and no `_next` is provided? The default
  success page MUST still render; the back link may be omitted gracefully.
- What if two visitors register with the same email simultaneously? Only one account
  MUST be created; the other MUST receive an error indicating the email is taken.
- What if a Telegram notification fails to deliver (network error, bot blocked)?
  The failure MUST NOT block submission persistence or alter the HTTP response to
  the submitter; failures MUST be logged.
- What if a form receives a POST with no body fields? The empty submission MUST still
  be saved; no required fields are enforced at the platform level.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow visitors to register with a unique email address
  and a password.
- **FR-002**: The system MUST send an email verification message after registration;
  unverified accounts MUST NOT be able to create or manage forms.
- **FR-003**: Verified users MUST be able to log in with their email and password and
  log out, with sessions invalidated on logout.
- **FR-004**: Authenticated users MUST be able to create a named form and receive a
  unique, publicly accessible submission endpoint URL.
- **FR-005**: Authenticated users MUST be able to view, rename, and delete their
  own forms from the dashboard.
- **FR-006**: The submission endpoint MUST accept HTTP POST requests from any origin
  and persist all submitted field data.
- **FR-007**: When the POST body includes a `_next` field containing a valid absolute
  HTTP or HTTPS URL, the system MUST redirect the submitter to that URL after saving
  the submission.
- **FR-008**: When the POST body does not include a `_next` field, or `_next` is an
  invalid URL, the system MUST return a default success page containing a link that
  navigates the user back to the referring page.
- **FR-009**: The `_next` field MUST NOT be stored as part of the submission data.
- **FR-010**: Authenticated users MUST be able to view all submissions for their own
  forms, listed in reverse-chronological order, with all submitted field names and
  values displayed.
- **FR-011**: Users MUST NOT be able to view submissions belonging to forms they do
  not own.
- **FR-012**: Authenticated users MUST be able to configure a Telegram notification
  for each form by linking a Telegram chat ID (obtained from the platform's bot) to
  that form.
- **FR-013**: When Telegram notifications are enabled for a form, the system MUST
  send a notification to the configured chat upon each new successful submission.
- **FR-014**: Telegram notification failures MUST NOT affect submission persistence
  or the HTTP response returned to the submitter.
- **FR-015**: POST requests to non-existent or deleted form endpoints MUST return a
  404 response.
- **FR-016**: POST bodies exceeding 1 MB MUST be rejected with an appropriate HTTP
  error response.
- **FR-017**: The `_next` field value MUST be validated as an absolute HTTP or HTTPS
  URL before a redirect is issued; non-conforming values MUST fall back to the
  default success page.

### Key Entities

- **User**: A registered account identified by a unique email address. Holds
  authentication credentials, email-verification status, and account timestamps.
  A User owns one or more Forms.
- **Form**: A named submission endpoint owned by a User. Identified by a unique
  token that is part of the public submission URL. Stores creation timestamp,
  submission count, and an optional Telegram chat ID for notifications.
- **Submission**: A single POST event recorded for a Form. Stores a timestamp, a
  reference to the owning Form, and all submitted field name/value pairs (the `_next`
  field is excluded from storage).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can complete registration, verify their email, and create
  their first form in under 3 minutes.
- **SC-002**: A form submission (POST → save → redirect or success page)
  completes end-to-end in under 2 seconds under normal load.
- **SC-003**: 100% of valid POST submissions to an active endpoint are persisted;
  zero data loss on successful saves.
- **SC-004**: Telegram notifications are delivered within 10 seconds of a successful
  submission under normal conditions.
- **SC-005**: Users can view all their submissions with zero submissions from other
  users' forms appearing — verified by access-control testing across multiple
  accounts.
- **SC-006**: The `_next` redirect is correctly applied in 100% of valid
  redirect-scenario submissions, and the default success page is correctly shown in
  100% of invalid or absent `_next` scenarios.
- **SC-007**: 95% of users who complete email verification successfully create at
  least one form in their first session.

## Assumptions

- The platform uses a **single shared Telegram bot**. Users initiate notifications
  by messaging this bot to receive a chat ID, then entering that chat ID in the
  platform's form settings.
- **No field schema** is enforced at the form level; forms accept any field names and
  values in POST bodies (open endpoint model, consistent with Formspree's approach).
- **Standard session-based authentication** is used (cookie-backed sessions);
  OAuth2/SSO is out of scope for this version.
- Submissions are stored indefinitely in this version; a data-retention policy is a
  future enhancement.
- The default success page uses the HTTP `Referer` request header to populate the
  "go back" link; if the header is absent, the link is omitted gracefully.
- Spam protection and CAPTCHA integration are out of scope for this initial version.
- Password reset / "forgot password" flow is assumed to be in scope as a basic
  account-management requirement, though not explicitly described in the user stories
  above — to be detailed during planning.
