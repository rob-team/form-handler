# Quickstart: SaaS Form Submission Platform

**Branch**: `001-form-saas` | **Date**: 2026-03-01

## Prerequisites

- macOS or Linux (no Docker required)
- Node.js 20+ and npm
- Internet access (to download PocketBase binary and npm packages)

---

## 1. Download PocketBase

```bash
# From the repo root:
bash scripts/download-pocketbase.sh
```

This script downloads the appropriate PocketBase binary for your OS/arch into
`backend/pocketbase` and makes it executable. The binary is gitignored.

Alternatively, download manually from https://github.com/pocketbase/pocketbase/releases
and place it at `backend/pocketbase`.

---

## 2. Configure Environment

**Backend** — create `backend/.env`:
```bash
TELEGRAM_BOT_TOKEN=<your-telegram-bot-token>
```

**Frontend** — create `frontend/.env.local`:
```bash
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

---

## 3. Start PocketBase

```bash
cd backend
TELEGRAM_BOT_TOKEN=<token> ./pocketbase serve --origins="*"
```

On first run, PocketBase creates the `pb_data/` directory and auto-generates the
SQLite database. Visit `http://127.0.0.1:8090/_/` to open the admin dashboard.

**Create your superuser account** on first run when prompted.

The JS hooks in `pb_hooks/main.pb.js` are loaded automatically — no additional
configuration needed.

---

## 4. Apply PocketBase Schema

Collections (`forms`, `submissions`) are defined in `backend/pb_migrations/`.
PocketBase auto-applies migrations on startup. Verify in the admin dashboard
(`http://127.0.0.1:8090/_/`) that both collections exist with the correct fields
and access rules.

---

## 5. Configure Email (SMTP)

In the PocketBase admin dashboard → Settings → Mail:
- Set your SMTP credentials for email verification and password reset.
- For local development, use a service like Mailtrap or Mailpit.

---

## 6. Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

## 7. Start the Frontend

```bash
cd frontend
npm run dev
```

The Next.js app runs at `http://localhost:3000`.

---

## 8. Verify the Full Flow

1. Open `http://localhost:3000/register` and create an account.
2. Check your email (or the Mailpit inbox) for the verification link and click it.
3. Log in at `http://localhost:3000/login`.
4. On the dashboard, click **New Form** and give it a name.
5. Copy the form's submission URL (displayed on the form card).
6. Test the submission endpoint:

```bash
# Without _next — should show the default success page
curl -X POST http://127.0.0.1:8090/api/submit/<formId> \
  -d "name=Test&email=test@example.com&message=Hello" \
  -L   # follow redirects

# With _next — should redirect to https://example.com
curl -X POST http://127.0.0.1:8090/api/submit/<formId> \
  -d "name=Test&email=test@example.com&_next=https://example.com" \
  -v   # see headers to confirm redirect
```

7. Return to the dashboard, click the form, and verify the submission appears.

---

## 9. Telegram Notification Setup (optional)

1. Create a bot via Telegram's @BotFather and copy the bot token.
2. Set `TELEGRAM_BOT_TOKEN=<token>` in `backend/.env` and restart PocketBase.
3. Find your Telegram chat ID using @userinfobot or any similar bot.
4. In the dashboard, navigate to a form's Settings and enter the chat ID.
5. Submit a test POST to that form — a Telegram notification should arrive within
   a few seconds.

---

## 10. Run Tests

### API Contract Tests (mandatory)

Requires PocketBase running on `http://127.0.0.1:8090`.

```bash
cd frontend
npm run test:contract
```

### E2E Tests (mandatory for P1 user stories)

Requires both PocketBase and Next.js running.

```bash
cd frontend
npm run test:e2e
```

### All Tests

```bash
cd frontend
npm run test
```

---

## Development Scripts Reference

| Command | Directory | Purpose |
|---------|-----------|---------|
| `./pocketbase serve --origins="*"` | `backend/` | Start PocketBase |
| `npm run dev` | `frontend/` | Start Next.js dev server |
| `npm run build` | `frontend/` | Production build |
| `npm run lint` | `frontend/` | ESLint check |
| `npm run test:contract` | `frontend/` | API contract tests (Playwright) |
| `npm run test:e2e` | `frontend/` | E2E browser tests (Playwright) |
| `npm run test` | `frontend/` | All tests |
| `bash scripts/download-pocketbase.sh` | repo root | Download PocketBase binary |

---

## Troubleshooting

**"Form not found" on POST**: Verify the `formId` in the URL matches an existing
record in PocketBase admin (`http://127.0.0.1:8090/_/` → Collections → forms).

**PocketBase hook not loading**: Ensure `backend/pb_hooks/main.pb.js` exists and has
no JavaScript syntax errors. Check PocketBase console output on startup.

**CORS error in browser**: Confirm PocketBase is started with `--origins="*"` flag.

**Email verification not arriving**: Check SMTP settings in PocketBase admin →
Settings → Mail. Use Mailpit (`http://localhost:8025`) for local testing.

**Telegram notification not firing**: Verify `TELEGRAM_BOT_TOKEN` environment
variable is set and the chat ID in form settings is correct (include negative sign
for group/channel IDs, e.g. `-100XXXXXXXXXX`).
