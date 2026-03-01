# Contract: Form Submission Endpoint

**Version**: 1.0.0 | **Owner**: PocketBase JS hook (`backend/pb_hooks/main.pb.js`)

This is the **public-facing** endpoint that external HTML forms and JavaScript
clients POST to. It is the core SaaS product feature (US3, FR-006–FR-009, FR-015–FR-017).

---

## POST /api/submit/{formId}

Submit data to a form endpoint. This endpoint is public — no authentication required.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `formId` | string | yes | The PocketBase record ID of the target form |

### Request

**Accepted Content-Types**:
- `application/x-www-form-urlencoded` (standard HTML form POST)
- `application/json`
- `multipart/form-data` (file uploads are ignored; text fields only saved)

**Body**: Any field name/value pairs. All fields are saved as strings except the
reserved `_next` routing directive.

**Reserved fields** (not stored in submission data):

| Field | Type | Description |
|-------|------|-------------|
| `_next` | string | Optional. If present and a valid absolute HTTP/HTTPS URL, the caller is redirected here after saving. |

**Body size limit**: 1 MB. Requests exceeding this limit are rejected.

**Example — form-encoded**:
```
POST /api/submit/abc123def456
Content-Type: application/x-www-form-urlencoded

name=Alice+Smith&email=alice%40example.com&message=Hello+world&_next=https%3A%2F%2Fmysite.com%2Fthank-you
```

**Example — JSON**:
```
POST /api/submit/abc123def456
Content-Type: application/json

{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "message": "Hello world",
  "_next": "https://mysite.com/thank-you"
}
```

### Responses

#### 302 Found — Redirect to `_next` (valid redirect URL present)

When the POST body includes a `_next` field containing a valid absolute `http://` or
`https://` URL.

```
HTTP/1.1 302 Found
Location: https://mysite.com/thank-you
```

The `_next` field is **not** stored in the submission record.

#### 302 Found — Redirect to success page (no valid `_next`)

When `_next` is absent or is not a valid absolute HTTP/HTTPS URL.

```
HTTP/1.1 302 Found
Location: {FRONTEND_URL}/success?ref={url-encoded-Referer}
```

- `ref` query parameter: the URL-encoded value of the HTTP `Referer` request header.
- If `Referer` is absent, the redirect goes to `{FRONTEND_URL}/success` with no `ref`
  parameter.

#### 404 Not Found — Form does not exist

```
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "code": 404,
  "message": "Form not found."
}
```

#### 413 Payload Too Large — Body exceeds 1 MB

```
HTTP/1.1 413 Request Entity Too Large
Content-Type: application/json

{
  "code": 413,
  "message": "Request body too large."
}
```

### Behaviour Rules

1. Data save happens **before** any redirect is issued.
2. If `_next` is present but not a valid absolute HTTP/HTTPS URL (malformed,
   relative path, non-HTTP scheme), fall back to the success page redirect.
3. The `_next` field is **never** stored in `submissions.data`.
4. Empty bodies (no fields posted) are accepted and stored as `{}`.
5. Telegram notifications fire asynchronously after the record is committed
   (via `onRecordAfterCreateSuccess`). Notification failures do not affect the
   HTTP response.

### CORS

All origins are permitted. No preflight required for standard HTML form POST.
JavaScript `fetch` POSTs will receive appropriate CORS headers.

---

## Success Page: GET /success (Next.js route)

Served by the Next.js frontend. Not a custom PocketBase endpoint.

| Query Parameter | Type | Required | Description |
|-----------------|------|----------|-------------|
| `ref` | string | no | URL-encoded referring page URL. Used for "Return to site" link. |

**Behaviour**:
- If `ref` is present and is a valid absolute HTTP/HTTPS URL: render a "Return to
  [hostname]" button linking to `ref`.
- If `ref` is absent or invalid: render a generic success message without a back link.
- The page renders using shadcn/ui components and matches the platform's design system.

---

## Contract Test Coverage (mandatory — Principle II)

All tests in `frontend/tests/contract/submission-api.spec.ts`:

| Test | Scenario | Expected |
|------|----------|----------|
| CT-001 | POST with valid `_next` URL | 302; `Location` = `_next` value |
| CT-002 | POST without `_next` | 302; `Location` starts with `{FRONTEND_URL}/success` |
| CT-003 | POST with invalid `_next` (not http/https) | 302; `Location` = success page |
| CT-004 | POST to non-existent formId | 404 |
| CT-005 | POST body > 1 MB | 413 |
| CT-006 | POST with `_next` → `_next` field absent from saved submission | verify via admin API |
| CT-007 | Empty POST body | 302; submission saved with `data = {}` |
| CT-008 | JSON Content-Type body | 302; data saved correctly |
