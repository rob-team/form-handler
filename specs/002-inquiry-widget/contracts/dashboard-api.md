# API Contract: Dashboard Endpoints

**Feature Branch**: `002-inquiry-widget` | **Date**: 2026-03-02

These endpoints use PocketBase's standard collection API. All require authentication.

---

## Widgets Collection API

Uses PocketBase built-in CRUD at `/api/collections/widgets/records`.

### List Widgets

```
GET /api/collections/widgets/records
Authorization: Bearer {token}
```

Response returns only widgets owned by the authenticated user (enforced by access rules).

### Create Widget

```
POST /api/collections/widgets/records
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "My Website Widget",
  "user": "{authenticated_user_id}",
  "button_text": "Send Inquiry",
  "greeting": "Hi! We'd love to help you.",
  "questions": [
    {"id": "q1", "label": "Which country are you from?", "type": "text", "required": true, "options": null},
    {"id": "q2", "label": "Company Name", "type": "text", "required": true, "options": null},
    {"id": "q3", "label": "Purchase Quantity", "type": "single-select", "required": true, "options": ["< 100 pcs", "100-500 pcs", "500-1000 pcs", "1000+ pcs"]},
    {"id": "q4", "label": "Expected Order Timeline", "type": "single-select", "required": true, "options": ["Within 1 month", "1-3 months", "3-6 months", "6+ months"]},
    {"id": "q5", "label": "Business Email", "type": "email", "required": true, "options": null},
    {"id": "q6", "label": "Please describe your requirements", "type": "text", "required": false, "options": null}
  ],
  "telegram_chat_id": "",
  "active": true
}
```

### Update Widget

```
PATCH /api/collections/widgets/records/{widgetId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "questions": [...updated questions...],
  "telegram_chat_id": "123456789"
}
```

### Delete Widget

```
DELETE /api/collections/widgets/records/{widgetId}
Authorization: Bearer {token}
```

Cascades: deletes all related inquiries and visitor_records.

---

## Inquiries Collection API

Uses PocketBase built-in read/delete at `/api/collections/inquiries/records`. Create/update disabled (hook-only).

### List Inquiries

```
GET /api/collections/inquiries/records?filter=(widget="{widgetId}")&sort=-created&page=1&perPage=20
Authorization: Bearer {token}
```

Access rule ensures only the widget owner can list. Supports PocketBase filter/sort/pagination.

**Common filters**:
- By country: `filter=(country="DE")`
- By date range: `filter=(created>="2026-01-01" && created<="2026-03-01")`
- Combined: `filter=(widget="{widgetId}" && country="DE")`

### View Inquiry Detail

```
GET /api/collections/inquiries/records/{inquiryId}
Authorization: Bearer {token}
```

### Delete Inquiry

```
DELETE /api/collections/inquiries/records/{inquiryId}
Authorization: Bearer {token}
```

---

## Visitor Records Collection API

Uses PocketBase built-in read at `/api/collections/visitor_records/records`. Create/update/delete disabled for API clients.

### List Visitor Records

```
GET /api/collections/visitor_records/records?filter=(widget="{widgetId}")&sort=-created&page=1&perPage=50
Authorization: Bearer {token}
```

### Aggregate Statistics

PocketBase does not natively support aggregation queries. Dashboard computes summary stats client-side from paginated results, or a custom PocketBase hook provides pre-computed stats:

```
GET /api/widget/{widgetId}/stats
Authorization: Bearer {token}
```

Response:
```json
{
  "total_visits": 1542,
  "unique_visitors": 823,
  "total_inquiries": 47,
  "top_countries": [
    {"country": "US", "count": 312},
    {"country": "DE", "count": 198},
    {"country": "GB", "count": 145}
  ],
  "period": "all_time"
}
```
