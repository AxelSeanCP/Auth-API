const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../tests/UsersTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../tests/AuthenticationsTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");

describe("HTTP server", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  it("should response 404 when request unregistered route", async () => {
    const server = await createServer({});

    const response = await server.inject({
      method: "GET",
      url: "/unregisteredRoute",
    });

    expect(response.statusCode).toEqual(404);
  });

  describe("when POST /users", () => {
    it("should response 201 and persisted user", async () => {
      // Arrange
      const requestPayload = {
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/users",
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedUser).toBeDefined();
    });

    it("should response 400 when request payload not contain needed property", async () => {
      // Arrange
      const requestPayload = {
        fullname: "Dicoding Indonesia",
        password: "secret",
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/users",
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada"
      );
    });

    it("should response 400 when request payload not meet data type specification", async () => {
      // Arrange
      const requestPayload = {
        username: "dicoding",
        password: "secret",
        fullname: ["Dicoding Indonesia"],
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/users",
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat user baru karena tipe data tidak sesuai"
      );
    });

    it("should response 400 when username more than 50 character", async () => {
      const requestPayload = {
        username: "dicodingindonesiadicodingindonesiadicodingindonesiadicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      };

      const server = await createServer(container);

      const response = await server.inject({
        method: "POST",
        url: "/users",
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat user baru karena karakter username melebihi batas limit"
      );
    });

    it("should response 400 when username contain restricted character", async () => {
      const requestPayload = {
        username: "dicoding indonesia",
        password: "secret",
        fullname: "Dicoding Indonesia",
      };

      const server = await createServer(container);

      const response = await server.inject({
        method: "POST",
        url: "/users",
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat user baru karena username mengandung karakter terlarang"
      );
    });

    it("should response 400 when username unavailable", async () => {
      await UsersTableTestHelper.addUser({ username: "dicoding" });
      const requestPayload = {
        username: "dicoding",
        fullname: "Dicoding Indonesia",
        password: "super_secret",
      };

      const server = await createServer(container);

      const response = await server.inject({
        method: "POST",
        url: "/users",
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("username tidak tersedia");
    });

    it("should handle error correctly", async () => {
      const requestPayload = {
        username: "dicoding",
        fullname: "Dicoding Indonesia",
        password: "super_secret",
      };
      const server = await createServer({}); // fake container

      const response = await server.inject({
        method: "POST",
        url: "/users",
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(500);
      expect(responseJson.status).toEqual("error");
      expect(responseJson.message).toEqual(
        "terjadi kegagalan pada server kami"
      );
    });
  });

  describe("when POST /authentications", () => {
    it("should response 201 and return access token and refresh token", async () => {
      // Arrange
      const requestPayload = {
        username: "dicoding",
        password: "secret",
      };
      const server = await createServer(container);

      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.accessToken).toBeDefined();
      expect(responseJson.data.refreshToken).toBeDefined();
    });

    it("should response 400 when payload not contain needed property", async () => {
      // Arrange
      const requestPayload = {
        username: "Dicoding Indonesia",
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat login karena properti yang dibutuhkan tidak ada"
      );
    });

    it("should response 400 when payload not meet data type specification", async () => {
      const requestPayload = {
        username: "dicoding",
        password: 123,
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat login karena tipe data tidak sesuai"
      );
    });

    it("should response 404 when username is not found", async () => {
      // Arrange
      const requestPayload = {
        username: "dicoding",
        password: "secret",
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("user tidak ditemukan");
    });

    it("should response 401 when password is wrong", async () => {
      await UsersTableTestHelper.addUser({
        username: "dicoding",
        password: "secret",
      });
      const requestPayload = {
        username: "dicoding",
        password: "secret_password_123",
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("password yang anda berikan salah");
    });
  });

  describe("when PUT /authentications", () => {
    it("should response 200 and return new access token", async () => {
      const server = await createServer(container);

      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });

      const responseLogin = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "dicoding",
          password: "secret",
        },
      });

      const responseJsonLogin = JSON.parse(responseLogin.payload);

      const refreshToken = responseJsonLogin.data.refreshToken;

      const response = await server.inject({
        method: "PUT",
        url: "/authentications",
        payload: {
          refreshToken,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.accessToken).toBeDefined();
    });

    it("should response 400 when payload not contain needed property", async () => {
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "PUT",
        url: "/authentications",
        payload: {},
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat token karena properti yang dibutuhkan tidak ada"
      );
    });

    it("should response 400 when payload not meet data type specification", async () => {
      const requestPayload = {
        refreshToken: 123,
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "PUT",
        url: "/authentications",
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat token karena tipe data tidak sesuai"
      );
    });

    it("should response 400 refresh token is not valid", async () => {
      await AuthenticationsTableTestHelper.addToken("token");

      const requestPayload = {
        refreshToken: "refresh_token",
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: "PUT",
        url: "/authentications",
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "refresh token tidak ditemukan di database"
      );
    });
  });

  describe("when DELETE /authentications", () => {
    it("should response 200 and delete refresh token in database", async () => {
      await AuthenticationsTableTestHelper.addToken("refresh_token");

      const requestPayload = {
        refreshToken: "refresh_token",
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: "DELETE",
        url: "/authentications",
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.message).toEqual("berhasil menghapus token");
    });

    it("should response 400 when payload not contain needed property", async () => {
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: "/authentications",
        payload: {},
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat token karena properti yang dibutuhkan tidak ada"
      );
    });

    it("should response 400 when payload not meet data type specification", async () => {
      const requestPayload = {
        refreshToken: 123,
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: "/authentications",
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat token karena tipe data tidak sesuai"
      );
    });

    it("should response 400 refresh token is not valid", async () => {
      await AuthenticationsTableTestHelper.addToken("token");

      const requestPayload = {
        refreshToken: "refresh_token",
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: "DELETE",
        url: "/authentications",
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("refresh token tidak valid");
    });
  });
});
