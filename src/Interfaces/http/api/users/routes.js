const routes = (handler) => [
  {
    method: "POST",
    path: "/users",
    handler: handler.postUserHandler,
    options: {
      description: "POST users",
      notes: "Test",
      tags: ["api", "auth"],
      validate: {
        payload: Joi.object({
          username: Joi.string(),
          fullname: Joi.string(),
          password: Joi.string(),
        }).label("Post-users-payload"),
      },
      response: {
        schema: Joi.object({
          status: "success",
          data: {
            id: Joi.string(),
            username: Joi.string(),
            fullname: Joi.string(),
          },
        }).label("Post-users-response"),
      },
    },
  },
];

module.exports = routes;
