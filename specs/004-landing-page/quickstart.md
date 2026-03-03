# Quickstart: Landing Page

**Branch**: `004-landing-page`

## Prerequisites

- Node.js 18+
- PocketBase backend running (see main README)
- Frontend dependencies installed (`cd frontend && npm install`)

## Setup Steps

### 1. Run PocketBase (if not already running)

```bash
cd backend
export $(cat .env | xargs)
./pocketbase serve --http=127.0.0.1:8090
```

Migration `7_seed_landing_page.js` runs automatically on startup and creates the system account, form endpoint, and widget configuration.

### 2. Get Seed Record IDs

After the first PocketBase start with the new migration, retrieve the seeded record IDs:

```bash
# Get the landing page form ID
curl -s http://127.0.0.1:8090/api/collections/forms/records \
  -H "Authorization: Bearer $(curl -s http://127.0.0.1:8090/api/admins/auth-with-password \
    -d '{"identity":"admin@example.com","password":"YourAdminPassword"}' | jq -r .token)" \
  | jq '.items[] | select(.name == "Landing Page Contact") | .id'

# Get the landing page widget ID
curl -s http://127.0.0.1:8090/api/collections/widgets/records \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.items[] | select(.name == "Landing Page Widget") | .id'
```

Or check the PocketBase admin UI at `http://127.0.0.1:8090/_/`.

### 3. Configure Frontend Environment

Add the seeded IDs to `frontend/.env.local`:

```env
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_WIDGET_URL=http://localhost:8080
NEXT_PUBLIC_LANDING_FORM_ID=<form_id_from_step_2>
NEXT_PUBLIC_LANDING_WIDGET_ID=<widget_id_from_step_2>
```

### 4. Start Frontend

```bash
cd frontend
npm run dev
```

### 5. Verify

- Visit `http://localhost:3000/` → should redirect to `/en` or `/zh` based on browser language
- Visit `http://localhost:3000/en` → English landing page
- Visit `http://localhost:3000/zh` → Chinese landing page
- Submit the "Contact Us" form → check PocketBase admin for new submission
- Click floating "Send Inquiry" widget → complete inquiry → check PocketBase admin for new inquiry
- Click "Get Started" → navigates to login page
- Log in → visit `/` → redirected to `/dashboard`

## Build & Test

```bash
cd frontend
npm run build          # Production build
npm run lint           # Lint check
npx playwright test    # E2E tests (ensure PocketBase is running)
```

## Optional: Configure Telegram Notifications

To receive Telegram notifications for landing page submissions/inquiries:

1. Open PocketBase admin UI
2. Find the "Landing Page Contact" form → edit → set `telegram_chat_id`
3. Find the "Landing Page Widget" widget → edit → set `telegram_chat_id`
