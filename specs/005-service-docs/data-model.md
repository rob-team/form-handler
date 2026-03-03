# Data Model: Service Documentation Pages

**Feature Branch**: `005-service-docs`
**Date**: 2026-03-03

## Overview

This feature introduces **no new data entities or backend changes**. All documentation content is static frontend content rendered from page components and dictionary files.

## Modified Entities

### Dictionary (extended)

The existing `Dictionary` TypeScript interface is extended with new fields for documentation navigation labels. No new collections, tables, or storage are introduced.

**New fields added to Dictionary interface**:

| Field Path | Type | Purpose |
|------------|------|---------|
| `header.docs` | `string` | "Docs" label for header dropdown trigger |
| `header.formEndpointsDocs` | `string` | "Form Endpoints" label in header dropdown |
| `header.inquiryWidgetDocs` | `string` | "Inquiry Widget" label in header dropdown |
| `services.form.docsLabel` | `string` | "View Docs" link text on form service card |
| `services.widget.docsLabel` | `string` | "View Docs" link text on widget service card |

### Static Assets (new directory)

Screenshots are stored as static image files. Not a data model entity, but documented here for completeness.

```text
public/docs/screenshots/
├── en/
│   ├── create-form.png         # Dashboard: form creation dialog
│   ├── form-endpoint-url.png   # Dashboard: form detail with endpoint URL
│   ├── form-submissions.png    # Dashboard: submissions list view
│   ├── telegram-setup.png      # Dashboard: Telegram configuration
│   ├── create-widget.png       # Dashboard: widget creation
│   ├── widget-questions.png    # Dashboard: question editor
│   ├── widget-embed-code.png   # Dashboard: embed code display
│   ├── widget-inquiries.png    # Dashboard: inquiries list view
│   └── visitor-analytics.png   # Dashboard: visitor activity view
└── zh/
    └── (same files, Chinese UI)
```

## State Transitions

N/A — no stateful entities introduced.

## Validation Rules

N/A — no user input or data persistence introduced.
