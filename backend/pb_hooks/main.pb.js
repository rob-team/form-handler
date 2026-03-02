/// <reference path="../pb_data/types.d.ts" />

// ===========================================================================
// Widget endpoints (002-inquiry-widget)
// ===========================================================================

// ---------------------------------------------------------------------------
// GET /api/widget/{widgetId} — public widget config
// ---------------------------------------------------------------------------
routerAdd(
  "GET",
  "/api/widget/{widgetId}",
  function (e) {
    var widgetId = e.request.pathValue("widgetId")

    var widget
    try {
      widget = $app.findRecordById("widgets", widgetId)
    } catch (_) {
      return e.json(404, { code: 404, message: "Widget not found." })
    }

    // Inactive widgets are treated as not found.
    if (!widget.getBool("active")) {
      return e.json(404, { code: 404, message: "Widget not found." })
    }

    // Return only public fields — never expose user, telegram_chat_id, etc.
    return e.json(200, {
      id: widget.id,
      button_text: widget.getString("button_text") || "Send Inquiry",
      greeting: widget.getString("greeting") || "",
      questions: JSON.parse(widget.getString("questions") || "[]"),
    })
  }
)

// ---------------------------------------------------------------------------
// POST /api/widget/{widgetId}/submit — public inquiry submission
// ---------------------------------------------------------------------------
routerAdd(
  "POST",
  "/api/widget/{widgetId}/submit",
  function (e) {
    // Inline helper: extract visitor IP from request headers (reverse-proxy aware)
    function _extractIp(ev) {
      var proxyHeaders = ["CF-Connecting-IP", "X-Forwarded-For", "X-Real-IP"]
      for (var h = 0; h < proxyHeaders.length; h++) {
        var val = ev.request.header.get(proxyHeaders[h])
        if (val) { return val.split(",")[0].trim() }
      }
      var remote = ev.request.remoteAddr || ""
      var m = remote.match(/^(?:\[([^\]]+)\]|([^:]+)):/)
      return m ? (m[1] || m[2]) : remote
    }

    // Inline helper: derive country code from headers or fallback API
    function _deriveCountry(ev) {
      var cfCountry = ev.request.header.get("CF-IPCountry")
      if (cfCountry && cfCountry !== "XX" && cfCountry !== "T1") { return cfCountry }
      try {
        var ip = _extractIp(ev)
        if (!ip || ip === "127.0.0.1" || ip === "::1") { return "" }
        var geoRes = $http.send({ url: "http://ip-api.com/json/" + ip + "?fields=countryCode", method: "GET", timeout: 5 })
        if (geoRes.statusCode === 200) { return (JSON.parse(geoRes.raw)).countryCode || "" }
      } catch (err) { console.error("[geo] country lookup failed:", String(err)) }
      return ""
    }

    var widgetId = e.request.pathValue("widgetId")

    // Look up the widget.
    var widget
    try {
      widget = $app.findRecordById("widgets", widgetId)
    } catch (_) {
      return e.json(404, { code: 404, message: "Widget not found." })
    }

    if (!widget.getBool("active")) {
      return e.json(404, { code: 404, message: "Widget not found." })
    }

    // Parse and validate the request body.
    var body = e.requestInfo().body || {}
    var responses = body.responses
    var pageUrl = String(body.page_url || "")

    // Validate responses is a non-empty array.
    if (!responses || !responses.length) {
      return e.json(400, {
        code: 400,
        message: "Validation failed.",
        data: {
          responses: {
            code: "validation_required",
            message: "Responses are required.",
          },
        },
      })
    }

    // Validate each response entry.
    for (var i = 0; i < responses.length; i++) {
      var r = responses[i]
      if (!r.question_id || !r.question_label || typeof r.answer !== "string") {
        return e.json(400, {
          code: 400,
          message: "Validation failed.",
          data: {
            responses: {
              code: "validation_invalid",
              message:
                "Each response must have question_id, question_label, and answer.",
            },
          },
        })
      }
    }

    // Extract visitor metadata.
    var visitorIp = _extractIp(e)
    var country = _deriveCountry(e)

    // Create inquiry record.
    var col = $app.findCollectionByNameOrId("inquiries")
    var rec = new Record(col)
    rec.set("widget", widgetId)
    rec.set("responses", JSON.stringify(responses))
    rec.set("page_url", pageUrl)
    rec.set("visitor_ip", visitorIp)
    rec.set("country", country)
    $app.save(rec)

    return e.json(200, { success: true, id: rec.id })
  },
  $apis.bodyLimit(1 * 1024 * 1024) // 1 MB limit
)

