---
title: "询盘组件使用文档 — FormHandler"
description: "了解如何创建询盘组件、配置问题、嵌入到你的网站、查看询盘并配置Telegram通知。"
subtitle: "Inquiry Widget 是一个轻量级、可嵌入的聊天组件，通过结构化的对话流程引导你的网站访客完成 B2B 贸易询盘。"
---

## 快速开始

只需 5 步，即可从零开始接收第一条询盘。

### 1. 创建组件

登录 FormHandler 后台，点击「新建组件」按钮。系统会自动创建一个带有默认 B2B 贸易问题模板的组件。

![创建组件界面](/docs/screenshots/zh/create-widget.png)

### 2. 配置问题

在组件设置页面中自定义你的问题。你可以添加、删除、重新排序问题，并设置每个问题的类型和选项。

![问题配置](/docs/screenshots/zh/widget-questions.png)

支持三种问题类型：

- **文本** — 自由文本输入，适用于姓名、公司名等开放式问题
- **邮箱** — 带邮箱格式验证的文本输入
- **单选** — 从预设选项中选择一个，适用于采购数量、时间线等

### 3. 复制嵌入代码

在设置页面找到嵌入代码区域，点击复制按钮获取你的代码片段。

![嵌入代码](/docs/screenshots/zh/widget-embed-code.png)

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

将 YOUR_WIDGET_ID 替换为你的实际组件 ID。

### 4. 粘贴到你的网站

将上面的代码粘贴到你网站 HTML 的 `</body>` 标签之前。组件会自动在页面右下角显示一个浮动按钮。

### 5. 接收询盘

当访客通过组件完成所有问题并提交后，询盘数据会自动出现在你的 FormHandler 后台中。

![询盘列表](/docs/screenshots/zh/widget-inquiries.png)

---

## 问题定制

在组件设置页面的「问题」区域，你可以完全自定义访客需要回答的问题。系统默认提供一套 B2B 贸易询盘模板，你可以根据业务需要自由修改。

![问题编辑器](/docs/screenshots/zh/question-editor.png)

### 编辑问题

每个问题卡片包含以下可配置项：

- **问题文本** — 输入框中填写访客看到的问题内容
- **类型** — 从下拉菜单中选择：文本（Text）、邮箱（Email）或单选（Single Select）
- **必填** — 勾选后，访客必须回答此问题才能继续下一步
- **选项** — 仅当类型为「单选」时显示。点击「+ 添加选项」可新增选项，点击 × 可删除选项

### 管理问题列表

- **添加问题** — 点击底部的「+ 添加问题」按钮新增一个问题
- **删除问题** — 点击问题卡片右侧的 × 按钮删除该问题（至少保留一个问题）
- **调整顺序** — 使用 ↑ ↓ 箭头按钮调整问题的显示顺序，访客会按照从上到下的顺序回答

修改完成后，点击页面底部的「保存设置」按钮使更改生效。

---

## 问题类型详解

### 文本（Text）

访客可以自由输入文字。适合用于收集姓名、公司名、详细需求等信息。可以设置为必填或选填。

### 邮箱（Email）

与文本类型类似，但会自动验证邮箱格式。如果访客输入的不是有效的邮箱地址，会提示重新输入。

### 单选（Single-Select）

显示为可点击的按钮组。你需要在配置中预设选项列表。访客只需点击一个选项即可回答，非常适合标准化的选择题，如采购数量范围、预期时间线等。

## 自定义组件

在组件设置页面中，你可以自定义以下内容：

- **组件名称** — 在后台中显示的名称（不对访客可见）
- **按钮文字** — 浮动按钮上显示的文字（默认：「Send Inquiry」，最多30个字符）
- **欢迎消息** — 组件打开时显示的欢迎语（最多500个字符）
- **启用/停用** — 控制组件是否在你的网站上显示

## 查看和管理询盘

在后台的组件详情页中，你可以：

- 查看所有询盘的问答内容
- 通过国家/地区筛选询盘
- 展开查看完整详情，包括访客的页面 URL、IP 和国家
- 删除单条询盘

## Telegram 通知

你可以配置 Telegram 通知，在收到新询盘时立即收到推送消息，包括访客的完整回答。

### 设置步骤

1. 在 Telegram 中搜索 @FormSaaSBot 并发送 /start
2. 向 @userinfobot 发送消息以获取你的 Chat ID
3. 进入组件设置页，粘贴你的 Chat ID 并保存
4. 点击「测试连接」按钮确认设置正确

如果需要将通知发送到 Telegram 群组，将机器人添加到群组中，然后使用群组 Chat ID（格式如 -100XXXXXXXXXX）。

## 访客分析

Inquiry Widget 内置访客分析功能，自动追踪访客活动。在组件详情页的「访客活动」标签页中，你可以查看：

![访客分析](/docs/screenshots/zh/visitor-analytics.png)

- **总访问量** — 组件加载的总页面浏览次数
- **独立访客数** — 去重后的访客 IP 数量
- **总询盘数** — 已完成的询盘提交数量
- **热门国家** — 按访问量排名的前 10 个国家/地区

国家/地区检测基于访客 IP 地址自动完成，无需额外配置。

---

## 完整示例

以下是一个完整的 HTML 页面示例。你可以将它保存为 .html 文件，在浏览器中打开来测试你的询盘组件（记得替换 YOUR_WIDGET_ID 和相关 URL）。

```html
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>我的网站</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 40px auto; padding: 0 20px; }
  </style>
</head>
<body>
  <h1>欢迎访问我的网站</h1>
  <p>询盘组件会自动出现在页面右下角。</p>

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
