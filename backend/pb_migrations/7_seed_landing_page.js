/// <reference path="../pb_data/types.d.ts" />

migrate(
  // Forward migration — seed system user, landing page form, and landing page widget.
  function (app) {
    // Idempotency check: skip if system user already exists.
    var existing = null
    try {
      existing = app.findAuthRecordByEmail("users", "system@formhandler.local")
    } catch (_) {
      // Not found — proceed with seeding.
    }

    if (existing) {
      console.log("[seed] system@formhandler.local already exists — skipping")
      return
    }

    // 1. Create system user account.
    var usersCol = app.findCollectionByNameOrId("users")
    var user = new Record(usersCol)
    user.set("email", "system@formhandler.local")
    user.set("name", "FormHandler System")
    user.set("verified", true)
    user.setPassword($security.randomString(32))
    app.save(user)
    console.log("[seed] Created system user:", user.id)

    // 2. Create landing page form endpoint.
    var formsCol = app.findCollectionByNameOrId("forms")
    var form = new Record(formsCol)
    form.set("name", "Landing Page Contact")
    form.set("user", user.id)
    app.save(form)
    console.log("[seed] Created landing page form:", form.id)

    // 3. Create landing page widget.
    var widgetsCol = app.findCollectionByNameOrId("widgets")
    var widget = new Record(widgetsCol)
    widget.set("name", "Landing Page Widget")
    widget.set("user", user.id)
    widget.set("button_text", "Send Inquiry")
    widget.set("greeting", "Hi! How can we help?")
    widget.set("questions", JSON.stringify([
      { id: "q1", label: "Which country are you from?", type: "text", required: true, options: null },
      { id: "q2", label: "Company Name", type: "text", required: true, options: null },
      { id: "q3", label: "Purchase Quantity", type: "single-select", required: true, options: ["< 100 pcs", "100-500 pcs", "500-1000 pcs", "1000+ pcs"] },
      { id: "q4", label: "When do you need the products?", type: "single-select", required: true, options: ["Within 1 month", "1-3 months", "3-6 months", "Just researching"] },
      { id: "q5", label: "Your Email", type: "email", required: true, options: null },
      { id: "q6", label: "Tell us about your requirements", type: "text", required: false, options: null }
    ]))
    widget.set("active", true)
    app.save(widget)
    console.log("[seed] Created landing page widget:", widget.id)

    console.log("[seed] === Landing page seed complete ===")
    console.log("[seed] Set these environment variables in frontend/.env.local:")
    console.log("[seed]   NEXT_PUBLIC_LANDING_FORM_ID=" + form.id)
    console.log("[seed]   NEXT_PUBLIC_LANDING_WIDGET_ID=" + widget.id)
  },
  // Rollback migration — remove seeded records.
  function (app) {
    try {
      var user = app.findAuthRecordByEmail("users", "system@formhandler.local")

      // Delete widgets owned by system user.
      var widgets = app.findRecordsByFilter("widgets", 'user = "' + user.id + '"', "", 0, 0)
      for (var i = 0; i < widgets.length; i++) {
        app.delete(widgets[i])
      }

      // Delete forms owned by system user.
      var forms = app.findRecordsByFilter("forms", 'user = "' + user.id + '"', "", 0, 0)
      for (var j = 0; j < forms.length; j++) {
        app.delete(forms[j])
      }

      // Delete the system user.
      app.delete(user)
      console.log("[seed] Rolled back landing page seed data")
    } catch (_) {
      console.log("[seed] No system user found — nothing to roll back")
    }
  }
)