// ---------------------------------------------------------------------------
// Telegram notification hook for inquiries
// ---------------------------------------------------------------------------
onRecordAfterCreateSuccess(function (e) {
  try {
    var widgetId = e.record.getString("widget")
    var widget = $app.findRecordById("widgets", widgetId)
    var chatId = widget.getString("telegram_chat_id")

    if (!chatId) {
      e.next()
      return
    }

    var token = $os.getenv("TELEGRAM_BOT_TOKEN")
    if (!token) {
      console.error("[telegram] TELEGRAM_BOT_TOKEN is not set — skipping notification")
      e.next()
      return
    }

    var widgetName = widget.getString("name") || "Widget"
    var pageUrl = e.record.getString("page_url") || "N/A"
    var country = e.record.getString("country") || "N/A"
    var created = e.record.getString("created") || ""

    // Parse the responses JSON.
    var rawResponses = e.record.get("responses")
    var responses = rawResponses ? JSON.parse(String(rawResponses)) : []

    // Build the notification message per contracts/telegram-notification.md.
    var lines = [
      "\uD83D\uDCE9 New Inquiry",
      "",
      "\uD83C\uDF10 Widget: " + widgetName,
      "\uD83D\uDCC4 Page: " + pageUrl,
      "\uD83D\uDD50 Time: " + created,
      "\uD83C\uDFF3\uFE0F Country: " + country,
      "",
      "--- Responses ---",
    ]
    for (var i = 0; i < responses.length; i++) {
      var r = responses[i]
      lines.push("Q: " + (r.question_label || r.question_id))
      lines.push("A: " + r.answer)
      if (i < responses.length - 1) {
        lines.push("")
      }
    }
    var text = lines.join("\n")

    var res = $http.send({
      url: "https://api.telegram.org/bot" + token + "/sendMessage",
      method: "POST",
      body: JSON.stringify({ chat_id: chatId, text: text }),
      headers: { "content-type": "application/json" },
      timeout: 15,
    })

    if (res.statusCode !== 200) {
      console.error("[telegram] inquiry sendMessage failed:", res.statusCode, res.raw)
    }
  } catch (err) {
    console.error("[telegram] inquiry hook error:", String(err))
  }

  e.next()
}, "inquiries")

// ---------------------------------------------------------------------------
// POST /api/widget/{widgetId}/telegram-test — authenticated Telegram test
// ---------------------------------------------------------------------------
routerAdd(
  "POST",
  "/api/widget/{widgetId}/telegram-test",
  function (e) {
    var widgetId = e.request.pathValue("widgetId")

    // Require authentication.
    var authRecord = e.auth
    if (!authRecord) {
      return e.json(401, { code: 401, message: "Authentication required." })
    }

    // Look up widget and verify ownership.
    var widget
    try {
      widget = $app.findRecordById("widgets", widgetId)
    } catch (_) {
      return e.json(404, { code: 404, message: "Widget not found." })
    }

    if (widget.getString("user") !== authRecord.id) {
      return e.json(403, { code: 403, message: "Access denied." })
    }

    var chatId = widget.getString("telegram_chat_id")
    if (!chatId) {
      return e.json(400, {
        code: 400,
        message: "No Telegram chat ID configured.",
      })
    }

    var token = $os.getenv("TELEGRAM_BOT_TOKEN")
    if (!token) {
      return e.json(400, {
        code: 400,
        message: "Telegram bot token is not configured on the server.",
      })
    }

    var text = "\u2705 Connection test from FormHandler\n\nWidget: " + widget.getString("name")

    try {
      var res = $http.send({
        url: "https://api.telegram.org/bot" + token + "/sendMessage",
        method: "POST",
        body: JSON.stringify({ chat_id: chatId, text: text }),
        headers: { "content-type": "application/json" },
        timeout: 15,
      })

      if (res.statusCode !== 200) {
        var errBody = JSON.parse(res.raw || "{}")
        return e.json(400, {
          code: 400,
          message: "Telegram delivery failed: " + (errBody.description || res.statusCode),
        })
      }
    } catch (err) {
      return e.json(400, {
        code: 400,
        message: "Telegram delivery failed: " + String(err),
      })
    }

    return e.json(200, { success: true, message: "Test message sent." })
  }
)

