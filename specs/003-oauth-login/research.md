# Research: OAuth Login (Google & GitHub)

**Feature**: 003-oauth-login
**Date**: 2026-03-03

## Key Findings

### 1. PocketBase Built-in OAuth2 Support

**Decision**: Use PocketBase's native OAuth2 support — zero custom backend code needed for the core flow.

**Rationale**: PocketBase v0.36.x includes 32+ pre-configured OAuth2 providers (Google, GitHub, etc.) out of the box. The entire OAuth2 flow — authorization URL generation, token exchange, user creation, and session management — is handled by PocketBase internally.

**Alternatives considered**:
- Custom OAuth2 implementation in PocketBase JS hooks: Rejected — would duplicate built-in functionality and violate Principle V (Simplicity).
- Next.js NextAuth/Auth.js: Rejected — introduces a separate auth layer that conflicts with PocketBase's built-in auth system.

### 2. OAuth2 Provider Configuration

**Decision**: Configure providers via PocketBase Admin UI (no code or migrations required).

**Rationale**: PocketBase stores OAuth2 provider settings (client ID, client secret) in its internal database. Configuration is done through: Collections > users > Edit > Options > OAuth2 > Toggle provider > Enter credentials. The redirect URL for all providers must be `{POCKETBASE_URL}/api/oauth2-redirect`.

**Alternatives considered**:
- Environment variables for OAuth2 credentials: Not supported by PocketBase — Admin UI is the only configuration method.
- Migration-based configuration: PocketBase does not expose OAuth2 settings through migrations.

### 3. Client-Side Popup Flow

**Decision**: Use `pb.collection('users').authWithOAuth2({ provider: 'google' })` popup flow in Client Components.

**Rationale**: The PocketBase JS SDK's `authWithOAuth2()` method eagerly opens a popup, establishes an SSE realtime subscription, navigates the popup to the provider's consent screen, and automatically closes the popup after authorization. The existing cookie sync pattern (`authStore.onChange → document.cookie`) propagates auth state to Server Components. This is the simplest approach for a Next.js SPA-like dashboard.

**Alternatives considered**:
- Server-side code exchange (`authWithOAuth2Code()`): Requires building a callback Route Handler, manual PKCE handling, and cookie management. More complex with no clear benefit for this use case.
- Full-page redirect flow: Worse UX (page reload) and requires storing state across navigations.

### 4. Account Linking by Email

**Decision**: Rely on PocketBase's automatic email-based account linking.

**Rationale**: PocketBase automatically links OAuth2 identities to existing user accounts when the email matches. If a user registers with email/password as `user@example.com`, then signs in with Google using the same email, PocketBase links the Google identity to the existing account. This satisfies FR-004 with zero custom code.

**Security note** (v0.22.14+): When an unverified password-based account exists and a user signs in via OAuth2 with the same email, PocketBase resets the password on the password-based account to prevent pre-registration attacks.

**Alternatives considered**:
- Custom account merging logic in hooks: Rejected — PocketBase already does this correctly.

### 5. Profile Data (Name, Avatar)

**Decision**: Use PocketBase Admin UI field mappings to auto-populate `name` and `avatar` fields.

**Rationale**: PocketBase v0.23+ supports optional field mappings in the Admin UI for each OAuth2 provider. By configuring these mappings, the `name` and `avatar` fields on the user record are automatically populated from the OAuth2 provider data on first sign-in. This requires no client-side code.

**Fallback**: If field mappings are insufficient (e.g., for avatar file upload), a post-auth update can be done client-side:

```typescript
const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
if (authData.meta?.isNew && authData.meta?.name) {
  await pb.collection('users').update(authData.record.id, { name: authData.meta.name });
}
```

**Alternatives considered**:
- Always update profile on every sign-in: Rejected — unnecessary writes; only needed on first sign-in or when user explicitly refreshes.

### 6. External Auth Records

**Decision**: Use PocketBase's built-in `_externalAuths` system collection for provider management.

**Rationale**: PocketBase stores OAuth2 identities in the `_externalAuths` collection with fields: `collectionId`, `recordId`, `provider`, `providerId`, `created`, `updated`. The SDK provides:
- `pb.collection('users').listExternalAuths(userId)` — list linked providers
- `pb.collection('users').unlinkExternalAuth(userId, 'google')` — disconnect a provider

This satisfies FR-007 (connect providers) and FR-008 (disconnect providers).

**Alternatives considered**:
- Custom collection for OAuth identities: Rejected — would duplicate the built-in `_externalAuths` system.

### 7. Provider Discovery

**Decision**: Use `pb.collection('users').listAuthMethods()` to dynamically render login buttons.

**Rationale**: This API returns all enabled auth methods (email/password + OAuth2 providers) for the collection. The login page queries this on load and renders buttons only for enabled providers. This means adding/removing providers in the Admin UI is automatically reflected on the login page without code changes.

**Alternatives considered**:
- Hardcoded provider list: Rejected — fragile; adding a new provider would require a code change.

### 8. CSRF Protection (State Parameter)

**Decision**: Rely on PocketBase SDK's built-in PKCE + state parameter handling.

**Rationale**: The `authWithOAuth2()` method automatically generates and validates the `state` parameter and uses PKCE (Proof Key for Code Exchange) for the authorization code flow. This satisfies FR-010 with zero custom code.

**Alternatives considered**:
- Custom state parameter generation: Rejected — the SDK already handles this securely.

### 9. Redirect After Auth (FR-012)

**Decision**: Store the originally requested URL in sessionStorage before initiating OAuth, redirect after successful auth.

**Rationale**: Since the OAuth flow happens in a popup (not a full-page redirect), the parent page remains intact. After `authWithOAuth2()` resolves successfully, the client can simply navigate to the dashboard or the stored URL. If the user was redirected to `/login` by the auth guard, the original URL can be passed as a query parameter (e.g., `/login?redirect=/widgets/abc`).

**Alternatives considered**:
- Cookie-based redirect storage: More complex, risk of stale cookies.
- Always redirect to dashboard: Simpler but loses context of where the user was going.

## Summary Table

| Question | Decision |
|----------|----------|
| OAuth2 backend approach | PocketBase built-in (zero backend code) |
| Provider configuration | PocketBase Admin UI |
| Client auth flow | Popup-based `authWithOAuth2()` in Client Components |
| Account linking | Automatic by PocketBase (email match) |
| Profile data (name, avatar) | Admin UI field mappings + optional client-side fallback |
| OAuth identity storage | Built-in `_externalAuths` collection |
| Provider discovery | `listAuthMethods()` API |
| CSRF protection | SDK built-in PKCE + state |
| Post-auth redirect | Query parameter on login URL + client-side navigation |
