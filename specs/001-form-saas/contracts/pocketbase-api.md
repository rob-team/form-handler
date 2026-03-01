# Contract: PocketBase REST API (Frontend-Facing)

**Version**: 1.0.0 | **Owner**: PocketBase built-in REST API + access rules

These are the standard PocketBase REST API endpoints used by the Next.js frontend.
All endpoints are provided by PocketBase's built-in API; no custom JS hooks required.
The base URL is `{POCKETBASE_URL}/api`.

Authentication is handled via Bearer token in the `Authorization` header (sent
automatically by the `pocketbase` npm SDK after login).

---

## Authentication Endpoints

### POST /api/collections/users/records — Register

Create a new user account.

**Request**:
```json
POST /api/collections/users/records
Content-Type: application/json

{
  "email":           "alice@example.com",
  "password":        "SecurePassword123",
  "passwordConfirm": "SecurePassword123"
}
```

**Response 200 OK**:
```json
{
  "id":       "abc123",
  "email":    "alice@example.com",
  "verified": false,
  "created":  "2026-03-01 10:00:00.000Z"
}
```

**Response 400 Bad Request** (validation error, e.g. duplicate email):
```json
{
  "code":    400,
  "message": "Failed to create record.",
  "data": {
    "email": { "code": "validation_not_unique", "message": "The email is already used." }
  }
}
```

**Post-registration**: Call the send-verification-email endpoint to trigger the
email confirmation flow.

---

### POST /api/collections/users/request-verification — Send Verification Email

Triggers PocketBase to send the email verification link.

**Request**:
```json
POST /api/collections/users/request-verification
Content-Type: application/json

{ "email": "alice@example.com" }
```

**Response**: 204 No Content (success, always — to prevent email enumeration).

---

### POST /api/collections/users/auth-with-password — Login

Authenticate with email and password. Returns auth token + user record.

**Request**:
```json
POST /api/collections/users/auth-with-password
Content-Type: application/json

{
  "identity": "alice@example.com",
  "password": "SecurePassword123"
}
```

**Response 200 OK**:
```json
{
  "token":  "eyJhbGciOiJIUzI1NiJ9...",
  "record": {
    "id":       "abc123",
    "email":    "alice@example.com",
    "verified": true,
    "created":  "2026-03-01 10:00:00.000Z"
  }
}
```

**Response 400 Bad Request** (invalid credentials):
```json
{ "code": 400, "message": "Failed to authenticate." }
```

---

### POST /api/collections/users/auth-refresh — Refresh Token

Refreshes the auth token. Called automatically by the PocketBase SDK.

**Request**:
```
POST /api/collections/users/auth-refresh
Authorization: Bearer {token}
```

**Response 200 OK**: Same structure as auth-with-password response.

---

### POST /api/collections/users/request-password-reset — Password Reset

Sends a password reset email.

**Request**:
```json
POST /api/collections/users/request-password-reset
Content-Type: application/json

{ "email": "alice@example.com" }
```

**Response**: 204 No Content.

---

## Forms Endpoints

### GET /api/collections/forms/records — List User's Forms

Returns all forms owned by the authenticated user.

**Request**:
```
GET /api/collections/forms/records?sort=-created&perPage=50
Authorization: Bearer {token}
```

**Response 200 OK**:
```json
{
  "page":       1,
  "perPage":    50,
  "totalItems": 3,
  "totalPages": 1,
  "items": [
    {
      "id":               "abc123def456",
      "name":             "Contact Form",
      "user":             "user123",
      "telegram_chat_id": "-100XXXXXXX",
      "created":          "2026-03-01 10:00:00.000Z",
      "updated":          "2026-03-01 10:00:00.000Z"
    }
  ]
}
```

---

### POST /api/collections/forms/records — Create Form

**Request**:
```json
POST /api/collections/forms/records
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Contact Form",
  "user": "{currentUserId}"
}
```

**Response 200 OK**: Single form record (same shape as list item).

**Response 400**: Validation error (name too short/long, etc.).

---

### PATCH /api/collections/forms/records/{formId} — Update Form

Used for renaming or updating `telegram_chat_id`.

**Request**:
```json
PATCH /api/collections/forms/records/{formId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Name"
}
```

**Response 200 OK**: Updated form record.

**Response 403**: Caller is not the owner.

---

### DELETE /api/collections/forms/records/{formId} — Delete Form

Cascades to delete all submissions for this form.

**Request**:
```
DELETE /api/collections/forms/records/{formId}
Authorization: Bearer {token}
```

**Response 204 No Content**: Deleted.

**Response 403**: Caller is not the owner.

---

## Submissions Endpoints

### GET /api/collections/submissions/records — List Submissions for a Form

**Request**:
```
GET /api/collections/submissions/records
    ?filter=form='{formId}'
    &sort=-created
    &perPage=20
    &page=1
Authorization: Bearer {token}
```

**Response 200 OK**:
```json
{
  "page":       1,
  "perPage":    20,
  "totalItems": 142,
  "totalPages": 8,
  "items": [
    {
      "id":      "xyz789",
      "form":    "abc123def456",
      "data":    { "name": "Alice", "email": "alice@example.com", "message": "Hello" },
      "created": "2026-03-01 12:30:00.000Z"
    }
  ]
}
```

**Response 403**: Caller is not the form owner.

---

### DELETE /api/collections/submissions/records/{submissionId} — Delete Submission

**Request**:
```
DELETE /api/collections/submissions/records/{submissionId}
Authorization: Bearer {token}
```

**Response 204 No Content**: Deleted.

**Response 403**: Caller is not the form owner.

---

## Contract Test Coverage (mandatory — Principle II)

All tests in `frontend/tests/contract/forms-api.spec.ts`:

| Test | Endpoint | Scenario | Expected |
|------|----------|----------|----------|
| CT-010 | POST /users/records | Register new user | 200, user created |
| CT-011 | POST /users/records | Duplicate email | 400, validation error |
| CT-012 | POST /users/auth-with-password | Valid credentials | 200, token returned |
| CT-013 | POST /users/auth-with-password | Invalid password | 400 |
| CT-014 | POST /forms/records | Authenticated, create form | 200, form with ID |
| CT-015 | GET /forms/records | Authenticated | 200, only caller's forms |
| CT-016 | GET /forms/records | Unauthenticated | 403 |
| CT-017 | PATCH /forms/records/{id} | Owner updates name | 200, name changed |
| CT-018 | PATCH /forms/records/{id} | Non-owner | 403 |
| CT-019 | DELETE /forms/records/{id} | Owner deletes | 204 |
| CT-020 | GET /submissions/records | Owner, filter by formId | 200, submissions list |
| CT-021 | GET /submissions/records | Non-owner's formId | 0 results or 403 |
