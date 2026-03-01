# FormHandler Deployment Guide

## Architecture

```
┌─────────────┐       ┌──────────────────┐
│  Next.js     │──────▶│  PocketBase      │──────▶ Telegram API
│  :3000       │       │  :8090           │
└─────────────┘       └──────────────────┘
   Frontend              Backend + DB
```

- **Backend**: PocketBase v0.36.5 (single binary, embedded SQLite)
- **Frontend**: Next.js 16 (Node.js 20+)

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
```

For production, replace with your actual domain:

```env
NEXT_PUBLIC_POCKETBASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_FRONTEND_URL=https://yourdomain.com
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
- Run migrations (create `forms` and `submissions` collections)
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

### 5.3 Nginx Reverse Proxy

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

# Backend API
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

Save the `id` from the response.

### 6.5 Test form submission

```bash
# Form-encoded POST (simulates an HTML form)
curl -s -X POST http://127.0.0.1:8090/api/submit/<form-id> \
  -d "name=John&email=john@example.com&message=Hello from curl" \
  -w "\nHTTP Status: %{http_code}\nRedirect: %{redirect_url}\n"

# Expected output:
# HTTP Status: 302
# Redirect: http://localhost:3000/success?ref=

# With custom redirect
curl -s -X POST http://127.0.0.1:8090/api/submit/<form-id> \
  -d "name=Jane&email=jane@example.com&message=With redirect&_next=https://example.com/thanks" \
  -w "\nHTTP Status: %{http_code}\nRedirect: %{redirect_url}\n"

# Expected output:
# HTTP Status: 302
# Redirect: https://example.com/thanks

# JSON POST
curl -s -X POST http://127.0.0.1:8090/api/submit/<form-id> \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","email":"bob@example.com","message":"JSON submission"}' \
  -w "\nHTTP Status: %{http_code}\n"

# Expected: HTTP Status: 302
```

### 6.6 Verify submission was saved

```bash
curl -s -H "Authorization: <token>" \
  "http://127.0.0.1:8090/api/collections/submissions/records?filter=form%3D%22<form-id>%22&sort=-created"
```

### 6.7 HTML form integration example

```html
<form action="https://api.yourdomain.com/api/submit/<form-id>" method="POST">
  <input type="text" name="name" placeholder="Name" required>
  <input type="email" name="email" placeholder="Email" required>
  <textarea name="message" placeholder="Message"></textarea>
  <input type="hidden" name="_next" value="https://yoursite.com/thank-you">
  <button type="submit">Send</button>
</form>
```

---

## 7. Telegram Notifications

1. Create a bot via [@BotFather](https://t.me/BotFather) and get the token
2. Set `TELEGRAM_BOT_TOKEN` in `backend/.env`
3. Get your chat ID by messaging [@userinfobot](https://t.me/userinfobot)
4. In the dashboard, go to a form's **Settings** page and enter the chat ID
5. Each new submission will send a Telegram message with all submitted fields

---

## 8. Upgrading

### 8.1 Pull latest code

```bash
cd /opt/form
git pull origin main
```

### 8.2 Update PocketBase (if new version)

```bash
# Check current version
./backend/pocketbase version

# Download new version (edit version in script if needed)
bash scripts/download-pocketbase.sh
```

PocketBase runs migrations automatically on startup. New migrations in `backend/pb_migrations/` will be applied when the service restarts.

### 8.3 Update frontend

```bash
cd /opt/form/frontend
npm install
npm run build
```

### 8.4 Restart services

```bash
# Restart PocketBase
sudo systemctl restart pocketbase

# Restart Next.js
pm2 restart formhandler
```

### 8.5 Verify after upgrade

```bash
# Check PocketBase is healthy
curl http://127.0.0.1:8090/api/health

# Check frontend is responding
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000
# Expected: 200
```

### 8.6 Rollback (if needed)

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

### 8.7 Backup before upgrade (recommended)

```bash
# Back up the database
cp -r /opt/form/backend/pb_data /opt/form/backend/pb_data.bak.$(date +%Y%m%d)

# Or use PocketBase's built-in backup
cd /opt/form/backend
./pocketbase admin backup
```

---

## 9. Running Tests

```bash
# Start backend first
cd backend
export $(cat .env | xargs)
./pocketbase superuser upsert admin@admin.com AdminPass12345
./pocketbase serve --http=127.0.0.1:8090 &

# Start frontend
cd frontend
npm run dev &

# Run all tests (23 contract + 12 e2e = 35 total)
cd frontend
npm test

# Or run separately
npm run test:contract   # API contract tests only
npm run test:e2e        # E2E browser tests only
```
