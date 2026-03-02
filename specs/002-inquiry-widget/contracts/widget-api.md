# API Contract: Widget Public Endpoints

**Feature Branch**: `002-inquiry-widget` | **Date**: 2026-03-02

These endpoints are called by the embeddable widget from external websites. They do NOT require authentication.

---

## GET /api/widget/{widgetId}

Fetches the widget configuration (questions, button text, greeting) for rendering the conversational form. Called when the widget script loads on the host page.

**Request**:
- Method: `GET`
- Path: `/api/widget/{widgetId}` where `widgetId` is the 15-char PocketBase record ID
- Auth: None (public endpoint)

**Response 200** (widget found and active):
```json
{
  "id": "abc123def456ghi",
  "button_text": "Send Inquiry",
  "greeting": "Hi! We'd love to help you. Please answer a few questions so we can assist you better.",
  "questions": [
    {
      "id": "q1",
      "label": "Which country are you from?",
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
    }
  ]
}
```

**Response 404** (widget not found or inactive):
```json
{
  "code": 404,
  "message": "Widget not found."
}
```

**Notes**:
- Only returns `id`, `button_text`, `greeting`, and `questions` — no internal fields (user, telegram_chat_id, etc.)
- Inactive widgets (`active=false`) return 404
- Response should include CORS headers allowing any origin (`Access-Control-Allow-Origin: *`)

---

## POST /api/widget/{widgetId}/submit

Submits a completed inquiry from the widget. Called when a visitor completes all questions.

**Request**:
- Method: `POST`
- Path: `/api/widget/{widgetId}/submit`
- Auth: None (public endpoint)
- Content-Type: `application/json`
- Body limit: 1 MB

```json
{
  "responses": [
    {
      "question_id": "q1",
      "question_label": "Which country are you from?",
      "answer": "Germany"
    },
    {
      "question_id": "q2",
      "question_label": "Company Name",
      "answer": "Müller GmbH"
    },
    {
      "question_id": "q5",
      "question_label": "Business Email",
      "answer": "info@muller.de"
    }
  ],
  "page_url": "https://example.com/products/widget-abc"
}
```

**Response 200** (inquiry saved):
```json
{
  "success": true,
  "id": "xyz789abc123def"
}
```

**Response 400** (validation error):
```json
{
  "code": 400,
  "message": "Validation failed.",
  "data": {
    "responses": {
      "code": "validation_required",
      "message": "Responses are required."
    }
  }
}
```

**Response 404** (widget not found or inactive):
```json
{
  "code": 404,
  "message": "Widget not found."
}
```

**Server-side processing** (after saving inquiry):
1. Extract visitor IP from request headers (supports reverse proxy `X-Forwarded-For`, `X-Real-IP`)
2. Derive country from IP via Cloudflare `CF-IPCountry` header or fallback geolocation API
3. Create inquiry record with responses + metadata (IP, country, page_url)
4. If widget has `telegram_chat_id` configured, send Telegram notification (best-effort, non-blocking)

**Validation rules**:
- `responses` must be a non-empty array
- Each response must have `question_id`, `question_label`, and `answer` (string)
- For questions with `type: "email"`, `answer` must be valid email format
- `page_url` is optional

**Notes**:
- CORS headers: `Access-Control-Allow-Origin: *`
- Telegram failures do not affect the response — inquiry is always saved

---

## POST /api/widget/{widgetId}/visit

Records a page visit event. Called when the embed code loads on the host page.

**Request**:
- Method: `POST`
- Path: `/api/widget/{widgetId}/visit`
- Auth: None (public endpoint)
- Content-Type: `application/json`

```json
{
  "page_url": "https://example.com/about"
}
```

**Response 200** (visit recorded):
```json
{
  "success": true
}
```

**Response 404** (widget not found or inactive):
```json
{
  "code": 404,
  "message": "Widget not found."
}
```

**Server-side processing**:
1. Extract visitor IP from request headers
2. Derive country from IP
3. Create visitor_record with page_url, IP, country

**Notes**:
- Fire-and-forget from widget perspective — the widget does not wait for this response
- CORS headers: `Access-Control-Allow-Origin: *`
- Rate limiting: Consider limiting to 1 visit record per IP per page per 5 minutes to prevent abuse
