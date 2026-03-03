# Contracts: Landing Page Interactions

**Branch**: `004-landing-page` | **Date**: 2026-03-03

## Overview

No new API endpoints are introduced. The landing page interacts with existing endpoints. This document defines the expected interaction contracts for testing purposes.

## Contract 1: Contact Form Submission (AJAX)

**Endpoint**: `POST /api/submit/{formId}` (existing, no changes)
**Consumer**: Landing page "Contact Us" form (client-side fetch)

### Request

```
POST /api/submit/{NEXT_PUBLIC_LANDING_FORM_ID}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I'm interested in your services."
}
```

### Expected Response (success)

```
HTTP/1.1 302 Found
Location: {FRONTEND_URL}/success?ref=...
```

When called with `fetch(..., { redirect: 'manual' })`:
- Response type: `opaqueredirect`
- Response status: `0` (opaque)
- Indicates: submission was created successfully

### Expected Response (form not found)

```
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "message": "Form not found."
}
```

### Test Cases

1. **Happy path**: POST valid JSON → receive 302 redirect (opaqueredirect with manual mode)
2. **Invalid form ID**: POST to non-existent form → receive 404
3. **Empty body**: POST with empty body → submission created with empty data field (existing behavior)
4. **Missing fields**: POST with partial data → submission created with available fields (existing behavior — form endpoint accepts any fields)

## Contract 2: Widget Configuration Fetch

**Endpoint**: `GET /api/widget/{widgetId}` (existing, no changes)
**Consumer**: Widget embed script on landing page

### Request

```
GET /api/widget/{NEXT_PUBLIC_LANDING_WIDGET_ID}
```

### Expected Response (success)

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "...",
  "button_text": "Send Inquiry",
  "greeting": "Hi! How can we help?",
  "questions": [...]
}
```

### Expected Response (widget inactive or not found)

```
HTTP/1.1 404 Not Found
```

### Test Cases

1. **Happy path**: GET active widget → receive 200 with config
2. **Widget not found**: GET non-existent ID → receive 404

## Contract 3: Widget Inquiry Submission

**Endpoint**: `POST /api/widget/{widgetId}/submit` (existing, no changes)
**Consumer**: Widget embed script on landing page

### Request

```
POST /api/widget/{NEXT_PUBLIC_LANDING_WIDGET_ID}/submit
Content-Type: application/json

{
  "responses": [
    { "question_id": "q1", "question_label": "Which country are you from?", "answer": "China" },
    { "question_id": "q5", "question_label": "Your Email", "answer": "visitor@example.com" }
  ],
  "page_url": "https://formhandler.com/en"
}
```

### Expected Response (success)

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "...",
  "widget": "...",
  "responses": [...],
  "page_url": "...",
  "created": "..."
}
```

### Test Cases

1. **Happy path**: POST valid inquiry → receive 200 with created record
2. **Widget not found**: POST to non-existent widget → receive 404
