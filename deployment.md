# FormHandler Deployment Guide

## Architecture

```
                          ┌──────────────────┐
┌─────────────┐           │  PocketBase      │
│  Next.js    │──────────▶│  :8090           │──────▶ Telegram API
│  :3000      │           │                  │
└─────────────┘           │  pb_public/      │
                          │  (widget demo)   │
  Frontend                └──────────────────┘
                            Backend + DB
                                 ▲
                                 │
┌─────────────┐                  │
│  widget.js  │  (embed on any   │
│  (~9 KB)    │   third-party ───┘
│             │   website)
└─────────────┘
  Inquiry Widget
```

- **Backend**: PocketBase v0.36.5 (single binary, embedded SQLite)
- **Frontend**: Next.js 16 (Node.js 20+)
- **Widget**: Preact IIFE bundle (~9 KB gzipped), loaded via `<script>` tag

---

## 1. Prerequisites

- Node.js 20+
- npm
- curl, unzip (for downloading PocketBase)

---

## 2. Clone & Install

```bash
git clone <repo-url> form
cd form
```

### 2.1 Download PocketBase

```bash
bash scripts/download-pocketbase.sh
```

This downloads the PocketBase binary to `backend/pocketbase`.

### 2.2 Install frontend dependencies

```bash
cd frontend
npm install
```

### 2.3 Build the widget (optional — pre-built in `widget/dist/`)

```bash
cd widget
npm install
npm run build
```

The built file `widget/dist/widget.js` is also copied to `backend/pb_public/widget.js` for the demo page.

---

## 3. Configure Environment

### 3.1 Backend (`backend/.env`)

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
TELEGRAM_BOT_TOKEN=<your-telegram-bot-token>
FRONTEND_URL=http://localhost:3000
```

- `TELEGRAM_BOT_TOKEN` — Get from [@BotFather](https://t.me/BotFather). Leave empty to disable notifications.
- `FRONTEND_URL` — The URL where the frontend is accessible. Used for redirect after form submission.

### 3.2 Frontend (`frontend/.env.local`)

```bash
cp frontend/.env.local.example frontend/.env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_WIDGET_URL=http://localhost:8080
```

For production, replace with your actual domains:

```env
NEXT_PUBLIC_POCKETBASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_WIDGET_URL=https://cdn.yourdomain.com/widget.js
```

---

## 4. Start Services

### 4.1 Start PocketBase (Backend)

```bash
cd backend
export $(cat .env | xargs)
./pocketbase serve --http=127.0.0.1:8090
```

On first run, PocketBase will:
- Create the SQLite database (`pb_data/data.db`)
- Run migrations (create `forms`, `submissions`, `widgets`, `inquiries`, `visitor_records` collections)
- Prompt you to create a superuser

Create the superuser:

```bash
./pocketbase superuser upsert admin@yourdomain.com YourSecurePassword
```

### 4.2 Start Next.js (Frontend)

Development:

```bash
cd frontend
npm run dev
```

Production:

```bash
cd frontend
npm run build
npm run start
```

---

## 5. Production Deployment

### 5.1 PocketBase

PocketBase is a single binary with embedded database. Recommended setup:

```bash
# Run as a systemd service (Linux)
# /etc/systemd/system/pocketbase.service

[Unit]
Description=PocketBase
After=network.target

[Service]
Type=simple
User=pocketbase
WorkingDirectory=/opt/form/backend
EnvironmentFile=/opt/form/backend/.env
ExecStart=/opt/form/backend/pocketbase serve --http=127.0.0.1:8090
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable pocketbase
sudo systemctl start pocketbase
```

### 5.2 Next.js

```bash
# Build
cd frontend
npm run build

# Run with PM2
pm2 start npm --name "formhandler" -- start
```

### 5.3 Widget CDN

The widget is a single JavaScript file (`widget/dist/widget.js`, ~9 KB gzipped). Hosting options:

1. **From PocketBase** — Already served at `https://api.yourdomain.com/widget.js` via `pb_public/`
2. **CDN** — Upload `widget.js` to any CDN (Cloudflare R2, S3+CloudFront, etc.)
3. **Self-hosted static** — Serve from Nginx directly

Update `NEXT_PUBLIC_WIDGET_URL` in the frontend `.env.local` to match where you host the widget.

### 5.4 Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/formhandler

# Frontend
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API (also serves widget demo and widget.js from pb_public)
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    client_max_body_size 2M;

    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache widget.js aggressively
    location = /widget.js {
        proxy_pass http://127.0.0.1:8090;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=86400";
    }
}
```

---

## 6. Verify Deployment

### 6.1 Health check

```bash
curl http://127.0.0.1:8090/api/health
# {"message":"API is healthy.","code":200,"data":{}}
```

### 6.2 Register a user

```bash
curl -s -X POST http://127.0.0.1:8090/api/collections/users/records \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password12345","passwordConfirm":"Password12345"}'
```

### 6.3 Login

```bash
curl -s -X POST http://127.0.0.1:8090/api/collections/users/auth-with-password \
  -H "Content-Type: application/json" \
  -d '{"identity":"test@example.com","password":"Password12345"}'
