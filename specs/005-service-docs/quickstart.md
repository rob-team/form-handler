# Quickstart: Service Documentation Pages

**Feature Branch**: `005-service-docs`
**Date**: 2026-03-03

## Prerequisites

- Node.js and npm installed
- Frontend dev server running (`cd frontend && npm run dev`)
- Dashboard accessible with at least one form and one widget created (for screenshots)

## Implementation Order

### Step 1: Extend Dictionary Interface and JSON Files

1. Add new fields to `Dictionary` interface in `src/lib/dictionaries.ts`:
   - `header.docs`, `header.formEndpointsDocs`, `header.inquiryWidgetDocs`
   - `services.form.docsLabel`, `services.widget.docsLabel`

2. Add corresponding keys to `src/dictionaries/en.json` and `zh.json`

### Step 2: Create CodeBlock Component

Create `src/components/docs/code-block.tsx` — a client component with:
- `<pre><code>` block with monospace styling
- Copy-to-clipboard button using `navigator.clipboard.writeText()`
- Visual feedback on copy (checkmark icon for ~2 seconds)
- Accepts `code` (string) and optional `language` (string) props

### Step 3: Create Docs Layout

Create `src/app/[locale]/docs/layout.tsx`:
- Load dictionary via `getDictionary(locale)`
- Render `<LandingHeader>` with all required props
- Render `{children}`
- Render `<LandingFooter>`
- Add `generateMetadata` for shared doc metadata

### Step 4: Create Form Endpoints Documentation Page

Create `src/app/[locale]/docs/form-endpoints/page.tsx`:
- Quickstart section with numbered steps (create form → copy URL → embed → receive submission)
- Code example: minimal HTML form with placeholder `YOUR_FORM_ID`
- Reference sections: `_next` redirect, viewing submissions, Telegram setup
- Full example: complete HTML page with form
- Screenshot images at each step
- Locale conditional for EN/ZH content
- `generateMetadata` for SEO

### Step 5: Create Inquiry Widget Documentation Page

Create `src/app/[locale]/docs/inquiry-widget/page.tsx`:
- Quickstart section with numbered steps (create widget → configure questions → copy embed → paste → receive inquiry)
- Code example: minimal script tag with placeholder `YOUR_WIDGET_ID`
- Reference sections: question types, customization, viewing inquiries, Telegram, analytics
- Full example: complete HTML page with widget embed
- Screenshot images at each step
- Locale conditional for EN/ZH content
- `generateMetadata` for SEO

### Step 6: Update Landing Header with Docs Dropdown

Modify `src/components/landing/landing-header.tsx`:
- Convert to `"use client"` component
- Add "Docs" dropdown using `DropdownMenu` from shadcn/ui
- Change anchor links (`#services`, `#contact`) to `/${locale}#services`, `/${locale}#contact`
- Add new props: `docsLabel`, `formEndpointsDocsLabel`, `inquiryWidgetDocsLabel`

### Step 7: Update Service Card with Docs Link

Modify `src/components/landing/service-card.tsx`:
- Add optional `docsText?: string` and `docsHref?: string` props
- Render a secondary "View Docs" link next to the existing CTA when props are provided

### Step 8: Update Landing Page

Modify `src/app/[locale]/page.tsx`:
- Pass new dictionary strings to `<LandingHeader>` (docs labels)
- Pass `docsHref` and `docsText` to each `<ServiceCard>`

### Step 9: Update Middleware

Modify `frontend/middleware.ts`:
- Extend matcher to `["/", "/en/:path*", "/zh/:path*"]`
- Update locale detection to handle any path starting with `/en` or `/zh`

### Step 10: Capture and Commit Screenshots

- Navigate the dashboard in English, capture screenshots of key screens
- Switch to Chinese, capture same screens
- Save to `public/docs/screenshots/en/` and `public/docs/screenshots/zh/`

### Step 11: Write E2E Tests

- Test: Form Endpoints doc page loads at `/en/docs/form-endpoints` with all sections
- Test: Inquiry Widget doc page loads at `/en/docs/inquiry-widget` with all sections
- Test: Header "Docs" dropdown shows both links and navigates correctly
- Test: Service card "View Docs" links navigate to correct doc pages
- Test: Language switching works on doc pages

## Verification

```bash
cd frontend
npm run dev
# Visit http://localhost:3000/en → verify "Docs" dropdown in header
# Visit http://localhost:3000/en/docs/form-endpoints → verify doc page renders
# Visit http://localhost:3000/en/docs/inquiry-widget → verify doc page renders
# Visit http://localhost:3000/zh/docs/form-endpoints → verify Chinese version
npm run lint
npm test
```
