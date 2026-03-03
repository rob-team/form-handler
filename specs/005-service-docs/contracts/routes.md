# Route Contracts: Service Documentation Pages

**Feature Branch**: `005-service-docs`
**Date**: 2026-03-03

## New Routes

No API endpoints are introduced. The following frontend routes are added:

### Documentation Pages

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/{locale}/docs/form-endpoints` | GET | None | Form Endpoints documentation page |
| `/{locale}/docs/inquiry-widget` | GET | None | Inquiry Widget documentation page |

Where `{locale}` is `en` or `zh`.

**Behavior**:
- Pages are statically generated at build time (SSG) for both locales.
- No authentication required — accessible to all visitors.
- Locale is determined by the URL path prefix.
- Pages render the shared documentation layout (header + footer) with service-specific content.

### SEO Metadata per Route

Each documentation page generates its own metadata:

| Route | Title (EN) | Title (ZH) |
|-------|-----------|-----------|
| `/en/docs/form-endpoints` | Form Endpoints Documentation — FormHandler | 表单端点使用文档 — FormHandler |
| `/zh/docs/form-endpoints` | 表单端点使用文档 — FormHandler | 表单端点使用文档 — FormHandler |
| `/en/docs/inquiry-widget` | Inquiry Widget Documentation — FormHandler | 询盘组件使用文档 — FormHandler |
| `/zh/docs/inquiry-widget` | 询盘组件使用文档 — FormHandler | 询盘组件使用文档 — FormHandler |

Each page includes:
- `<title>` and `<meta name="description">`
- `<link rel="canonical">` pointing to its own URL
- `<link rel="alternate" hreflang="en|zh">` linking to the other locale version
- Open Graph and Twitter Card meta tags

## Modified Routes

### Middleware Changes

The middleware matcher is extended to also process locale-prefixed subpaths:

**Before**: `["/", "/en", "/zh"]`
**After**: `["/", "/en/:path*", "/zh/:path*"]`

The middleware sets the `x-locale` response header for all locale-prefixed paths (not just the root landing page). Logic:
- `pathname === "/"` → auto-detect and redirect (unchanged)
- `pathname.startsWith("/en")` → set `x-locale: en` (expanded from exact match)
- `pathname.startsWith("/zh")` → set `x-locale: zh` (expanded from exact match)

## Navigation Contract

### Header "Docs" Dropdown

The landing header's "Docs" dropdown contains exactly 2 items:

| Item Label (EN) | Item Label (ZH) | Target |
|-----------------|-----------------|--------|
| Form Endpoints | 表单接收端点 | `/{locale}/docs/form-endpoints` |
| Inquiry Widget | 询盘聊天组件 | `/{locale}/docs/inquiry-widget` |

### Service Card "View Docs" Links

Each service card on the landing page gains a secondary link:

| Service Card | Link Label (EN) | Link Label (ZH) | Target |
|-------------|-----------------|-----------------|--------|
| Form Endpoints | View Docs | 查看文档 | `/{locale}/docs/form-endpoints` |
| Inquiry Widget | View Docs | 查看文档 | `/{locale}/docs/inquiry-widget` |

### Header Anchor Links (Updated)

Existing header anchor links are changed from relative to absolute to work from any page:

| Label | Before | After |
|-------|--------|-------|
| Services | `#services` | `/{locale}#services` |
| Contact | `#contact` | `/{locale}#contact` |
