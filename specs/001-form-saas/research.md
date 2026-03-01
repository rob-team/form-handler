# Research: SaaS Form Submission Platform

**Branch**: `001-form-saas` | **Date**: 2026-03-01

## PocketBase JSVM Hooks

**Decision**: Target PocketBase v0.23+ (current stable: v0.36.x).

**Rationale**: v0.23 was a major breaking refactor — it replaced the echo router with
the Go 1.22 `net/http` mux, merged `Dao` into `$app`, and changed path parameter
syntax from `:param` to `{param}`. All examples and documentation going forward use
the new API.

**Caveats**:
- PocketBase is pre-v1.0 and does not guarantee backward compatibility between minor
  versions.
- The JS engine is **goja** (ES5 + most ES6). No ESM (`import/export`); no
  `async/await`; no `setTimeout`. All JSVM code is **synchronous**.

---

## Custom Route Registration

**Decision**: Use `routerAdd(method, path, handler, ...middlewares)` in
`pb_hooks/main.pb.js`.

Key APIs on the route event `e`:

| API | Purpose |
|-----|---------|
| `e.request.pathValue("name")` | Path parameter e.g. `{formId}` |
| `e.request.header.get("Referer")` | Request header |
| `e.bindBody(new DynamicModel({...}))` | Parse JSON or form-encoded body |
| `e.requestInfo().body` | Parsed body as plain JS object |
| `e.redirect(302, url)` | Issue HTTP redirect (status 300–399) |
| `e.html(200, htmlStr)` | Return HTML response |
| `e.json(200, obj)` | Return JSON response |

**Example — submission endpoint**:
```javascript
routerAdd("POST", "/api/submit/{formId}", (e) => {
    const formId = e.request.pathValue("formId")
    const body   = e.requestInfo().body   // handles JSON + form-encoded
    const next   = body["_next"] || ""
    delete body["_next"]

    // ... save, redirect ...
}, $apis.bodyLimit(1 * 1024 * 1024))  // 1 MB limit as middleware
```

**Body parsing**: `e.requestInfo().body` returns a plain JS object for both
`application/json` and `application/x-www-form-urlencoded`. No manual
Content-Type switch needed.

**Body size limit**: Default is 32 MB. Apply `$apis.bodyLimit(1048576)` as a
middleware argument to enforce the 1 MB requirement (FR-016).

---

## Admin-Level Record Operations

**Decision**: Use `new Record(collection)` + `$app.save(record)` for admin-level
writes inside hooks. This bypasses access rules.

```javascript
const col     = $app.findCollectionByNameOrId("submissions")
const record  = new Record(col)
record.set("form", formId)
record.set("data", JSON.stringify(data))
$app.save(record)
```

Key `$app` DB methods:
- `$app.findCollectionByNameOrId(name)` — fetch collection definition
- `$app.findRecordById(col, id)` — fetch single record
- `$app.findFirstRecordByData(col, field, value)` — find first match
- `$app.save(record)` — save with validation (admin-level)
- `$app.delete(record)` — delete a record

---

## After-Create Hook for Telegram Notifications

**Decision**: Use `onRecordAfterCreateSuccess` scoped to the `submissions`
collection. Fires only after the DB transaction commits, so side effects are safe.

```javascript
onRecordAfterCreateSuccess((e) => {
    // send Telegram notification
    e.next()   // MUST call e.next() to continue hook chain
}, "submissions")
```

Wrap `$http.send()` in try/catch so a Telegram failure does not propagate an
error back to the hook chain (FR-014).

---

## Outbound HTTP (`$http.send()`)

**Decision**: Use `$http.send(config)` for Telegram Bot API calls. Synchronous
and blocking; set a short timeout.

```javascript
try {
    $http.send({
        url:     "https://api.telegram.org/bot" + token + "/sendMessage",
        method:  "POST",
        body:    JSON.stringify({ chat_id: chatId, text: msg }),
        headers: { "content-type": "application/json" },
        timeout: 8,
    })
} catch (err) {
    console.error("Telegram notification error:", err)
}
```

**Secret storage**: Bot token via `$os.getenv("TELEGRAM_BOT_TOKEN")`. Never
hardcode in hook files.

