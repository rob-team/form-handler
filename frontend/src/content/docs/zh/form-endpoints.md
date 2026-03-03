---
title: "表单端点使用文档 — FormHandler"
description: "了解如何创建表单端点、嵌入HTML表单、接收提交并配置Telegram通知。"
subtitle: "Form Endpoints 让你在几秒内创建表单提交端点。只需将端点 URL 粘贴到你网站的 HTML 表单中，即可开始收集客户数据。"
---

## 快速开始

只需 4 步，即可从零开始接收第一条表单提交。

### 1. 创建表单

登录 FormHandler 后台，点击「新建表单」按钮，输入表单名称，然后点击创建。

![创建表单界面](/docs/screenshots/zh/create-form.png)

### 2. 复制端点 URL

创建完成后，你会看到一个唯一的端点 URL。点击复制按钮即可。

### 3. 嵌入到你的 HTML 表单

将端点 URL 设为你 HTML 表单的 action 属性，使用 POST 方法：

```html
<form action="https://your-pocketbase-url.com/api/submit/YOUR_FORM_ID" method="post">
  <input type="text" name="name" placeholder="您的姓名" required />
  <input type="email" name="email" placeholder="您的邮箱" required />
  <textarea name="message" placeholder="您的留言"></textarea>
  <button type="submit">提交</button>
</form>
```

将 YOUR_FORM_ID 替换为你的实际表单 ID。

### 4. 接收提交

当访客提交表单后，数据会自动出现在你的 FormHandler 后台中。你可以在表单详情页查看所有提交，按时间倒序排列。

![表单提交列表](/docs/screenshots/zh/form-submissions.png)

---

## 自定义重定向

默认情况下，表单提交后访客会被重定向到一个通用的成功页面。你可以通过添加一个名为 _next 的隐藏字段来指定自定义的跳转 URL：

```html
<form action="https://your-pocketbase-url.com/api/submit/YOUR_FORM_ID" method="post">
  <input type="hidden" name="_next" value="https://yoursite.com/thank-you" />
  <input type="text" name="name" required />
  <input type="email" name="email" required />
  <button type="submit">提交</button>
</form>
```

> `_next` 字段必须是一个有效的绝对 URL（以 `http://` 或 `https://` 开头）。该字段不会被存储到提交数据中——它仅用于控制重定向。

## 查看和管理提交

在后台的表单详情页中，你可以：

- 查看所有提交的字段名和对应的值
- 按时间顺序浏览（最新的在前面）
- 翻页浏览大量提交
- 删除单条提交

## Telegram 通知

你可以配置 Telegram 通知，在收到新提交时立即收到推送消息。

![Telegram设置](/docs/screenshots/zh/telegram-setup.png)

### 设置步骤

1. 在 Telegram 中搜索 @FormSaaSBot 并发送 /start
2. 向 @userinfobot 发送消息以获取你的 Chat ID
3. 进入表单设置页，粘贴你的 Chat ID 并保存

如果需要将通知发送到 Telegram 群组，将机器人添加到群组中，然后使用群组 Chat ID（格式如 -100XXXXXXXXXX）。

通知不会影响表单提交——即使通知发送失败，提交的数据也会正常保存。

---

## 完整示例

以下是一个完整的 HTML 页面示例。你可以将它保存为 .html 文件，在浏览器中打开来测试你的表单端点（记得替换 YOUR_FORM_ID）。

```html
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>联系我们</title>
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
  <h1>联系我们</h1>
  <form action="https://your-pocketbase-url.com/api/submit/YOUR_FORM_ID" method="post">
    <input type="hidden" name="_next" value="https://yoursite.com/thank-you" />
    <input type="text" name="name" placeholder="您的姓名" required />
    <input type="email" name="email" placeholder="您的邮箱" required />
    <textarea name="message" placeholder="请输入您的留言..."></textarea>
    <button type="submit">发送消息</button>
  </form>
</body>
</html>
```
