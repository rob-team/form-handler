# Research: Service Documentation Pages

**Feature Branch**: `005-service-docs`
**Date**: 2026-03-03

## Research Tasks

### 1. Documentation Content Structure Pattern

**Decision**: Use page-level JSX components for documentation content with locale conditionals, rather than storing all content in dictionary JSON files.

**Rationale**: Documentation pages contain complex structured content: numbered steps with descriptions, multiple code blocks (HTML/JS), inline screenshots, and multi-paragraph reference sections. Storing this in JSON requires escaping multi-line strings and loses IDE support for HTML/JSX formatting. Page-level JSX provides full layout control and keeps code examples as readable strings. Short translatable labels (nav items, page titles) remain in the dictionary files.

**Alternatives considered**:
- **MDX files per locale**: Would provide markdown authoring experience but adds a build-time MDX processing dependency (e.g., `next-mdx-remote` or `@next/mdx`). Violates Principle V — the project doesn't use MDX anywhere else, and the added dependency cost outweighs the benefit for 2 static pages.
- **Full dictionary JSON**: All content in `en.json`/`zh.json`. Makes dictionary files massive (~400+ lines each) and requires JSON string escaping for code blocks and multi-line prose. Poor authoring experience.
- **Separate JSON files per doc**: `docs/form-endpoints.en.json` etc. with a separate loader. Adds a new loading pattern and type definition without meaningful benefit — the content still needs JSON escaping.

### 2. Routing Approach for Doc Pages

**Decision**: Nest doc pages under `[locale]/docs/` using Next.js file-system routing (`[locale]/docs/form-endpoints/page.tsx`, `[locale]/docs/inquiry-widget/page.tsx`).

**Rationale**: Follows the existing `[locale]` routing pattern exactly. The `dynamicParams = false` and `generateStaticParams` in the existing `[locale]/layout.tsx` already restrict to `en` and `zh`. Doc pages inherit this constraint automatically. URLs are clean and SEO-friendly: `/en/docs/form-endpoints`, `/zh/docs/inquiry-widget`.

**Alternatives considered**:
- **Dynamic `[slug]` route** (`[locale]/docs/[slug]/page.tsx`): Over-engineered for 2 known pages. Adds slug validation logic and loses the benefit of statically-known routes.
- **Single docs page with hash anchors**: All docs on one page at `/en/docs#form-endpoints`. Loses independent SEO indexing per service and makes pages very long.

### 3. Header Dropdown Implementation

**Decision**: Use the existing shadcn/ui `DropdownMenu` component (already installed at `@/components/ui/dropdown-menu`) for the "Docs" dropdown in the landing header.

**Rationale**: The `DropdownMenu` component is already available and styled consistently with the design system. No new dependencies needed. The header must become a `"use client"` component since `DropdownMenu` uses Radix UI primitives that require client-side JavaScript.

**Alternatives considered**:
- **CSS-only hover dropdown**: No client-side JS required, but harder to make accessible (keyboard nav, screen readers) and doesn't match the existing component patterns in the project.
- **Navigation Menu (Radix)**: A dedicated navigation menu primitive. Not currently installed, and `DropdownMenu` is sufficient for 2 items.

### 4. Code Block Copy Functionality

**Decision**: Create a small `CodeBlock` client component (`components/docs/code-block.tsx`) with a copy-to-clipboard button using the `navigator.clipboard` API.

**Rationale**: Both doc pages need copyable code examples (HTML form snippet, widget script tag, full HTML examples). A shared component avoids duplication and provides consistent styling. The `navigator.clipboard` API is supported in all modern browsers. The component is simple: a `<pre><code>` block with a copy button overlay.

**Alternatives considered**:
- **Third-party syntax highlighter** (e.g., `prism-react-renderer`, `shiki`): Adds a dependency for syntax highlighting. The code examples are short (5–20 lines) and don't benefit significantly from highlighting. Violates Principle V.
- **No copy button**: Users would have to manually select and copy code. Poor UX for a documentation page where the whole point is to give users code to paste.

### 5. Middleware Update Scope

**Decision**: Extend the middleware matcher to `["/", "/en/:path*", "/zh/:path*"]` and update the locale detection logic to extract locale from any path starting with `/en` or `/zh`.

**Rationale**: The middleware sets the `x-locale` header which the root `<html lang>` attribute reads. Without this update, doc pages would have an incorrect (or missing) `lang` attribute. The change is minimal — add a path prefix check alongside the existing exact-match checks.

**Alternatives considered**:
- **Extract locale from URL in root layout**: Would avoid middleware changes but breaks the existing pattern where `x-locale` is the single source of locale truth for the root layout. Mixing approaches is worse.
- **Match only specific doc paths**: More restrictive matcher (`/en/docs/:path*`) but unnecessarily specific. The broader `/en/:path*` pattern is safe since no other routes use locale prefixes.

### 6. Screenshot Capture Approach

**Decision**: Manually capture dashboard screenshots by navigating the app in each language, taking browser screenshots, and saving them to `public/docs/screenshots/{locale}/`. Screenshots are committed to the repository as static assets.

**Rationale**: The dashboard UI changes infrequently. Manual capture gives full control over what's shown in each screenshot (e.g., example data, clean state). Automated screenshot generation (e.g., Playwright screenshot tests) would add significant complexity for minimal benefit on 2 documentation pages.

**Alternatives considered**:
- **Automated Playwright screenshots**: Run as part of CI to keep screenshots current. Over-engineered for ~18 static images that change rarely. Adds CI time and flakiness risk.
- **Placeholder boxes**: Use styled divs with descriptive text instead of real screenshots. Reduces trust and makes docs less useful for visual learners. The user explicitly chose real screenshots in clarification.
