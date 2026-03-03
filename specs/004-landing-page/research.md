# Research: Landing Page

**Branch**: `004-landing-page` | **Date**: 2026-03-03

## R1: Internationalization (i18n) Approach

**Decision**: Custom lightweight i18n using Next.js `[locale]` dynamic segment + JSON dictionaries + middleware for locale detection.

**Rationale**: The project only needs 2 languages (EN/ZH) for a single landing page. A full i18n library (e.g., `next-intl`, `react-i18next`) would add an unnecessary dependency for this limited scope. Next.js App Router natively supports dynamic segments and middleware, which provide everything needed: locale-based routing, language detection, and redirects.

**Alternatives considered**:
- `next-intl`: Full-featured but overkill for a single page with 2 languages. Adds ~15KB to bundle and a new dependency to maintain. Would be reconsidered if i18n expands to the dashboard.
- Separate static routes (`/en/page.tsx`, `/zh/page.tsx`): Zero dependencies but duplicates the page component. Violates DRY.
- `react-i18next`: Primarily designed for client-side i18n; less ergonomic with Next.js App Router server components and metadata API.

**Implementation pattern**:
- `app/[locale]/page.tsx` with `generateStaticParams()` returning `['en', 'zh']` and `dynamicParams = false`
- `middleware.ts` detects `Accept-Language` header and redirects `/` → `/en` or `/zh`
- `src/dictionaries/en.json` and `zh.json` contain all landing page text
- Dictionary loader uses dynamic `import()` for code splitting by locale

## R2: Contact Form AJAX Submission

**Decision**: Use `fetch()` with `redirect: 'manual'` to POST to the existing `/api/submit/{formId}` endpoint. Detect success by checking the response type.

**Rationale**: The existing form submission endpoint always returns a 302 redirect (to `_next` URL or default success page). For AJAX submissions, we use `redirect: 'manual'` which returns an opaque redirect response instead of following it. A non-error response indicates success. This requires zero backend changes.

**Alternatives considered**:
- Modify backend to return JSON when `Accept: application/json`: Cleaner API contract but requires changing existing backend code and adding new contract tests for the modified endpoint. Higher risk for a cosmetic improvement.
- Use PocketBase SDK `create()` on `submissions` collection: Not possible — `createRule` is `""` (system-only), so unauthenticated clients cannot create records directly.
- Traditional form POST with redirect: Works but causes a full page navigation, breaking the single-page landing experience.

**Implementation pattern**:
```typescript
const res = await fetch(`${PB_URL}/api/submit/${FORM_ID}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, message }),
  redirect: 'manual'
});
// opaqueredirect = 302 received = submission successful
if (res.type === 'opaqueredirect' || res.ok) {
  showSuccess();
} else {
  showError();
}
```

## R3: SEO Structured Data

**Decision**: Use JSON-LD `<script>` tags with `SoftwareApplication` schema for the product and `WebPage` schema per locale. Include `Organization` schema for the brand. Use Next.js `generateMetadata()` for standard meta tags, OG, and Twitter cards.

**Rationale**: JSON-LD is the format recommended by Google for structured data. `SoftwareApplication` is the most appropriate schema.org type for a SaaS product. Next.js `generateMetadata()` natively generates `<meta>` tags, canonical URLs, and `alternates` (for `hreflang`).

**Alternatives considered**:
- Microdata attributes: More verbose and harder to maintain than JSON-LD. Google recommends JSON-LD.
- RDFa: Less tooling support and Google explicitly prefers JSON-LD.

## R4: Widget Embedding on Landing Page

**Decision**: Include the widget embed script in the landing page using Next.js `<Script>` component with `strategy="afterInteractive"`. Pass the system widget ID and PocketBase URL via data attributes.

**Rationale**: The widget is already a self-contained IIFE bundle designed for embedding on any website. Using the same embed pattern on the landing page ensures visitors experience exactly what they'd get on their own site. The `afterInteractive` strategy ensures the landing page content loads first (SEO and performance).

**Alternatives considered**:
- Import widget source directly into the Next.js build: Would tightly couple the widget to the landing page build, breaking the independent deployment model. The widget uses Preact while the landing page uses React.
- iframe embed: Adds complexity and breaks the seamless integration feel.

## R5: Form & Widget Setup

**Decision**: Admin manually creates the form and widget records via PocketBase dashboard, then configures their IDs as environment variables. No migration or seed script.

**Rationale**: The landing page form and widget are one-time setup records owned by the site admin. Manual creation is simpler, gives the admin full control over configuration, and keeps submissions/inquiries visible in the admin's own dashboard. No backend code changes required.

**Alternatives considered**:
- Automated seed migration: Creates a separate system account, but the records don't appear in the admin's dashboard. Migration output (record IDs) is hard to retrieve in production environments.
- Hardcoded IDs in frontend code: Fragile across environments.

**Implementation pattern**:
- Admin creates form and widget in PocketBase dashboard under their own account
- Record IDs configured as `NEXT_PUBLIC_LANDING_FORM_ID` and `NEXT_PUBLIC_LANDING_WIDGET_ID`
- Frontend gracefully degrades if variables are unset (contact form shows error, widget doesn't load)

## R6: Middleware Routing Strategy

**Decision**: Create a single `middleware.ts` at the frontend root that handles: (1) `/` locale detection and redirect, (2) `/en` and `/zh` auth redirect for logged-in users, and (3) passes through all other routes.

**Rationale**: Next.js middleware runs at the edge before routing, making it the ideal place for locale detection and auth-based redirects. A single middleware file with a clear matcher config keeps routing logic centralized.

**Implementation pattern**:
- Match only `/`, `/en`, `/zh` paths (use `config.matcher`)
- For `/`: read `Accept-Language` header, check for `zh` prefix → redirect 302 to `/zh` or `/en`
- For `/en` or `/zh`: check `pb_auth` cookie → if valid, redirect 302 to `/dashboard`
- All other routes: skip middleware entirely via matcher config
