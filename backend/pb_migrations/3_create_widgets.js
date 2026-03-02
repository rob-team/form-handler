/// <reference path="../pb_data/types.d.ts" />

migrate(
  // Forward migration — create the widgets collection.
  function (app) {
    var collection = new Collection({
      name: "widgets",
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
          name: "button_text",
          type: "text",
          required: false,
          max: 30,
        },
        {
          name: "greeting",
          type: "text",
          required: false,
          max: 500,
        },
        {
          name: "questions",
          type: "json",
          required: true,
        },
        {
          name: "telegram_chat_id",
          type: "text",
          required: false,
        },
        {
          name: "active",
          type: "bool",
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
      listRule: "@request.auth.id = user",
      viewRule: "@request.auth.id = user",
      createRule: '@request.auth.id != ""',
      updateRule: "@request.auth.id = user",
      deleteRule: "@request.auth.id = user",
    })

    app.save(collection)
  },
  // Rollback migration — delete the widgets collection.
  function (app) {
    var collection = app.findCollectionByNameOrId("widgets")
    app.delete(collection)
  }
)
