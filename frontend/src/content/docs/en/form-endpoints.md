---
title: "Form Endpoints Documentation — FormHandler"
description: "Learn how to create form endpoints, embed HTML forms, receive submissions, and configure Telegram notifications."
subtitle: "Form Endpoints lets you create form submission endpoints in seconds. Paste an endpoint URL into your website's HTML form and start collecting customer data instantly."
---

## Quickstart

Get from zero to your first form submission in just 4 steps.

### 1. Create a Form

Log in to your FormHandler dashboard, click the "New Form" button, enter a name for your form, and click create.

![Create form screen](/docs/screenshots/en/create-form.png)

### 2. Copy the Endpoint URL

After creation, you'll see a unique endpoint URL. Click the copy button to grab it.

### 3. Embed in Your HTML Form

Set the endpoint URL as your HTML form's action attribute with the POST method:

```html
<form action="https://your-pocketbase-url.com/api/submit/YOUR_FORM_ID" method="post">
  <input type="text" name="name" placeholder="Your name" required />
  <input type="email" name="email" placeholder="Your email" required />
  <textarea name="message" placeholder="Your message"></textarea>
  <button type="submit">Submit</button>
</form>
```

Replace YOUR_FORM_ID with your actual form ID.

### 4. Receive Submissions

When a visitor submits the form, the data appears automatically in your FormHandler dashboard. View all submissions on the form detail page, sorted by newest first.

![Form submissions list](/docs/screenshots/en/form-submissions.png)

---

## Custom Redirect

By default, visitors are redirected to a generic success page after submission. You can specify a custom redirect URL by adding a hidden field named _next:

```html
<form action="https://your-pocketbase-url.com/api/submit/YOUR_FORM_ID" method="post">
  <input type="hidden" name="_next" value="https://yoursite.com/thank-you" />
  <input type="text" name="name" required />
  <input type="email" name="email" required />
  <button type="submit">Submit</button>
</form>
```

> The `_next` field must be a valid absolute URL (starting with `http://` or `https://`). This field is never stored in the submission data — it's only used for redirecting.

## Viewing and Managing Submissions

On the form detail page in your dashboard, you can:

- View all submitted field names and their values
- Browse submissions chronologically (newest first)
- Paginate through large numbers of submissions
- Delete individual submissions

## Telegram Notifications

You can configure Telegram notifications to receive a push message instantly when a new submission arrives.

![Telegram setup](/docs/screenshots/en/telegram-setup.png)

### Setup Steps

1. Search for @FormSaaSBot on Telegram and send /start
2. Message @userinfobot to get your Chat ID
3. Go to your form settings page, paste your Chat ID, and save

To send notifications to a Telegram group, add the bot to the group and use the group Chat ID (format: -100XXXXXXXXXX).

Notifications never affect form submissions — even if a notification fails to send, the submitted data is saved as normal.

---

## Full Example

Here's a complete HTML page you can save as a .html file and open in your browser to test your form endpoint (remember to replace YOUR_FORM_ID).

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Contact Us</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 480px; margin: 40px auto; padding: 0 20px; }
    form { display: flex; flex-direction: column; gap: 12px; }
    input, textarea { padding: 8px 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; }
    textarea { min-height: 100px; resize: vertical; }
    button { padding: 10px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
    button:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <h1>Contact Us</h1>
  <form action="https://your-pocketbase-url.com/api/submit/YOUR_FORM_ID" method="post">
    <input type="hidden" name="_next" value="https://yoursite.com/thank-you" />
    <input type="text" name="name" placeholder="Your name" required />
    <input type="email" name="email" placeholder="Your email" required />
    <textarea name="message" placeholder="Your message..."></textarea>
    <button type="submit">Send Message</button>
  </form>
</body>
</html>
```
