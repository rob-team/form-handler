# Data Model: B2B Inquiry Widget

**Feature Branch**: `002-inquiry-widget` | **Date**: 2026-03-02

## Entity Relationship Diagram

```
users (existing, reused from 001)
  │
  ├── 1:N ── forms (existing, unchanged)
  │            └── 1:N ── submissions (existing, unchanged)
  │
  └── 1:N ── widgets (NEW)
               ├── 1:N ── inquiries (NEW)
               └── 1:N ── visitor_records (NEW)
```

## Collections

### users (existing — no changes)

Reuses the PocketBase built-in `_pb_users_auth_` collection. No custom fields added.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | auto | 15-char PocketBase ID |
| email | email | yes | Unique, validated |
| password | string | yes | Bcrypt-hashed by PocketBase |
| verified | bool | auto | Email verification status |
| created | datetime | auto | onCreate |
| updated | datetime | auto | onCreate + onUpdate |

### widgets (NEW)

An embeddable inquiry widget with configurable questions. Each user has one widget (v1 scope).

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| id | string | auto | 15-char | PocketBase ID |
| user | relation | yes | → users, cascadeDelete | Owner |
| name | text | yes | 1-100 chars | Display name in dashboard |
| button_text | text | no | max 30 chars | Floating button label, default: "Send Inquiry" |
| greeting | text | no | max 500 chars | Welcome message shown when widget opens |
| questions | json | yes | see schema below | Ordered list of questions |
| telegram_chat_id | text | no | | Telegram chat/group ID for notifications |
| active | bool | yes | default: true | Whether widget is live |
| created | datetime | auto | | onCreate |
| updated | datetime | auto | | onCreate + onUpdate |

**Questions JSON Schema**:
```json
[
  {
    "id": "q1",
    "label": "Which country are you from?",
    "type": "text",
    "required": true,
    "options": null
  },
  {
    "id": "q2",
    "label": "Company Name",
    "type": "text",
    "required": true,
    "options": null
  },
  {
    "id": "q3",
    "label": "Purchase Quantity",
    "type": "single-select",
    "required": true,
    "options": ["< 100 pcs", "100-500 pcs", "500-1000 pcs", "1000+ pcs"]
  },
  {
    "id": "q4",
    "label": "Expected Order Timeline",
    "type": "single-select",
    "required": true,
    "options": ["Within 1 month", "1-3 months", "3-6 months", "6+ months"]
  },
  {
    "id": "q5",
    "label": "Business Email",
    "type": "email",
    "required": true,
    "options": null
  },
  {
    "id": "q6",
    "label": "Please describe your requirements",
    "type": "text",
    "required": false,
    "options": null
  }
]
```

**Question types**:
- `text`: Free-text input
- `email`: Free-text input with email format validation
- `single-select`: Dropdown/button group with predefined `options` array

**Validation rules**:
- `questions` must be a non-empty JSON array (at least 1 question)
- Each question must have `id` (unique within array), `label` (non-empty string), `type` (one of: text, email, single-select), `required` (boolean)
- `options` must be a non-empty array of strings when `type` is `single-select`; must be null for other types

**Access rules**:
- list/view: `@request.auth.id = user` (owner only)
- create: `@request.auth.id != ""` (any authenticated user)
- update: `@request.auth.id = user` (owner only)
- delete: `@request.auth.id = user` (owner only)

### inquiries (NEW)

A completed visitor submission through a widget. Stores question-answer pairs as a JSON snapshot plus typed metadata fields for filtering.

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| id | string | auto | 15-char | PocketBase ID |
| widget | relation | yes | → widgets, cascadeDelete | Parent widget |
| responses | json | yes | see schema below | Q&A pairs at time of submission |
| page_url | url | no | | Page where inquiry was submitted |
| visitor_ip | text | no | max 45 chars | Visitor IP address (IPv4 or IPv6) |
| country | text | no | max 2 chars | ISO 3166-1 alpha-2 country code |
| created | datetime | auto | | onCreate (= submission time) |
| updated | datetime | auto | | onCreate + onUpdate |

**Responses JSON Schema**:
```json
[
  {
    "question_id": "q1",
    "question_label": "Which country are you from?",
    "answer": "Germany"
  },
  {
    "question_id": "q5",
    "question_label": "Business Email",
    "answer": "buyer@example.com"
  }
]
```

Each entry preserves the question label at time of submission (FR-020), so inquiry records remain meaningful even if the widget's questions are later changed.

**Access rules**:
- list/view: `@request.auth.id = widget.user` (widget owner only)
- create: `""` (disabled for public API — only PocketBase hooks can create)
- update: `""` (immutable)
- delete: `@request.auth.id = widget.user` (owner only)

### visitor_records (NEW)

A page visit event recorded by the embed code for basic traffic analytics.

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| id | string | auto | 15-char | PocketBase ID |
| widget | relation | yes | → widgets, cascadeDelete | Associated widget |
| page_url | url | yes | | Full page URL visited |
| visitor_ip | text | no | max 45 chars | Visitor IP address |
| country | text | no | max 2 chars | ISO 3166-1 alpha-2 |
| created | datetime | auto | | onCreate (= visit time) |

**Access rules**:
- list/view: `@request.auth.id = widget.user` (widget owner only)
- create: `""` (disabled for public API — only PocketBase hooks can create)
- update: `""` (immutable)
- delete: `""` (disabled — managed by system/cascade only)

## Default Question Template

When a new widget is created, the `questions` field is initialized with this B2B trade default:

| # | Label | Type | Required | Options |
|---|-------|------|----------|---------|
| 1 | Which country are you from? | text | yes | — |
| 2 | Company Name | text | yes | — |
| 3 | Purchase Quantity | single-select | yes | < 100 pcs, 100-500 pcs, 500-1000 pcs, 1000+ pcs |
| 4 | Expected Order Timeline | single-select | yes | Within 1 month, 1-3 months, 3-6 months, 6+ months |
| 5 | Business Email | email | yes | — |
| 6 | Please describe your requirements | text | no | — |

## State Transitions

### Widget Lifecycle
```
Created (active=true, default questions)
  → Questions Configured (user edits questions)
  → Telegram Configured (user adds chat ID)
  → Active / Inactive (user toggles active flag)
  → Deleted (cascade deletes inquiries + visitor_records)
```

### Inquiry Lifecycle
```
Submitted (created via hook from widget POST)
  → Telegram Notified (async, best-effort)
  → Viewed in Dashboard (read-only)
  → Deleted (by owner or cascade)
```
