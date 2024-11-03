const Joi = require("joi");

const routes = (handler) => [
  {
    method: "POST",
    path: "/authentications",
    handler: handler.postAuthenticationHandler,
    options: {
      description: "POST authentications",
      notes: "Test",
      tags: ["api", "auth"],
      response: {
        schema: Joi.object({
          status: "success",
          data: {
            accessToken: Joi.string(),
            refreshToken: Joi.string(),
          },
        }).label("Post-authentications-response"),
      },
    },
  },
  {
    method: "PUT",
    path: "/authentications",
    handler: handler.putAuthenticationHandler,
    options: {
      description: "PUT authentications",
      notes: "Test",
      tags: ["api", "auth"],
      response: {
        schema: Joi.object({
          status: "success",
          data: {
            accessToken: Joi.string(),
          },
        }).label("Put-authentications-response"),
      },
    },
  },
  {
    method: "DELETE",
    path: "/authentications",
    handler: handler.deleteAuthenticationHandler,
    options: {
      description: "DELETE authentications",
      notes: "Test",
      tags: ["api", "auth"],
      response: {
        schema: Joi.object({
          status: "success",
          message: Joi.string(),
        }).label("Delete-authentications-response"),
      },
    },
  },
];

module.exports = routes;
