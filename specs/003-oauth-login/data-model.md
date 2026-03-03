# Data Model: OAuth Login (Google & GitHub)

**Feature**: 003-oauth-login
**Date**: 2026-03-03

## Entity Overview

```
┌──────────────────────┐       ┌──────────────────────────┐
│       users           │       │    _externalAuths         │
│  (PocketBase auth)    │ 1──N  │  (PocketBase system)      │
├──────────────────────┤       ├──────────────────────────┤
│ id          (string)  │       │ id            (string)    │
│ email       (string)  │◄──────│ recordId      (string)    │
│ name        (string)  │       │ collectionId  (string)    │
│ avatar      (file)    │       │ provider      (string)    │
│ verified    (bool)    │       │ providerId    (string)    │
│ created     (date)    │       │ created       (date)      │
│ updated     (date)    │       │ updated       (date)      │
└──────────────────────┘       └──────────────────────────┘
```

## Entities

### users (existing — extended)

PocketBase built-in auth collection. Already exists from 001-form-saas.

**New/modified fields for OAuth**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | text | No | Display name. Populated from OAuth provider on first sign-in via field mapping. May already exist if user set it manually. |
| `avatar` | file | No | Profile picture. Populated from OAuth provider's avatar URL on first sign-in via field mapping. Falls back to generated initials avatar in the UI if empty. |

**Notes**:
- The `name` and `avatar` fields may already exist on the users collection. If not, they must be added via the PocketBase Admin UI or a migration.
- PocketBase's OAuth2 field mapping feature (Admin UI > Collection > OAuth2 > Provider > Optional field mappings) handles automatic population on first sign-in.
- The `email` field is automatically set by PocketBase from the OAuth provider's verified email.
- The `verified` field is automatically set to `true` when a user signs in via OAuth (since the provider has already verified the email).

### _externalAuths (PocketBase system collection — no changes needed)

PocketBase automatically manages this system collection. It stores the link between a user record and their OAuth2 provider identity. **No migrations or configuration needed.**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique record ID |
| `collectionId` | string | References the auth collection (e.g., `_pb_users_auth_`) |
| `recordId` | string | References the user record ID |
| `provider` | string | Provider name: `"google"` or `"github"` |
| `providerId` | string | Provider's unique user identifier |
| `created` | datetime | When the link was created |
| `updated` | datetime | When the link was last updated |

**Behavior**:
- A record is created automatically when a user signs in with an OAuth provider for the first time.
- Multiple records can exist for the same user (one per provider).
- Each `provider` + `providerId` combination is unique — one OAuth account maps to exactly one PocketBase user.
- Records are deleted when `unlinkExternalAuth()` is called.

### Authentication Session (existing — no changes needed)

PocketBase manages sessions via JWT tokens stored in cookies. The existing cookie-based auth pattern in the Next.js frontend works identically for OAuth-authenticated users. No changes to session handling are needed.

## Relationships

```
users 1──N _externalAuths    (a user can have 0, 1, or 2 linked OAuth providers)
users 1──N forms              (existing, unchanged)
users 1──N widgets            (existing, unchanged)
```

## Validation Rules

- **Email uniqueness**: Enforced by PocketBase at the collection level. OAuth sign-in with a new email creates a new user; same email links to existing user.
- **Provider uniqueness**: Enforced by PocketBase. A Google/GitHub account can only be linked to one PocketBase user. Attempting to link an already-linked OAuth account to a different user will fail.
- **Minimum auth method**: Enforced in the frontend UI. The "Disconnect" button for a provider is disabled when it's the only remaining auth method. PocketBase itself does not enforce this — it is a UX safeguard.

## Migration Requirements

**Minimal**: The `name` and `avatar` fields likely need to be added to the users collection if they don't already exist. This can be done via:

1. **PocketBase Admin UI** (recommended for configuration-only changes): Add `name` (text field) and `avatar` (file field) to the users collection.
2. **Migration file** (if reproducibility is needed): Create `backend/pb_migrations/6_add_user_profile_fields.js` to add the fields programmatically.

No other schema changes are needed — `_externalAuths` is managed entirely by PocketBase.
