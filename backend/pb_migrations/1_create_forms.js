/// <reference path="../pb_data/types.d.ts" />

migrate(
  // Forward migration — create the forms collection.
  function (app) {
    var collection = new Collection({
      name: "forms",
      type: "base",
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          min: 1,
          max: 100,
        },
        {
          name: "user",
          type: "relation",
          collectionId: "_pb_users_auth_",
          required: true,
          cascadeDelete: true,
        },
        {
          name: "telegram_chat_id",
          type: "text",
          required: false,
        },
      ],
      listRule: "@request.auth.id = user",
      viewRule: "@request.auth.id = user",
      createRule: '@request.auth.id != ""',
      updateRule: "@request.auth.id = user",
      deleteRule: "@request.auth.id = user",
    })

    app.save(collection)
  },
  // Rollback migration — delete the forms collection.
  function (app) {
    var collection = app.findCollectionByNameOrId("forms")
    app.delete(collection)
  }
)
