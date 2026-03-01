/// <reference path="../pb_data/types.d.ts" />

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
