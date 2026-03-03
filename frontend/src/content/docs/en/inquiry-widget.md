---
title: "Inquiry Widget Documentation — FormHandler"
description: "Learn how to create an inquiry widget, configure questions, embed it on your website, view inquiries, and configure Telegram notifications."
subtitle: "The Inquiry Widget is a lightweight, embeddable chat widget that guides your website visitors through structured B2B trade inquiries via a conversational flow."
---

## Quickstart

Get from zero to your first inquiry in just 5 steps.

### 1. Create a Widget

Log in to your FormHandler dashboard and click the "New Widget" button. A widget with a default B2B trade question template will be created automatically.

![Create widget screen](/docs/screenshots/en/create-widget.png)

### 2. Configure Questions

Customize your questions on the widget settings page. You can add, remove, reorder questions, and set each question's type and options.

![Question configuration](/docs/screenshots/en/widget-questions.png)

Three question types are supported:

- **Text** — Free-text input for open-ended questions like name, company, requirements
- **Email** — Text input with email format validation
- **Single-Select** — Choose from predefined options, ideal for purchase quantity, timeline, etc.

### 3. Copy the Embed Code

Find the embed code section on the settings page and click the copy button to grab your code snippet.

![Embed code](/docs/screenshots/en/widget-embed-code.png)

```html
<script>
  (function(w, d, s) {
    w.FormHandler = w.FormHandler || {};
    w.FormHandler.widgetId = "YOUR_WIDGET_ID";
    w.FormHandler.apiBase = "https://your-pocketbase-url.com";
    var f = d.createElement(s), t = d.getElementsByTagName(s)[0];
    f.async = true;
    f.src = "https://your-widget-url.com/widget.js";
    t.parentNode.insertBefore(f, t);
  })(window, document, "script");
</script>
```

Replace YOUR_WIDGET_ID with your actual widget ID.

### 4. Paste on Your Website

Paste the code above just before the `</body>` tag in your website's HTML. The widget will automatically display a floating button at the bottom-right corner of the page.

### 5. Receive Inquiries

When a visitor completes all questions through the widget and submits, the inquiry data appears automatically in your FormHandler dashboard.

![Inquiries list](/docs/screenshots/en/widget-inquiries.png)

---

## Question Customization

In the Questions section of your widget settings page, you can fully customize the questions visitors will answer. A default B2B trade inquiry template is provided, which you can freely modify to match your business needs.

![Question editor](/docs/screenshots/en/question-editor.png)

### Editing a Question

Each question card includes the following configurable fields:

- **Question label** — The text visitors see in the chat flow
- **Type** — Choose from the dropdown: Text, Email, or Single Select
- **Required** — When checked, visitors must answer this question before proceeding
- **Options** — Only shown when type is "Single Select". Click "+ Add option" to add choices, click × to remove

### Managing Questions

- **Add** — Click the "+ Add Question" button at the bottom to add a new question
- **Remove** — Click the × button on the right side of a question card to remove it (at least one question must remain)
- **Reorder** — Use the ↑ ↓ arrow buttons to change the display order. Visitors answer questions from top to bottom

After making changes, click the "Save Settings" button at the bottom of the page to apply your changes.

---

## Question Types in Detail

### Text

Visitors can type freely. Ideal for collecting names, company names, detailed requirements, etc. Can be set as required or optional.

### Email

Similar to text, but automatically validates email format. If the visitor enters an invalid email address, they'll be prompted to try again.

### Single-Select

Displayed as a group of clickable buttons. You configure the option list in advance. Visitors simply click an option to answer — ideal for standardized choices like purchase quantity ranges, expected timelines, etc.

## Customizing the Widget

On the widget settings page, you can customize:

- **Widget name** — Displayed in dashboard only (not visible to visitors)
- **Button text** — Text on the floating button (default: "Send Inquiry", max 30 characters)
- **Greeting message** — Welcome message shown when the widget opens (max 500 characters)
- **Active/Inactive** — Controls whether the widget appears on your website

## Viewing and Managing Inquiries

On the widget detail page in your dashboard, you can:

- View all inquiry question-answer pairs
- Filter inquiries by country
- Expand to view full details including the visitor's page URL, IP, and country
- Delete individual inquiries

## Telegram Notifications

You can configure Telegram notifications to receive a push message with the visitor's complete answers when a new inquiry arrives.

### Setup Steps

1. Search for @FormSaaSBot on Telegram and send /start
2. Message @userinfobot to get your Chat ID
3. Go to your widget settings page, paste your Chat ID, and save
4. Click the "Test Connection" button to verify your setup

To send notifications to a Telegram group, add the bot to the group and use the group Chat ID (format: -100XXXXXXXXXX).

## Visitor Analytics

The Inquiry Widget includes built-in visitor analytics that automatically tracks visitor activity. On the "Visitor Activity" tab of your widget detail page, you can view:

![Visitor analytics](/docs/screenshots/en/visitor-analytics.png)

- **Total Visits** — Total page views where the widget loaded
- **Unique Visitors** — Count of distinct visitor IPs
- **Total Inquiries** — Number of completed inquiry submissions
- **Top Countries** — Top 10 countries by visit count

Country detection is automatic based on visitor IP addresses — no additional configuration needed.

---

## Full Example

Here's a complete HTML page you can save as a .html file and open in your browser to test your inquiry widget (remember to replace YOUR_WIDGET_ID and the relevant URLs).

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Website</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 40px auto; padding: 0 20px; }
  </style>
</head>
<body>
  <h1>Welcome to My Website</h1>
  <p>The inquiry widget will appear automatically at the bottom-right corner.</p>

  <script>
    (function(w, d, s) {
      w.FormHandler = w.FormHandler || {};
      w.FormHandler.widgetId = "YOUR_WIDGET_ID";
      w.FormHandler.apiBase = "https://your-pocketbase-url.com";
      var f = d.createElement(s), t = d.getElementsByTagName(s)[0];
      f.async = true;
      f.src = "https://your-widget-url.com/widget.js";
      t.parentNode.insertBefore(f, t);
    })(window, document, "script");
  </script>
</body>
</html>
```
