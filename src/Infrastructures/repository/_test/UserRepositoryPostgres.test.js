const UsersTableTestHelper = require("../../../tests/UsersTableTestHelper");
const InvariantError = require("../../../Commons/exceptions/InvariantError");
const RegisterUser = require("../../../Domains/users/entities/RegisterUser");
const RegisteredUser = require("../../../Domains/users/entities/RegisteredUser");
const pool = require("../../database/postgres/pool");
const UserRepositoryPostgres = require("../UserRepositoryPostgres");

describe("UserRepositoryPostgres", () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("verifyAvailableUsername function", () => {
    it("should throw InvariantError when username not available", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: "dicoding" }); // memasukkan user baru
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(
        userRepositoryPostgres.verifyAvailableUsername("dicoding")
      ).rejects.toThrow(InvariantError);
    });

    it("should not throw InvariantError when username available", async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(
        userRepositoryPostgres.verifyAvailableUsername("dicoding")
      ).resolves.not.toThrow(InvariantError);
    });
  });

  describe("addUser function", () => {
    it("should persist register user", async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: "dicoding",
        password: "secret_password",
        fullname: "Dicoding Indonesia",
      });
      const fakeIdGenerator = () => "123"; // stub!
      const userRepositoryPostgres = new UserRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await userRepositoryPostgres.addUser(registerUser);

      // Assert
      const users = await UsersTableTestHelper.findUserById("user-123");
      expect(users).toHaveLength(1);
    });

    it("should return registered user correctly", async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: "dicoding",
        password: "secret_password",
        fullname: "Dicoding Indonesia",
      });
      const fakeIdGenerator = () => "123"; // stub!
      const userRepositoryPostgres = new UserRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const registeredUser = await userRepositoryPostgres.addUser(registerUser);

      // Assert
      expect(registeredUser).toStrictEqual(
        new RegisteredUser({
          id: "user-123",
          username: "dicoding",
          fullname: "Dicoding Indonesia",
        })
      );
    });
  });

  describe("getUserPassword function", () => {
    it("should throw InvariantError when user not available", async () => {
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      await expect(
        userRepositoryPostgres.getUserPassword("dicoding")
      ).rejects.toThrow(InvariantError);
    });

    it("should return user password when user is found", async () => {
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      await UsersTableTestHelper.addUser({
        username: "dicoding",
        password: "secret",
      });

      const password = await userRepositoryPostgres.getUserPassword("dicoding");
      expect(password).toEqual("secret");
    });
  });
});
