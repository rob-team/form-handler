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
  + Landing Page            Backend + DB
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
- **Frontend**: Next.js 16 (Node.js 20+), bilingual landing page at `/en` and `/zh`
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

### 2.2 Install frontend dependencies

```bash
cd frontend
npm install
```

### 2.3 Build the widget

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
FRONTEND_URL=https://yourdomain.com
```

- `TELEGRAM_BOT_TOKEN` — Get from [@BotFather](https://t.me/BotFather). Leave empty to disable notifications.
- `FRONTEND_URL` — The URL where the frontend is accessible. Used for redirect after form submission.

### 3.2 Frontend (`frontend/.env.local`)

```bash
cp frontend/.env.local.example frontend/.env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_POCKETBASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_WIDGET_URL=https://api.yourdomain.com
NEXT_PUBLIC_LANDING_FORM_ID=
NEXT_PUBLIC_LANDING_WIDGET_ID=
```

> `NEXT_PUBLIC_LANDING_FORM_ID` and `NEXT_PUBLIC_LANDING_WIDGET_ID` are set in step 5 after creating the records.

---

## 4. Start Services

### 4.1 Start PocketBase

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

### 4.2 Build & Start Next.js

```bash
cd frontend
npm run build
npm run start
```

---

## 5. Set Up Landing Page

The landing page at `/en` and `/zh` dogfoods two platform services: a "Contact Us" form and a floating inquiry widget. You need to create these records in PocketBase.

### 5.1 Register an admin user

Visit `https://yourdomain.com/register` and create an account (e.g., `admin@yourdomain.com`).

### 5.2 Create form and widget

Log in to the dashboard at `https://yourdomain.com/dashboard`:

1. **Create a Form**: Go to Forms → Create → name it (e.g., "Landing Page Contact")
2. **Create a Widget**: Go to Widgets → Create → name it, configure B2B questions, set `active: true`
3. Copy both record IDs from the URL or PocketBase admin panel

### 5.3 Update environment variables

Add the IDs to `frontend/.env.local`:

```env
NEXT_PUBLIC_LANDING_FORM_ID=<your-form-id>
NEXT_PUBLIC_LANDING_WIDGET_ID=<your-widget-id>
```

Rebuild and restart the frontend:

```bash
cd frontend
npm run build
pm2 restart formhandler
```

### 5.4 Verify

- `https://yourdomain.com/` → redirects to `/en` or `/zh` based on browser language
- Contact form submits successfully (check submissions in dashboard)
- Floating inquiry widget appears in bottom-right corner

---

## 6. Production Setup

### 6.1 PocketBase (systemd)

```ini
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

### 6.2 Next.js (PM2)

```bash
cd frontend
npm run build
pm2 start npm --name "formhandler" -- start
```

### 6.3 Nginx Reverse Proxy

```nginx
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

# Backend API + widget.js
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

    location = /widget.js {
        proxy_pass http://127.0.0.1:8090;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=86400";
    }
}
```

---

## 7. Verify Deployment

```bash
# PocketBase health
curl https://api.yourdomain.com/api/health

# Landing page
curl -s -o /dev/null -w "%{http_code}" https://yourdomain.com/en

# Widget endpoint
curl -s https://api.yourdomain.com/api/widget/<widget-id>
```

---

## 8. Telegram Notifications

1. Create a bot via [@BotFather](https://t.me/BotFather) and get the token
2. Set `TELEGRAM_BOT_TOKEN` in `backend/.env`
3. Get your chat ID by messaging [@userinfobot](https://t.me/userinfobot)
4. In the dashboard, go to a form's or widget's **Settings** page and enter the chat ID

---

## 9. Upgrading

```bash
cd /opt/form

# Backup database
cp -r backend/pb_data backend/pb_data.bak.$(date +%Y%m%d)

# Pull latest code
git pull origin main

# Rebuild
cd widget && npm install && npm run build && cp dist/widget.js ../backend/pb_public/widget.js
cd ../frontend && npm install && npm run build

# Restart
sudo systemctl restart pocketbase
pm2 restart formhandler
```

PocketBase runs migrations automatically on startup. New migrations in `backend/pb_migrations/` will be applied when the service restarts.

---

## 10. Running Tests

```bash
# Ensure PocketBase and frontend are running, then:
cd frontend
npx playwright test
```
