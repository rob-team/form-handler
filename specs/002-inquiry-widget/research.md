# Research: B2B Inquiry Widget

**Feature Branch**: `002-inquiry-widget` | **Date**: 2026-03-02

## R1: Widget Embed Architecture

**Decision**: Two-phase loader pattern — a small inline snippet that async-loads the main widget bundle.

**Rationale**: This is the proven pattern used by Tawk.to, Intercom, and Crisp. The inline snippet (~500 bytes) is what the customer pastes into their HTML. It sets a global config object (with widget/form ID) and dynamically injects a `<script async>` tag pointing to the hosted widget bundle. This ensures zero impact on page load.

**Alternatives considered**:
- Single inline `<script>` with all code: Too large, blocks rendering
- iframe embed: Slower load (116ms vs 21ms), mobile keyboard issues, cross-origin complications

## R2: Widget Framework

**Decision**: Preact (3-4 KB gzipped) for the widget UI.

**Rationale**: The conversational form requires reactive state management (current question, input values, validation, step transitions, back navigation). Preact provides React-compatible component model (JSX, hooks) that the team already uses in the Next.js frontend, at a fraction of React's size. Sentry Engineering evaluated Preact vs Svelte for their embeddable widget and chose Preact — their full feedback widget shipped at ~8 KB.

**Alternatives considered**:
- Vanilla JS: Works for simple UIs but becomes unwieldy for multi-step forms with validation, transitions, and state
- Svelte: Slightly smaller output but requires learning a new framework; team already knows React/Preact
- VanJS (1 KB): Too minimal for the conversational form complexity

## R3: CSS Isolation

**Decision**: Shadow DOM V1 (closed mode) for complete style isolation from the host website.

**Rationale**: Shadow DOM provides true CSS encapsulation — host page styles cannot leak in, widget styles cannot leak out. It's 4.5x faster than iframe-based isolation. Browser support is 97%+ globally: Chrome 53+, Firefox 63+, Safari 11+, Edge 79+, iOS Safari 11+, Chrome Android 53+. Using `mode: 'closed'` prevents host page JavaScript from accessing widget internals.

**Alternatives considered**:
- iframe: Complete isolation but slower load, mobile keyboard issues on iOS, cross-origin postMessage complexity
- CSS namespacing/scoping: Not truly isolated — host `!important` rules and `* {}` selectors break it

## R4: Build Tooling

**Decision**: esbuild with a standalone build script, outputting a single IIFE bundle targeting ES2015.

**Rationale**: esbuild is 10-100x faster than alternatives, has native IIFE output support, built-in CSS bundling, and near-zero configuration. The widget is a separate build target from the Next.js frontend — it lives in its own `/widget` directory with its own build config. Expected bundle size: ~20-30 KB gzipped (Preact 4KB + widget code 10-20KB + CSS 5KB).

**Alternatives considered**:
- Rollup: Marginally better tree-shaking but slower; plugin ecosystem advantages are unnecessary for a self-contained widget
- Webpack: Overkill complexity for a single-file output
- Vite: Library mode works but adds unnecessary dev server infrastructure

## R5: IP Geolocation

**Decision**: Server-side geolocation via PocketBase hook. Primary: Cloudflare `CF-IPCountry` header (if deployed behind Cloudflare). Fallback: `$http.send()` to a free geolocation API.

**Rationale**: Server-side ensures accuracy (client can't spoof), doesn't add load time to the widget, and doesn't expose API keys. Cloudflare provides `CF-IPCountry` on all plans (including free) with zero latency. If not behind Cloudflare, `$http.send()` to ip-api.com or Country.is provides synchronous lookups compatible with PocketBase JSVM (goja).

**Alternatives considered**:
- Client-side geolocation API: Exposes API key, adds latency to widget, spoofable
- MaxMind GeoLite2 database: Requires custom Go code in PocketBase, complex updates; overkill for current scale
- No geolocation: Loses valuable lead qualification data

## R6: Data Model Strategy

**Decision**: Separate `widgets` and `inquiries` collections, independent from existing `forms` and `submissions`.

**Rationale**: Widgets have configurable question lists — a fundamentally different entity from 001's forms which have no question configuration. Inquiries store structured question-answer pairs mapped to the widget's configuration, while 001's submissions store arbitrary JSON blobs. Keeping them separate allows both features to evolve independently. A new `visitor_records` collection tracks page visits.

**Alternatives considered**:
- Extend existing `forms` collection: Would conflate two different models (open-ended POST vs configured conversational form)
- Single `questions` collection: Questions are tightly coupled to widgets; storing them as JSON within the widget record is simpler than a separate collection (avoids N+1 queries)

## R7: Question Storage Design

**Decision**: Store questions as a JSON array field within the widget record rather than as a separate collection.

**Rationale**: Questions are always loaded/saved together with the widget. There is no use case for querying questions independently across widgets. A JSON field avoids join queries and keeps the data model simple. PocketBase supports JSON fields natively with validation.

**Alternatives considered**:
- Separate `questions` collection with foreign key to widgets: Adds complexity (N+1 queries, ordering, cascading deletes) without clear benefit at this scale

## R8: Inquiry Data Storage

**Decision**: Store inquiry responses as a JSON array of `{question, answer}` pairs, plus separate metadata fields (IP, country, page URL) as typed fields on the inquiry record.

**Rationale**: Storing Q&A pairs as JSON preserves the exact question text at time of submission (FR-020: existing inquiries retain original questions even if widget is later modified). Typed metadata fields (IP, country, page URL, timestamp) enable filtering and sorting in PocketBase without JSON path queries.

**Alternatives considered**:
- All data as a single JSON blob (like 001's submissions): Loses ability to filter/sort by metadata
- Separate typed fields per question: Impossible since questions are user-configurable

## R9: Browser Compatibility Target

**Decision**: Target browsers released after January 2018 — Chrome 63+, Firefox 63+, Safari 11.1+, Edge 79+, iOS Safari 11+.

**Rationale**: This gives 98%+ global coverage and ensures Shadow DOM V1, `fetch()`, ES2015+ syntax, and CSS Custom Properties are all available. The widget bundle targets ES2015 for the broadest safe output. IE11 is end-of-life and not worth supporting in 2026.

**Alternatives considered**:
- ES5 target: Unnecessary bloat from transpilation; no meaningful user base requires it
- ES2017+ target: Marginally smaller output but risks excluding older Samsung Internet and some corporate browsers
