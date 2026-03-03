# Quickstart: OAuth Login (Google & GitHub)

**Feature**: 003-oauth-login
**Date**: 2026-03-03

## Prerequisites

- Existing 001-form-saas and 002-inquiry-widget setup running (PocketBase + Next.js)
- Google Cloud Console account (for Google OAuth)
- GitHub account (for GitHub OAuth App)

## Step 1: Configure Google OAuth2

1. Go to [Google Cloud Console](https://console.cloud.google.com/) > APIs & Services > Credentials
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Application type: **Web application**
4. Name: e.g., "Form Handler Dev"
5. Authorized redirect URIs: add `http://127.0.0.1:8090/api/oauth2-redirect`
6. Click "Create" and copy the **Client ID** and **Client Secret**

## Step 2: Configure GitHub OAuth2

1. Go to [GitHub Settings](https://github.com/settings/developers) > OAuth Apps > "New OAuth App"
2. Application name: e.g., "Form Handler Dev"
3. Homepage URL: `http://localhost:3000`
4. Authorization callback URL: `http://127.0.0.1:8090/api/oauth2-redirect`
5. Click "Register application" and copy the **Client ID**
6. Generate a **Client Secret** and copy it

## Step 3: Enable Providers in PocketBase Admin UI

1. Start PocketBase: `cd backend && ./pocketbase serve`
2. Open PocketBase Admin UI: `http://127.0.0.1:8090/_/`
3. Navigate to: **Collections** > **users** > **Edit collection** (gear icon) > **Options** > **OAuth2**
4. Toggle **Google**:
   - Paste Client ID and Client Secret from Step 1
   - (Optional) Configure field mappings: `name` → Name, `avatar` → Avatar URL
5. Toggle **GitHub**:
   - Paste Client ID and Client Secret from Step 2
   - (Optional) Configure field mappings: `name` → Name, `avatar` → Avatar URL
6. Save the collection

## Step 4: Add Name and Avatar Fields (if not already present)

1. In PocketBase Admin UI: **Collections** > **users** > **Edit collection**
2. Add field `name` (type: Plain text) if it doesn't exist
3. Add field `avatar` (type: File, single file, image MIME types) if it doesn't exist
4. Save

## Step 5: Start Development

```bash
# Terminal 1: PocketBase
cd backend && ./pocketbase serve

# Terminal 2: Next.js
cd frontend && npm run dev
```

## Step 6: Test OAuth Flow

1. Open `http://localhost:3000/login`
2. Click "Sign in with Google" or "Sign in with GitHub"
3. A popup opens with the provider's consent screen
4. Authorize the application
5. The popup closes and you are redirected to the dashboard

## Verify

- Check PocketBase Admin UI > **users** collection for the new user record
- Check the `name` and `avatar` fields are populated
- Check PocketBase Admin UI > **_externalAuths** collection for the linked OAuth identity
- Sign out and sign in again with the same OAuth provider — should log into the same account
- Sign in with a different OAuth provider using the same email — should link to the same account

## Common Issues

| Issue | Solution |
|-------|----------|
| Popup blocked by browser | Ensure `authWithOAuth2()` is called directly in a click handler (not in an async callback) |
| "Redirect URI mismatch" error | Verify the redirect URI in the provider console matches exactly: `http://127.0.0.1:8090/api/oauth2-redirect` |
| Provider not showing on login page | Verify the provider is enabled in PocketBase Admin UI with valid credentials |
| Avatar not populated | Configure field mappings in PocketBase Admin UI > OAuth2 > Provider > Optional field mappings |
| GitHub email not found | Ensure the GitHub account has a public email, or the app requests `user:email` scope |
