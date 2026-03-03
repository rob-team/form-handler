# Feature Specification: OAuth Login (Google & GitHub)

**Feature Branch**: `003-oauth-login`
**Created**: 2026-03-03
**Status**: Draft
**Input**: User description: "支持gmail和github用户oauth登录"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign In with Google (Priority: P1)

A returning dashboard user visits the login page and chooses to sign in with their Google account. They are redirected to Google's consent screen, authorize the application, and are redirected back to the dashboard fully authenticated. The entire process takes just a few clicks with no manual form-filling required.

**Why this priority**: Google (Gmail) accounts are the most widely used email provider globally, covering the largest share of potential users. Enabling Google sign-in removes the highest friction point for the majority of users.

**Independent Test**: Can be fully tested by clicking "Sign in with Google" on the login page, completing Google's consent flow, and verifying the user lands on the dashboard authenticated with correct profile information displayed.

**Acceptance Scenarios**:

1. **Given** a user with a Google account who has no existing account in the system, **When** they click "Sign in with Google" and authorize the application, **Then** a new account is created using their Google profile (name, email, avatar) and they are redirected to the dashboard as an authenticated user.
2. **Given** a user with a Google account who already has an account in the system (same email), **When** they click "Sign in with Google" and authorize, **Then** their Google identity is linked to the existing account and they are signed in.
3. **Given** an authenticated user on the dashboard, **When** they view their profile, **Then** they see their Google-provided name, email, and profile picture.

---

### User Story 2 - Sign In with GitHub (Priority: P2)

A dashboard user visits the login page and chooses to sign in with their GitHub account. They are redirected to GitHub's authorization screen, grant access, and are redirected back to the dashboard fully authenticated.

**Why this priority**: GitHub is commonly used by technical users and developers, who are a key audience for B2B SaaS tools. Supporting GitHub login provides a convenient option for this important user segment.

**Independent Test**: Can be fully tested by clicking "Sign in with GitHub" on the login page, completing GitHub's authorization flow, and verifying the user lands on the dashboard authenticated with correct profile information displayed.

**Acceptance Scenarios**:

1. **Given** a user with a GitHub account who has no existing account in the system, **When** they click "Sign in with GitHub" and authorize the application, **Then** a new account is created using their GitHub profile (name, email, avatar) and they are redirected to the dashboard as an authenticated user.
2. **Given** a user with a GitHub account who already has an account in the system (same email), **When** they click "Sign in with GitHub" and authorize, **Then** their GitHub identity is linked to the existing account and they are signed in.
3. **Given** a GitHub user whose email is set to private, **When** they sign in with GitHub, **Then** the system retrieves their primary verified email from GitHub and uses it for account creation or matching.

---

### User Story 3 - Account Linking and Provider Management (Priority: P3)

An existing dashboard user who originally signed up with one method (e.g., email/password or Google) wants to link an additional OAuth provider to their account. From their account settings, they can connect or disconnect OAuth providers for more flexible sign-in options.

**Why this priority**: Account linking allows users to consolidate identities and sign in with whichever method is most convenient at the time. This improves user experience but is not required for the core login flow.

**Independent Test**: Can be fully tested by signing in with one method, navigating to account settings, clicking "Connect Google" or "Connect GitHub", completing the OAuth flow, then signing out and signing back in with the newly linked provider.

**Acceptance Scenarios**:

1. **Given** an authenticated user in account settings, **When** they click "Connect Google" and complete the OAuth flow, **Then** their Google identity is linked to their account and they see Google listed as a connected provider.
2. **Given** an authenticated user with multiple connected providers, **When** they click "Disconnect" on one provider (while at least one other sign-in method remains), **Then** that provider is removed and they can no longer sign in with it.
3. **Given** an authenticated user with only one sign-in method, **When** they attempt to disconnect that method, **Then** the system prevents the action and displays a message explaining that at least one sign-in method must remain active.

---

### Edge Cases

- What happens when a user denies authorization on the OAuth provider's consent screen? The system displays a friendly message explaining the sign-in was cancelled and offers to retry or use an alternative method.
- What happens when the OAuth provider is temporarily unavailable? The system displays an error message suggesting the user try again later or use an alternative sign-in method.
- What happens when two different OAuth providers return the same email address? The system links both providers to the same account based on email matching.
- What happens when a user tries to link an OAuth account that is already linked to a different user? The system displays an error explaining that the OAuth account is already associated with another account.
- What happens when the OAuth provider returns incomplete profile data (e.g., no avatar)? The system gracefully handles missing fields by using default values (e.g., a generated avatar based on initials).
- What happens during concurrent sign-in attempts from the same user? The system handles race conditions gracefully, ensuring only one account is created.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to sign in using their Google account via the standard OAuth 2.0 authorization code flow.
- **FR-002**: System MUST allow users to sign in using their GitHub account via the standard OAuth 2.0 authorization code flow.
- **FR-003**: System MUST create a new user account when an OAuth sign-in is performed and no existing account matches the OAuth provider's email address.
- **FR-004**: System MUST link an OAuth identity to an existing account when the OAuth provider's email matches an existing user's email.
- **FR-005**: System MUST retrieve and store the user's display name, email address, and profile picture from the OAuth provider upon first sign-in.
- **FR-006**: System MUST display both "Sign in with Google" and "Sign in with GitHub" buttons on the login page alongside any existing sign-in methods.
- **FR-007**: System MUST allow authenticated users to connect additional OAuth providers from their account settings.
- **FR-008**: System MUST allow authenticated users to disconnect an OAuth provider, provided at least one other sign-in method remains active.
- **FR-009**: System MUST handle OAuth flow failures gracefully by displaying user-friendly error messages and providing recovery options.
- **FR-010**: System MUST protect against CSRF attacks during the OAuth flow by using a unique, unpredictable state parameter.
- **FR-011**: System MUST validate that the email returned by an OAuth provider is verified before using it for account matching or creation.
- **FR-012**: System MUST redirect the user to their originally requested page after successful OAuth authentication.

### Key Entities

- **User Account**: Represents a registered user in the system. Has a display name, email address, profile picture, and one or more linked authentication methods. Each account is uniquely identified by email address.
- **OAuth Identity**: Represents a link between a user account and an external OAuth provider. Contains the provider name (Google or GitHub), provider-specific user identifier, and associated profile data. A user account can have multiple OAuth identities, but each OAuth identity belongs to exactly one user account.
- **Authentication Session**: Represents an active user session after successful sign-in. Maintains the user's authenticated state across requests.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the full OAuth sign-in flow (from clicking the button to landing on the dashboard) in under 10 seconds, excluding time spent on the provider's consent screen.
- **SC-002**: 95% of first-time OAuth sign-in attempts result in a successfully created and authenticated account.
- **SC-003**: Users with existing accounts who sign in via OAuth are automatically matched and linked to their existing account 100% of the time when emails match.
- **SC-004**: The login page offers at least 3 sign-in options (Google, GitHub, and existing method) clearly visible without scrolling.
- **SC-005**: Zero users are locked out of their account as a result of OAuth provider linking or unlinking.

## Assumptions

- Dashboard/admin users are the target audience for OAuth login, not end-users who submit forms or inquiries via the widget.
- The existing authentication system supports adding additional sign-in methods alongside existing ones (e.g., email/password).
- Users' email addresses from OAuth providers are considered trustworthy for account matching when marked as verified by the provider.
- The system already has a user account model that can be extended with OAuth identity associations.
- Standard OAuth 2.0 authorization code grant flow is used (not implicit grant or other flows).
- Both Google and GitHub OAuth applications will be registered by the system administrator as part of deployment configuration.
