/// <reference path="../pb_data/types.d.ts" />

migrate(
  // Forward migration — create the inquiries collection.
  function (app) {
    var widgetsCollection = app.findCollectionByNameOrId("widgets")

    var collection = new Collection({
      name: "inquiries",
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
          name: "responses",
          type: "json",
          required: true,
        },
        {
          name: "page_url",
          type: "url",
          required: false,
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
        {
          name: "updated",
          type: "autodate",
          onCreate: true,
          onUpdate: true,
        },
      ],
      // Only the widget owner may list or view inquiries.
      listRule: "@request.auth.id = widget.user",
      viewRule: "@request.auth.id = widget.user",
      // Inquiries are created exclusively by PocketBase hooks — public API creation is denied.
      createRule: "",
      // Inquiries are immutable once created.
      updateRule: "",
      // Owners may delete individual inquiries.
      deleteRule: "@request.auth.id = widget.user",
    })

    app.save(collection)
  },
  // Rollback migration — delete the inquiries collection.
  function (app) {
    var collection = app.findCollectionByNameOrId("inquiries")
    app.delete(collection)
  }
)