```

Save the `token` and `record.id` from the response.

### 6.4 Create a form

```bash
curl -s -X POST http://127.0.0.1:8090/api/collections/forms/records \
  -H "Authorization: <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Contact Form","user":"<user-id>"}'
```

### 6.5 Test form submission

```bash
curl -s -X POST http://127.0.0.1:8090/api/submit/<form-id> \
  -d "name=John&email=john@example.com&message=Hello" \
  -w "\nHTTP Status: %{http_code}\nRedirect: %{redirect_url}\n"
# Expected: HTTP Status: 302, Redirect: http://localhost:3000/success?ref=
```

### 6.6 Create a widget

```bash
curl -s -X POST http://127.0.0.1:8090/api/collections/widgets/records \
  -H "Authorization: <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test Widget",
    "user":"<user-id>",
    "button_text":"Send Inquiry",
    "greeting":"Hello! Please answer a few questions.",
    "active":true,
    "questions":[
      {"id":"q1","label":"Country?","type":"text","required":true,"options":null},
      {"id":"q2","label":"Company","type":"text","required":true,"options":null},
      {"id":"q3","label":"Quantity","type":"single-select","required":true,"options":["< 100","100-500","500+"]},
      {"id":"q4","label":"Email","type":"email","required":true,"options":null}
    ]
  }'
```

### 6.7 Test widget config endpoint

```bash
curl -s http://127.0.0.1:8090/api/widget/<widget-id>
# Returns: {"id":"...","button_text":"Send Inquiry","greeting":"...","questions":[...]}
```

### 6.8 Test widget inquiry submission

```bash
curl -s -X POST http://127.0.0.1:8090/api/widget/<widget-id>/submit \
  -H "Content-Type: application/json" \
  -d '{
    "responses":[
      {"question_id":"q1","question_label":"Country?","answer":"Germany"},
      {"question_id":"q2","question_label":"Company","answer":"Acme GmbH"},
      {"question_id":"q3","question_label":"Quantity","answer":"100-500"},
      {"question_id":"q4","question_label":"Email","answer":"test@acme.com"}
    ],
    "page_url":"https://example.com"
  }'
# Expected: {"success":true,"id":"..."}
```

### 6.9 Widget demo page

Open http://127.0.0.1:8090/ in a browser to use the interactive widget demo. The demo auto-creates a test user and widget, so you can try the full flow immediately.

### 6.10 HTML widget integration example

```html
<script>
  window.FormHandler = {
    widgetId: "<widget-id>",
    apiBase: "https://api.yourdomain.com"
  };
</script>
<script src="https://api.yourdomain.com/widget.js"></script>
```

---

## 7. Telegram Notifications

1. Create a bot via [@BotFather](https://t.me/BotFather) and get the token
2. Set `TELEGRAM_BOT_TOKEN` in `backend/.env`
3. Get your chat ID by messaging [@userinfobot](https://t.me/userinfobot)
4. In the dashboard, go to a form's or widget's **Settings** page and enter the chat ID
5. Each new submission or inquiry will send a Telegram message with all submitted fields

---

## 8. Upgrading from 001 (Form SaaS) to 002 (+ Inquiry Widget)

This section covers upgrading from the `001-form-saas` branch to the `002-inquiry-widget` branch. Existing forms, submissions, and user data are fully preserved.

### What's new in 002

| Category | Changes |
|----------|---------|
| Database | 3 new collections: `widgets`, `inquiries`, `visitor_records` |
| Backend  | 6 new API endpoints in `pb_hooks/main.pb.js` (widget config, submit, visit, stats, telegram-test) |
| Frontend | Widget management pages, inquiry viewer, visitor analytics, question editor |
| Widget   | New `widget/` directory — embeddable Preact chat widget (~9 KB gzipped) |
| Demo     | `demo/` + `backend/pb_public/` — interactive demo page |
| Config   | New env var `NEXT_PUBLIC_WIDGET_URL` |

### 8.0 Step-by-step upgrade

#### 1. Backup

```bash
cd /opt/form
cp -r backend/pb_data backend/pb_data.bak.$(date +%Y%m%d)
```

#### 2. Pull code

```bash
git pull origin main
```

#### 3. Database migration (automatic)

Three new migration files will be applied automatically on PocketBase restart:

- `3_create_widgets.js` — `widgets` collection (name, user, questions, button_text, greeting, telegram_chat_id, active)
- `4_create_inquiries.js` — `inquiries` collection (widget→FK, responses JSON, page_url, visitor_ip, country)
- `5_create_visitor_records.js` — `visitor_records` collection (widget→FK, page_url, visitor_ip, country)

Existing `forms` and `submissions` collections are **untouched**.

#### 4. Update frontend env

Add one new variable to `frontend/.env.local`:

```bash
echo 'NEXT_PUBLIC_WIDGET_URL=https://api.yourdomain.com/widget.js' >> frontend/.env.local
```

(For local dev, use `http://localhost:8080` or leave empty.)

