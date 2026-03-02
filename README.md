# FormHandler

<p align="center">
  <img src="docs/logo-preview.svg" alt="FormHandler Logo" width="280" />
</p>

<p align="center">
  A self-hosted form submission &amp; B2B inquiry platform.<br/>
  Collect form submissions from any website via a simple API endpoint, embed a conversational inquiry widget, view everything in a dashboard, and get notified via Telegram.
</p>

## Features

### Form Endpoints
- **Instant form endpoints** — Create a form in the dashboard, get a URL, point any HTML form's `action` to it
- **No schema required** — Accepts any fields; all key-value pairs are stored as JSON
- **Custom redirects** — Use the `_next` hidden field to redirect users to a custom thank-you page after submission

### Inquiry Widget
- **Embeddable chat widget** — A lightweight (~9 KB gzipped) conversational form that runs on any website
- **Conversational UI** — Questions appear one at a time in a chat-like interface
- **Shadow DOM isolation** — Widget styles never conflict with the host page
- **Mobile-ready** — Full-screen on mobile, floating window on desktop
- **Cross-browser** — ES2015 target, works in all modern browsers and iOS Safari

### Dashboard
- **Submission dashboard** — View, paginate, and manage all submissions per form
- **Inquiry viewer** — Browse inquiry responses with country badges, expandable details, and filtering
- **Visitor analytics** — Track total visits, unique visitors, and top countries per widget
- **Widget management** — Create, configure questions, toggle active/inactive, embed code snippets

### Notifications & Auth
- **Telegram notifications** — Receive a message in Telegram for every new submission or inquiry (per-form/widget, optional)
- **User accounts** — Registration, login, password reset with email verification
- **Access control** — Each user only sees their own forms, widgets, and submissions

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | PocketBase v0.36 (Go + SQLite)      |
| Frontend | Next.js 16, React 19, TypeScript    |
| Widget   | Preact, esbuild (IIFE bundle)       |
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

Open http://localhost:3000, register an account, and create your first form or widget.

### Try the Demo

With both services running, open http://127.0.0.1:8090/ to see the widget demo page. It auto-creates a test widget so you can interact with the conversational form immediately.

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

### Widget Integration

```html
<script>
  window.FormHandler = {
    widgetId: "YOUR_WIDGET_ID",
    apiBase: "https://your-api.com"
  };
</script>
<script src="https://your-cdn.com/widget.js"></script>
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
  pb_hooks/main.pb.js        # API endpoints (submit, widget, visit, stats) + Telegram hooks
  pb_migrations/              # Database schema (forms, submissions, widgets, inquiries, visitor_records)
  pb_public/                  # Demo page served at PocketBase root URL
  .env                        # TELEGRAM_BOT_TOKEN, FRONTEND_URL

frontend/
  src/app/(auth)/             # Register, login, password reset
  src/app/(dashboard)/        # Form list, submission viewer, widget management, settings
  src/components/             # Form card, widget card, inquiry item, question editor, etc.
  tests/contract/             # API contract tests (53 tests)
  tests/e2e/                  # Browser E2E tests (18 tests)

widget/
  src/                        # Preact widget source (App, ChatBubble, ChatWindow, etc.)
  dist/widget.js              # Built IIFE bundle (~9 KB gzipped)

demo/
  index.html                  # Standalone demo page (also served from pb_public/)

docs/
  logo-preview.svg            # Logo for README
```

## Testing

```bash
# Run all 71 tests
cd frontend && npm test

# Run separately
npm run test:contract    # 53 API contract tests against PocketBase
npm run test:e2e         # 18 browser E2E tests against full stack
```

## Deployment

See [deployment.md](deployment.md) for production deployment instructions including systemd, PM2, Nginx, and widget CDN configuration.

## License

MIT
