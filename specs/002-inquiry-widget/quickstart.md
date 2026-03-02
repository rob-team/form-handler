# Quickstart: B2B Inquiry Widget

**Feature Branch**: `002-inquiry-widget` | **Date**: 2026-03-02

## Prerequisites

- Node.js 18+ and npm
- PocketBase v0.36.x binary at `backend/pocketbase`
- Existing 001-form-saas setup running (shared PocketBase instance)

## Project Structure

```
form/
├── backend/                    # Existing PocketBase backend
│   ├── pb_hooks/
│   │   └── main.pb.js          # Extended with widget endpoints
│   └── pb_migrations/
│       ├── 1_create_forms.js    # Existing
│       ├── 2_create_submissions.js  # Existing
│       ├── 3_create_widgets.js  # NEW
│       ├── 4_create_inquiries.js    # NEW
│       └── 5_create_visitor_records.js  # NEW
├── frontend/                   # Existing Next.js dashboard
│   └── src/
│       └── app/
│           └── (dashboard)/
│               ├── dashboard/   # Extended with widget section
│               └── widgets/     # NEW - widget management pages
│                   └── [widgetId]/
│                       ├── page.tsx      # Inquiries list
│                       └── settings/
│                           └── page.tsx  # Widget config + embed code
├── widget/                     # NEW - Embeddable widget
│   ├── src/
│   │   ├── index.ts            # Entry point: Shadow DOM + mount
│   │   ├── App.tsx             # Main Preact component
│   │   ├── components/
│   │   │   ├── ChatBubble.tsx  # Floating button
│   │   │   ├── ChatWindow.tsx  # Conversation container
│   │   │   ├── QuestionStep.tsx    # Individual question renderer
│   │   │   └── SelectOptions.tsx   # Single-select option buttons
│   │   ├── styles/
│   │   │   └── widget.css      # All styles (injected into Shadow DOM)
│   │   └── lib/
│   │       └── api.ts          # REST calls to PocketBase
│   ├── build.mjs               # esbuild build script
│   └── package.json
└── specs/002-inquiry-widget/   # This feature's docs
```

## Setup

### 1. Install widget dependencies

```bash
cd widget
npm install
```

### 2. Run PocketBase (applies new migrations automatically)

```bash
cd backend
./pocketbase serve
```

New collections (`widgets`, `inquiries`, `visitor_records`) are created by migrations 3-5.

### 3. Run Next.js dashboard

```bash
cd frontend
npm run dev
```

### 4. Build widget bundle

```bash
cd widget
npm run build
# Output: widget/dist/widget.js
```

### 5. Serve widget bundle

For development, serve `widget/dist/widget.js` from a local server or configure Next.js to serve it as a static file.

For production, host `widget.js` on your CDN or from the same domain as PocketBase.

## Development Workflow

### Widget development

```bash
cd widget
npm run dev    # esbuild watch mode, rebuilds on change
```

Test by creating a simple `test.html`:

```html
<!DOCTYPE html>
<html>
<head><title>Widget Test</title></head>
<body>
  <h1>Test Page</h1>
  <script>
    window.FormHandler = {
      widgetId: "YOUR_WIDGET_ID",
      apiBase: "http://127.0.0.1:8090"
    };
  </script>
  <script src="http://localhost:8080/widget.js"></script>
</body>
</html>
```

### Running tests

```bash
cd frontend
npm test                # All tests (contract + e2e)
npm run test:contract   # API contract tests only
npm run test:e2e        # E2E tests only
```

## Key Configuration

| Variable | Location | Purpose |
|----------|----------|---------|
| `TELEGRAM_BOT_TOKEN` | `backend/.env` | Shared Telegram bot token (existing) |
| `FRONTEND_URL` | `backend/.env` | Frontend URL (existing) |
| `NEXT_PUBLIC_POCKETBASE_URL` | `frontend/.env.local` | PocketBase API URL (existing) |
| `NEXT_PUBLIC_WIDGET_URL` | `frontend/.env.local` | URL where widget.js is hosted (NEW) |

## Embed Code Format

The embed code users copy from the dashboard:

```html
<script>
  (function(w, d, s) {
    w.FormHandler = w.FormHandler || {};
    w.FormHandler.widgetId = "WIDGET_ID_HERE";
    w.FormHandler.apiBase = "https://api.yourdomain.com";
    var f = d.createElement(s), t = d.getElementsByTagName(s)[0];
    f.async = true;
    f.src = "https://widget.yourdomain.com/widget.js";
    t.parentNode.insertBefore(f, t);
  })(window, document, "script");
</script>
```
