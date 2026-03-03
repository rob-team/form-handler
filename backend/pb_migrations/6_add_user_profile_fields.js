/// <reference path="../pb_data/types.d.ts" />

migrate(
  // Forward migration — add name and avatar fields to the users collection.
  function (app) {
    var collection = app.findCollectionByNameOrId("_pb_users_auth_")

    // Check if fields already exist before adding
    var hasName = false
    var hasAvatar = false
    var fields = collection.fields
    for (var i = 0; i < fields.length; i++) {
      if (fields[i].name === "name") hasName = true
      if (fields[i].name === "avatar") hasAvatar = true
    }

    if (!hasName) {
      collection.fields.push(
        new Field({
          name: "name",
          type: "text",
          required: false,
          max: 200,
        })
      )
    }

    if (!hasAvatar) {
      collection.fields.push(
        new Field({
          name: "avatar",
          type: "file",
          required: false,
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: [
            "image/jpeg",
            "image/png",
            "image/svg+xml",
            "image/gif",
            "image/webp",
          ],
          thumbs: null,
        })
      )
    }

    app.save(collection)
  },
  // Rollback migration — remove name and avatar fields from the users collection.
  function (app) {
    var collection = app.findCollectionByNameOrId("_pb_users_auth_")

    collection.fields.removeByName("name")
    collection.fields.removeByName("avatar")

    app.save(collection)
  }
)