---

## Telegram Notification Strategy

**Decision**: Outbound-only `sendMessage` HTTP calls. No webhook or polling
required because the platform bot only **sends** notifications — it never needs
to receive incoming messages for the notification feature.

User chat ID acquisition flow (manual, for MVP):
1. User starts a conversation with the platform's bot on Telegram.
2. User forwards their chat ID obtained from `@userinfobot` (or any method).
3. User enters the chat ID in the form's Telegram settings in the dashboard.

Webhook-based chat ID discovery (optional future enhancement):
- Register `POST /api/telegram-webhook` as a PocketBase custom route.
- Set the webhook URL via Telegram's `setWebhook` API (requires public HTTPS).
- Bot receives `/start` messages and replies with the chat ID.

**Deferred**: Webhook implementation deferred to a future iteration. MVP uses
manual chat ID entry.

---

## CORS for Submission Endpoint

**Decision**: PocketBase default CORS middleware allows all origins (`*`). No
additional CORS configuration required for the submission endpoint.

**Rationale**: External HTML `<form>` POSTs do not trigger a CORS preflight
(browser sends a simple request). JavaScript `fetch`-based POSTs will use the
default CORS headers. The `--origins="*"` PocketBase startup flag keeps the
default permissive setting.

---

## PocketBase + Next.js Integration

**Decision**: Two PocketBase client patterns — singleton in browser, new instance
per request on server.

**Browser (Client Components)**:
```typescript
// lib/pocketbase-browser.ts
let client: PocketBase | null = null
export function getPocketBase(): PocketBase {
    if (!client) {
        client = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
        client.authStore.loadFromCookie(document.cookie)
        client.authStore.onChange(() => {
            document.cookie = client!.authStore.exportToCookie({ httpOnly: false })
        })
    }
    return client
}
```

**Server (Server Components / Server Actions)**:
```typescript
// lib/pocketbase-server.ts
export async function getServerPocketBase(): Promise<PocketBase> {
    const cookieStore = await cookies()
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
    const authCookie = cookieStore.get("pb_auth")
    if (authCookie) {
        pb.authStore.loadFromCookie(`${authCookie.name}=${authCookie.value}`)
    }
    return pb
}
```

**Never** export a module-level singleton for server use — concurrent requests
share mutable `authStore`, causing cross-user auth leakage.

---

## Playwright for API Contract Tests and E2E

**Decision**: Use Playwright for both API contract tests (via `request` fixture)
and E2E browser tests.

**API contract test pattern**:
```typescript
test("POST /api/submit/:id → 302 redirect", async ({ request }) => {
    const res = await request.post(`/api/submit/${formId}`, {
        form: { name: "Alice", email: "alice@example.com" },
        maxRedirects: 0,   // intercept the 302 before following it
    })
    expect(res.status()).toBe(302)
    expect(res.headers()["location"]).toBeDefined()
})
```

Key options:
- `form: {}` — sends `application/x-www-form-urlencoded`
- `data: {}` — sends `application/json`
- `maxRedirects: 0` — returns the 3xx response directly (do not follow)
- `failOnStatusCode: false` (default) — allows asserting on error status codes

**E2E tests**: Use `@playwright/test` browser tests to simulate real user journeys
(register → login → create form → submit → view submissions).

---

## Alternatives Considered

| Topic | Chosen | Rejected | Reason |
|-------|--------|----------|--------|
| PocketBase extensions | JavaScript (JSVM hooks) | Go plugins | User requirement: JS only |
| Deployment | Binary + Node.js process | Docker | User requirement: no Docker |
| Frontend framework | Next.js 15 (App Router) | Remix, SvelteKit | User specification |
| UI library | shadcn/ui | Chakra UI, MUI | User specification |
| E2E testing | Playwright | Cypress | Playwright handles both API + browser; Vitest for unit if needed |
| Submission success page | Next.js `/success` page (redirected to) | PocketBase-served HTML | Allows shadcn/ui styling; clean separation of concerns |
| Form token | PocketBase record ID | Separate UUID field | Simpler; PocketBase IDs are already unique and URL-safe |
