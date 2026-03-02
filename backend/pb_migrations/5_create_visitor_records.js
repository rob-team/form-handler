/// <reference path="../pb_data/types.d.ts" />

migrate(
  // Forward migration — create the visitor_records collection.
  function (app) {
    var widgetsCollection = app.findCollectionByNameOrId("widgets")

    var collection = new Collection({
      name: "visitor_records",
      type: "base",
      fields: [
        {
          name: "widget",
          type: "relation",
          collectionId: widgetsCollection.id,
          required: true,
          cascadeDelete: true,
        },
        {
          name: "page_url",
          type: "url",
          required: true,
        },
        {
          name: "visitor_ip",
          type: "text",
          required: false,
          max: 45,
        },
        {
          name: "country",
          type: "text",
          required: false,
          max: 2,
        },
        {
          name: "created",
          type: "autodate",
          onCreate: true,
          onUpdate: false,
        },
      ],
      // Only the widget owner may list or view visitor records.
      listRule: "@request.auth.id = widget.user",
      viewRule: "@request.auth.id = widget.user",
      // Visitor records are created exclusively by PocketBase hooks.
      createRule: "",
      // Visitor records are immutable.
      updateRule: "",
      // Visitor records are managed by system/cascade only.
      deleteRule: "",
    })

    app.save(collection)
  },
  // Rollback migration — delete the visitor_records collection.
  function (app) {
    var collection = app.findCollectionByNameOrId("visitor_records")
    app.delete(collection)
  }
)
