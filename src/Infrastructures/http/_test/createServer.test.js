const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../src/tests/UsersTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");

describe("HTTP server", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
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
});
