# Contract: Telegram Notification Format

**Feature Branch**: `002-inquiry-widget` | **Date**: 2026-03-02

## Trigger

Sent automatically after a new inquiry is created via the widget submission endpoint. Uses the existing platform-wide `TELEGRAM_BOT_TOKEN` environment variable.

## Message Format

```
📩 New Inquiry

🌐 Widget: {widget_name}
📄 Page: {page_url}
🕐 Time: {timestamp}
🏳️ Country: {country_code}

--- Responses ---
Q: {question_label_1}
A: {answer_1}

Q: {question_label_2}
A: {answer_2}

Q: {question_label_3}
A: {answer_3}
...
```

## Example

```
📩 New Inquiry

🌐 Widget: Main Website
📄 Page: https://example.com/products
🕐 Time: 2026-03-02 14:30:00 UTC
🏳️ Country: DE

--- Responses ---
Q: Which country are you from?
A: Germany

Q: Company Name
A: Müller GmbH

Q: Purchase Quantity
A: 500-1000 pcs

Q: Expected Order Timeline
A: 1-3 months

Q: Business Email
A: info@muller.de

Q: Please describe your requirements
A: We need 800 units of model X with custom branding.
```

## Delivery

- **API**: `POST https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage`
- **Payload**: `{ chat_id: "{widget.telegram_chat_id}", text: "{formatted_message}", parse_mode: "HTML" }`
- **Timeout**: 15 seconds
- **Failure handling**: Log error, do not retry, do not affect inquiry save
- **Condition**: Only sent if `widget.telegram_chat_id` is non-empty AND `TELEGRAM_BOT_TOKEN` env var is set
