# FormSaaS

A self-hosted form submission platform (similar to Formspree/Getform). Collect form submissions from any website via a simple API endpoint, view them in a dashboard, and get notified via Telegram.

## Features

- **Instant form endpoints** — Create a form in the dashboard, get a URL, point any HTML form's `action` to it
- **No schema required** — Accepts any fields; all key-value pairs are stored as JSON
- **Submission dashboard** — View, paginate, and manage all submissions per form
- **Custom redirects** — Use the `_next` hidden field to redirect users to a custom thank-you page after submission
- **Telegram notifications** — Receive a message in Telegram for every new submission (per-form, optional)
- **User accounts** — Registration, login, password reset with email verification
- **Access control** — Each user only sees their own forms and submissions

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | PocketBase v0.36 (Go + SQLite)      |
| Frontend | Next.js 16, React 19, TypeScript    |
| UI       | shadcn/ui, Tailwind CSS v4          |
| Tests    | Playwright (API contract + E2E)     |

## Quick Start

```bash
# 1. Download PocketBase
bash scripts/download-pocketbase.sh

# 2. Start backend
cd backend
export $(cat .env | xargs)
./pocketbase superuser upsert admin@example.com YourPassword
./pocketbase serve --http=127.0.0.1:8090

# 3. Start frontend (in another terminal)
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000, register an account, and create your first form.

## Usage

### HTML Form Integration

```html
<form action="https://your-api.com/api/submit/FORM_ID" method="POST">
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  <textarea name="message"></textarea>
  <input type="hidden" name="_next" value="https://yoursite.com/thanks">
  <button type="submit">Send</button>
</form>
```

### API Submission

```bash
# Form-encoded
curl -X POST https://your-api.com/api/submit/FORM_ID \
  -d "name=John&email=john@example.com&message=Hello"

# JSON
curl -X POST https://your-api.com/api/submit/FORM_ID \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","message":"Hello"}'
```

### Special Fields

| Field    | Description                                                                 |
|----------|-----------------------------------------------------------------------------|
| `_next`  | Absolute URL (`https://...`) to redirect to after submission. Defaults to `/success` page. Not stored in submission data. |

## Project Structure

```
backend/
  pb_hooks/main.pb.js        # Submission endpoint + Telegram hook
  pb_migrations/              # Database schema (forms, submissions)
  .env                        # TELEGRAM_BOT_TOKEN, FRONTEND_URL

frontend/
  src/app/(auth)/             # Register, login, password reset
  src/app/(dashboard)/        # Form list, submission viewer, settings
  src/components/             # Form card, submission item, dialogs
  tests/contract/             # API contract tests (23 tests)
  tests/e2e/                  # Browser E2E tests (12 tests)
```

## Testing

```bash
# Run all 35 tests
cd frontend && npm test

# Run separately
npm run test:contract    # API tests against PocketBase
npm run test:e2e         # Browser tests against full stack
```

## Deployment

See [deployment.md](deployment.md) for production deployment instructions including systemd, PM2, and Nginx configuration.

## License

MIT