// ---------------------------------------------------------------------------
// POST /api/widget/{widgetId}/visit — public visitor tracking
// ---------------------------------------------------------------------------
routerAdd(
  "POST",
  "/api/widget/{widgetId}/visit",
  function (e) {
    // Inline helper: extract visitor IP from request headers (reverse-proxy aware)
    function _extractIp(ev) {
      var proxyHeaders = ["CF-Connecting-IP", "X-Forwarded-For", "X-Real-IP"]
      for (var h = 0; h < proxyHeaders.length; h++) {
        var val = ev.request.header.get(proxyHeaders[h])
        if (val) { return val.split(",")[0].trim() }
      }
      var remote = ev.request.remoteAddr || ""
      var m = remote.match(/^(?:\[([^\]]+)\]|([^:]+)):/)
      return m ? (m[1] || m[2]) : remote
    }

    // Inline helper: derive country code from headers or fallback API
    function _deriveCountry(ev) {
      var cfCountry = ev.request.header.get("CF-IPCountry")
      if (cfCountry && cfCountry !== "XX" && cfCountry !== "T1") { return cfCountry }
      try {
        var ip = _extractIp(ev)
        if (!ip || ip === "127.0.0.1" || ip === "::1") { return "" }
        var geoRes = $http.send({ url: "http://ip-api.com/json/" + ip + "?fields=countryCode", method: "GET", timeout: 5 })
        if (geoRes.statusCode === 200) { return (JSON.parse(geoRes.raw)).countryCode || "" }
      } catch (err) { console.error("[geo] country lookup failed:", String(err)) }
      return ""
    }

    var widgetId = e.request.pathValue("widgetId")

    var widget
    try {
      widget = $app.findRecordById("widgets", widgetId)
    } catch (_) {
      return e.json(404, { code: 404, message: "Widget not found." })
    }

    if (!widget.getBool("active")) {
      return e.json(404, { code: 404, message: "Widget not found." })
    }

    var body = e.requestInfo().body || {}
    var pageUrl = String(body.page_url || "")
    var visitorIp = _extractIp(e)
    var country = _deriveCountry(e)

    var col = $app.findCollectionByNameOrId("visitor_records")
    var rec = new Record(col)
    rec.set("widget", widgetId)
    rec.set("page_url", pageUrl)
    rec.set("visitor_ip", visitorIp)
    rec.set("country", country)
    $app.save(rec)

    return e.json(200, { success: true })
  },
  $apis.bodyLimit(64 * 1024) // 64 KB limit
)

// ---------------------------------------------------------------------------
// GET /api/widget/{widgetId}/stats — authenticated widget statistics
// ---------------------------------------------------------------------------
routerAdd(
  "GET",
  "/api/widget/{widgetId}/stats",
  function (e) {
    var widgetId = e.request.pathValue("widgetId")

    // Require authentication.
    var authRecord = e.auth
    if (!authRecord) {
      return e.json(401, { code: 401, message: "Authentication required." })
    }

    // Look up widget and verify ownership.
    var widget
    try {
      widget = $app.findRecordById("widgets", widgetId)
    } catch (_) {
      return e.json(404, { code: 404, message: "Widget not found." })
    }

    if (widget.getString("user") !== authRecord.id) {
      return e.json(403, { code: 403, message: "Access denied." })
    }

    // Count total visits.
    var visits = $app.findRecordsByFilter(
      "visitor_records",
      'widget = "' + widgetId + '"',
      "-created",
      0,
      0
    )
    var totalVisits = visits.length

    // Count unique visitors (distinct IPs).
    var ipSet = {}
    var countryMap = {}
    for (var i = 0; i < visits.length; i++) {
      var ip = visits[i].getString("visitor_ip")
      if (ip) {
        ipSet[ip] = true
      }
      var c = visits[i].getString("country")
      if (c) {
        countryMap[c] = (countryMap[c] || 0) + 1
      }
    }
    var uniqueVisitors = Object.keys(ipSet).length

    // Count total inquiries.
    var inquiries = $app.findRecordsByFilter(
      "inquiries",
      'widget = "' + widgetId + '"',
      "",
      0,
      0
    )
    var totalInquiries = inquiries.length

    // Build top countries (sorted by count descending).
    var topCountries = []
    var countryKeys = Object.keys(countryMap)
    for (var j = 0; j < countryKeys.length; j++) {
      topCountries.push({ country: countryKeys[j], count: countryMap[countryKeys[j]] })
    }
    topCountries.sort(function (a, b) { return b.count - a.count })
    topCountries = topCountries.slice(0, 10)

    return e.json(200, {
      total_visits: totalVisits,
      unique_visitors: uniqueVisitors,
      total_inquiries: totalInquiries,
      top_countries: topCountries,
      period: "all_time",
    })
  }
)

