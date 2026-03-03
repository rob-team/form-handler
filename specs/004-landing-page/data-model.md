# Data Model: Landing Page

**Branch**: `004-landing-page` | **Date**: 2026-03-03

## Overview

No new collections are introduced. This feature dogfoods existing collections (`users`, `forms`, `widgets`, `submissions`, `inquiries`, `visitor_records`) via seed data created by a migration.

## Seed Data (Migration 7)

### System User Account

| Field       | Value                           | Notes                          |
| ----------- | ------------------------------- | ------------------------------ |
| email       | `system@formhandler.local`      | Not a real email; internal use |
| password    | Auto-generated secure random    | Not used for login             |
| name        | `FormHandler System`            | Display name                   |
| verified    | `true`                          | Skip email verification        |

**Purpose**: Owns landing page form endpoint and widget configuration. Not intended for human login.

### Landing Page Form (in `forms` collection)

| Field             | Value                     | Notes                              |
| ----------------- | ------------------------- | ---------------------------------- |
| name              | `Landing Page Contact`    | Internal label                     |
| user              | → system user ID          | Owned by system account            |
| telegram_chat_id  | (empty)                   | Configured post-deployment by admin|

**Purpose**: Receives "Contact Us" form submissions from the landing page. The form ID is exposed to the frontend via `NEXT_PUBLIC_LANDING_FORM_ID` environment variable.

### Landing Page Widget (in `widgets` collection)

| Field             | Value                     | Notes                              |
| ----------------- | ------------------------- | ---------------------------------- |
| name              | `Landing Page Widget`     | Internal label                     |
| user              | → system user ID          | Owned by system account            |
| button_text       | `Send Inquiry`            | Default CTA text                   |
| greeting          | `Hi! How can we help?`   | Default greeting                   |
| questions         | (default B2B template)    | See below                          |
| active            | `true`                    | Enabled by default                 |
| telegram_chat_id  | (empty)                   | Configured post-deployment by admin|

**Default questions** (same as widget default template):
```json
[
  { "id": "q1", "label": "Which country are you from?", "type": "text", "required": true, "options": null },
  { "id": "q2", "label": "Company Name", "type": "text", "required": true, "options": null },
  { "id": "q3", "label": "Purchase Quantity", "type": "single-select", "required": true, "options": ["< 100 pcs", "100-500 pcs", "500-1000 pcs", "1000+ pcs"] },
  { "id": "q4", "label": "When do you need the products?", "type": "single-select", "required": true, "options": ["Within 1 month", "1-3 months", "3-6 months", "Just researching"] },
  { "id": "q5", "label": "Your Email", "type": "email", "required": true, "options": null },
  { "id": "q6", "label": "Tell us about your requirements", "type": "text", "required": false, "options": null }
]
```

**Purpose**: Powers the floating inquiry widget on the landing page. The widget ID is exposed to the frontend via `NEXT_PUBLIC_LANDING_WIDGET_ID` environment variable.

## Entity Relationships (unchanged)

```
system_user (1:1) landing_form (1:N) submissions
system_user (1:1) landing_widget (1:N) inquiries
                  landing_widget (1:N) visitor_records
```

## Migration Idempotency

The migration MUST be idempotent:
1. Check if a user with email `system@formhandler.local` already exists
2. If not, create the user, form, and widget
3. If yes, skip creation (do nothing)

This ensures re-running migrations (e.g., on redeployment) does not create duplicate records.

## New Environment Variables

| Variable                        | Example Value              | Where Used    |
| ------------------------------- | -------------------------- | ------------- |
| `NEXT_PUBLIC_LANDING_FORM_ID`   | `<form record ID>`        | Frontend      |
| `NEXT_PUBLIC_LANDING_WIDGET_ID` | `<widget record ID>`      | Frontend      |

These are set after the first deployment (after migration creates the records). The IDs are stable PocketBase record IDs.
