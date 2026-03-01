/// <reference path="../pb_data/types.d.ts" />

migrate(
  // Forward migration — create the submissions collection.
  function (app) {
    var formsCollection = app.findCollectionByNameOrId("forms")

    var collection = new Collection({
      name: "submissions",
      type: "base",
      fields: [
        {
          name: "form",
          type: "relation",
          collectionId: formsCollection.id,
          required: true,
          cascadeDelete: true,
        },
        {
          name: "data",
          type: "json",
          required: false,
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
      // Only the form owner may list or view submissions.
      listRule: "@request.auth.id = form.user",
      viewRule: "@request.auth.id = form.user",
      // Submissions are created exclusively by the PocketBase JS hook
      // (admin-level $app.save) — public API creation is denied.
      createRule: "",
      updateRule: "",
      // Owners may delete individual submissions.
      deleteRule: "@request.auth.id = form.user",
    })

    app.save(collection)
  },
  // Rollback migration — delete the submissions collection.
  function (app) {
    var collection = app.findCollectionByNameOrId("submissions")
    app.delete(collection)
  }
)