// ===========================================================================
// Form endpoints (001-form-saas)
// ===========================================================================

// ---------------------------------------------------------------------------
// Submission endpoint  POST /api/submit/{formId}
// ---------------------------------------------------------------------------
//
// Accepts POST data from any external HTML form or JavaScript client.
// Saves all fields (except the _next routing directive) as a JSON blob.
// Redirects to _next if valid; otherwise redirects to the frontend /success page.
//
routerAdd(
  "POST",
  "/api/submit/{formId}",
  function (e) {
    var formId = e.request.pathValue("formId")

    // Look up the form — 404 if it doesn't exist or was deleted.
    var form
    try {
      form = $app.findRecordById("forms", formId)
    } catch (_) {
      return e.json(404, { code: 404, message: "Form not found." })
    }

    // Parse the POST body.  e.requestInfo().body handles both
    // application/x-www-form-urlencoded and application/json.
    var rawBody = e.requestInfo().body || {}

    // Extract (and remove) the _next routing directive before storing.
    var nextUrl = String(rawBody["_next"] || "")
    delete rawBody["_next"]

    // Persist the submission.
    var col = $app.findCollectionByNameOrId("submissions")
    var rec = new Record(col)
    rec.set("form", formId)
    rec.set("data", rawBody)
    $app.save(rec)

    // Redirect the caller.
    var frontendUrl =
      $os.getenv("FRONTEND_URL") || "http://localhost:3000"

    // Validate _next is an absolute HTTP(S) URL before redirecting.
    var isValidNext = typeof nextUrl === "string" && /^https?:\/\/.+/.test(nextUrl)
    if (isValidNext) {
      return e.redirect(302, nextUrl)
    }

    var referer = e.request.header.get("Referer") || ""
    return e.redirect(
      302,
      frontendUrl + "/success?ref=" + encodeURIComponent(referer)
    )
  },
  $apis.bodyLimit(1 * 1024 * 1024) // 1 MB limit (FR-016)
)

// ---------------------------------------------------------------------------
// Telegram notification hook
// ---------------------------------------------------------------------------
//
// Fires after every successful submission save.
// Reads telegram_chat_id from the parent form.
// Sends a summary message via the Telegram Bot API.
// Failures are logged but NEVER propagated (FR-014).
//
onRecordAfterCreateSuccess(function (e) {
  try {
    var formId = e.record.getString("form")
    var parentForm = $app.findRecordById("forms", formId)
    var chatId = parentForm.getString("telegram_chat_id")

    if (!chatId) {
      e.next()
      return
    }

    var token = $os.getenv("TELEGRAM_BOT_TOKEN")
    if (!token) {
      console.error("[telegram] TELEGRAM_BOT_TOKEN is not set — skipping notification")
      e.next()
      return
    }

    // Build a human-readable summary of the submitted fields.
    var rawData = e.record.get("data")
    var data = rawData ? JSON.parse(String(rawData)) : {}
    var lines = ["\uD83D\uDCCB New form submission"]
    var keys = Object.keys(data)
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      lines.push(key + ": " + String(data[key]))
    }
    var text = lines.join("\n")

    var res = $http.send({
      url: "https://api.telegram.org/bot" + token + "/sendMessage",
      method: "POST",
      body: JSON.stringify({ chat_id: chatId, text: text }),
      headers: { "content-type": "application/json" },
      timeout: 15,
    })

    if (res.statusCode !== 200) {
      console.error("[telegram] sendMessage failed:", res.statusCode, res.raw)
    }
  } catch (err) {
    console.error("[telegram] hook error:", String(err))
  }

  e.next()
}, "submissions")
