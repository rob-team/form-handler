# Data Model: Landing Page

**Branch**: `004-landing-page` | **Date**: 2026-03-03

## Overview

No new collections or migrations are introduced. This feature dogfoods existing collections (`forms`, `widgets`, `submissions`, `inquiries`, `visitor_records`) via manually created records.

## Manual Setup (Admin)

The site admin creates the following records via the PocketBase dashboard, then configures their IDs as environment variables.

### Landing Page Form (in `forms` collection)

| Field             | Value                     | Notes                              |
| ----------------- | ------------------------- | ---------------------------------- |
| name              | `Landing Page Contact`    | Internal label (any name works)    |
| user              | → admin user ID           | Owned by admin account             |
| telegram_chat_id  | (optional)                | Set if Telegram notifications desired |

### Landing Page Widget (in `widgets` collection)

| Field             | Value                     | Notes                              |
| ----------------- | ------------------------- | ---------------------------------- |
| name              | `Landing Page Widget`     | Internal label (any name works)    |
| user              | → admin user ID           | Owned by admin account             |
| button_text       | `Send Inquiry`            | Default CTA text                   |
| greeting          | `Hi! How can we help?`    | Default greeting                   |
| questions         | (B2B question template)   | See below                          |
| active            | `true`                    | Must be active                     |
| telegram_chat_id  | (optional)                | Set if Telegram notifications desired |

**Suggested questions** (customizable):
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

## Environment Variables

| Variable                        | Example Value              | Where Used    |
| ------------------------------- | -------------------------- | ------------- |
| `NEXT_PUBLIC_LANDING_FORM_ID`   | `<form record ID>`        | Frontend      |
| `NEXT_PUBLIC_LANDING_WIDGET_ID` | `<widget record ID>`      | Frontend      |

Copy the record IDs from the PocketBase dashboard after creating the form and widget.

## Entity Relationships (unchanged)

```
admin_user (1:1) landing_form (1:N) submissions
admin_user (1:1) landing_widget (1:N) inquiries
                 landing_widget (1:N) visitor_records
```

All submissions and inquiries from the landing page appear in the admin's dashboard.