#### 5. Install widget dependencies and build

```bash
cd /opt/form/widget
npm install
npm run build
cp dist/widget.js ../backend/pb_public/widget.js
```

#### 6. Rebuild frontend

```bash
cd /opt/form/frontend
npm install
npm run build
```

#### 7. Restart services

```bash
sudo systemctl restart pocketbase   # Applies migrations 3, 4, 5
pm2 restart formhandler
```

#### 8. Verify

```bash
# PocketBase health
curl http://127.0.0.1:8090/api/health

# New widget endpoints respond
curl -s http://127.0.0.1:8090/api/widget/nonexistent
# Expected: {"code":404,"message":"Widget not found."}

# Frontend loads
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000
# Expected: 200

# Widget demo page loads
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8090/
# Expected: 200

# Existing form endpoints still work
curl -s http://127.0.0.1:8090/api/collections/forms/records \
  -H "Authorization: <your-token>" | head -1
# Expected: {"items":[...],...}
```

#### 9. Nginx (if using reverse proxy)

Add the widget.js cache rule to the API server block:

```nginx
# Inside the api.yourdomain.com server block, add:
location = /widget.js {
    proxy_pass http://127.0.0.1:8090;
    proxy_set_header Host $host;
    add_header Cache-Control "public, max-age=86400";
}
```

Then reload Nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### Rollback from 002 to 001

```bash
cd /opt/form
git checkout 001-form-saas

# Rebuild frontend (widget pages won't exist, harmless)
cd frontend && npm install && npm run build

# Restart services
sudo systemctl restart pocketbase
pm2 restart formhandler
```

> The 3 new database collections (`widgets`, `inquiries`, `visitor_records`) will remain in the database but will be unused. PocketBase migrations are forward-only. To fully remove them, restore the backup taken in step 1.

---

## 9. General Upgrading

### 9.1 Pull latest code

```bash
cd /opt/form
git pull origin main
```

### 9.2 Update PocketBase (if new version)

```bash
# Check current version
./backend/pocketbase version

# Download new version (edit version in script if needed)
bash scripts/download-pocketbase.sh
```

PocketBase runs migrations automatically on startup. New migrations in `backend/pb_migrations/` will be applied when the service restarts.

### 9.3 Update frontend

```bash
cd /opt/form/frontend
npm install
npm run build
```

### 9.4 Rebuild widget (if changed)

```bash
cd /opt/form/widget
npm install
npm run build
cp dist/widget.js ../backend/pb_public/widget.js
```

### 9.5 Restart services

```bash
# Restart PocketBase
sudo systemctl restart pocketbase

# Restart Next.js
pm2 restart formhandler
```

### 9.6 Verify after upgrade

```bash
# Check PocketBase is healthy
curl http://127.0.0.1:8090/api/health

# Check frontend is responding
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000
# Expected: 200

# Check widget demo
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8090/
# Expected: 200
```

### 9.7 Rollback (if needed)

```bash
# Revert code
cd /opt/form
git checkout <previous-commit>

# Rebuild frontend
cd frontend && npm install && npm run build

# Restart services
sudo systemctl restart pocketbase
pm2 restart formhandler
```

> **Note**: PocketBase migrations are forward-only. If a migration introduced schema changes, you may need to manually revert the database or restore from a backup. Always back up `backend/pb_data/` before upgrading.

### 9.8 Backup before upgrade (recommended)

```bash
# Back up the database
cp -r /opt/form/backend/pb_data /opt/form/backend/pb_data.bak.$(date +%Y%m%d)

# Or use PocketBase's built-in backup
cd /opt/form/backend
./pocketbase admin backup
```

---

## 10. Running Tests

```bash
# Start backend first
cd backend
export $(cat .env | xargs)
./pocketbase superuser upsert admin@admin.com AdminPass12345
./pocketbase serve --http=127.0.0.1:8090 &

# Start frontend
cd frontend
npm run dev &

# Run all tests (53 contract + 18 e2e = 71 total)
cd frontend
npm test

# Or run separately
npm run test:contract   # 53 API contract tests (forms, submissions, widgets, inquiries, visits, stats)
npm run test:e2e        # 18 E2E browser tests (auth, forms, submissions, widget setup, widget embed)
```
