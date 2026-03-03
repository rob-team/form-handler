# API Contract: OAuth Authentication

**Feature**: 003-oauth-login
**Date**: 2026-03-03

All OAuth endpoints are provided by PocketBase's built-in auth system. No custom endpoints are needed.

## Endpoints

### 1. List Auth Methods

Discovers enabled authentication methods (email/password + OAuth2 providers) for rendering login buttons dynamically.

```
GET /api/collections/users/auth-methods
```

**Authentication**: None required

**Response** `200 OK`:
```json
{
  "password": {
    "enabled": true,
    "identityFields": ["email"]
  },
  "oauth2": {
    "enabled": true,
    "providers": [
      {
        "name": "google",
        "displayName": "Google",
        "state": "<random_state>",
        "codeVerifier": "<pkce_verifier>",
        "codeChallenge": "<pkce_challenge>",
        "codeChallengeMethod": "S256",
        "authURL": "https://accounts.google.com/o/oauth2/v2/auth?..."
      },
      {
        "name": "github",
        "displayName": "GitHub",
        "state": "<random_state>",
        "codeVerifier": "<pkce_verifier>",
        "codeChallenge": "<pkce_challenge>",
        "codeChallengeMethod": "S256",
        "authURL": "https://github.com/login/oauth/authorize?..."
      }
    ]
  }
}
```

**Notes**:
- The `providers` array only includes providers enabled in the PocketBase Admin UI.
- Each provider includes a pre-generated `state`, `codeVerifier`, and `authURL` for the authorization redirect.
- The popup-based SDK flow (`authWithOAuth2()`) uses these internally — the frontend does not need to parse them directly.

---

### 2. OAuth2 Redirect Callback

PocketBase's built-in OAuth2 callback handler. The OAuth provider redirects the user's popup to this URL after authorization.

```
GET /api/oauth2-redirect
```

**Query Parameters**:
- `code` (string): Authorization code from the OAuth provider
- `state` (string): CSRF protection state parameter

**Behavior**: PocketBase exchanges the code for tokens, creates/links the user account, and sends the result back to the parent window via the SSE realtime connection. The popup closes automatically.

**Notes**:
- This URL must be registered as the redirect URI in both Google Cloud Console and GitHub OAuth App settings.
- The frontend never calls this endpoint directly — it is the OAuth provider that redirects here.

---

### 3. OAuth2 Auth (via SDK)

The PocketBase JS SDK method that orchestrates the popup OAuth flow. This is not a direct HTTP endpoint — it is a client-side SDK method that coordinates multiple HTTP calls internally.

```typescript
pb.collection('users').authWithOAuth2({
  provider: 'google' | 'github'
})
```

**Response** (SDK return value):
```json
{
  "token": "<jwt_token>",
  "record": {
    "id": "user_record_id",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "avatar_filename.jpg",
    "verified": true,
    "created": "2026-03-03T10:00:00.000Z",
    "updated": "2026-03-03T10:00:00.000Z"
  },
  "meta": {
    "id": "provider_user_id",
    "name": "John Doe",
    "username": "johndoe",
    "email": "user@example.com",
    "isNew": true,
    "avatarURL": "https://lh3.googleusercontent.com/...",
    "rawUser": { },
    "accessToken": "ya29...",
    "refreshToken": "",
    "expiry": "2026-03-03T11:00:00.000Z"
  }
}
```

**Error cases**:
- User closes popup / denies authorization → SDK throws error with message indicating cancellation
- Provider unavailable → SDK throws network error
- OAuth account already linked to different user → PocketBase returns `400` error

---

### 4. List External Auths

Lists all OAuth providers linked to a user account. Used in the account settings page.

```
GET /api/collections/users/records/{userId}/external-auths
```

**Authentication**: Required (must be the user themselves or an admin)

**Response** `200 OK`:
```json
[
  {
    "id": "ext_auth_id_1",
    "collectionId": "_pb_users_auth_",
    "recordId": "user_record_id",
    "provider": "google",
    "providerId": "google_user_id",
    "created": "2026-03-03T10:00:00.000Z",
    "updated": "2026-03-03T10:00:00.000Z"
  },
  {
    "id": "ext_auth_id_2",
    "collectionId": "_pb_users_auth_",
    "recordId": "user_record_id",
    "provider": "github",
    "providerId": "github_user_id",
    "created": "2026-03-03T10:05:00.000Z",
    "updated": "2026-03-03T10:05:00.000Z"
  }
]
```

---

### 5. Unlink External Auth

Removes an OAuth provider link from a user account.

```
DELETE /api/collections/users/records/{userId}/external-auths/{provider}
```

**Authentication**: Required (must be the user themselves or an admin)

**Path Parameters**:
- `userId` (string): The user record ID
- `provider` (string): Provider name (`"google"` or `"github"`)

**Response** `204 No Content`: Provider successfully unlinked.

**Error cases**:
- `401 Unauthorized`: Not authenticated or not the record owner
- `404 Not Found`: Provider not linked to this user

**Notes**:
- PocketBase does not enforce a minimum auth method count — the frontend must prevent unlinking the last provider/password.

## Contract Test Matrix

| Test ID | Endpoint | Scenario | Expected |
|---------|----------|----------|----------|
| CT-OA-001 | List Auth Methods | No auth required, returns enabled providers | 200, includes google + github |
| CT-OA-002 | List Auth Methods | Returns password method status | 200, password.enabled = true |
| CT-OA-003 | List External Auths | Authenticated user lists own providers | 200, array of linked providers |
| CT-OA-004 | List External Auths | Unauthenticated request | 401 |
| CT-OA-005 | List External Auths | User with no OAuth providers | 200, empty array |
| CT-OA-006 | Unlink External Auth | Authenticated user unlinks provider | 204 |
| CT-OA-007 | Unlink External Auth | Unlink non-existent provider | 404 |
| CT-OA-008 | Unlink External Auth | Unauthenticated request | 401 |
