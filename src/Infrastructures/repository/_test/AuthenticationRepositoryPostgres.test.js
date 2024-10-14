const AuthenticationsTableTestHelper = require("../../../tests/AuthenticationsTableTestHelper");
const InvariantError = require("../../../Commons/exceptions/InvariantError");
const pool = require("../../database/postgres/pool");
const AuthenticationRepositoryPostgres = require("../AuthenticationRepositoryPostgres");

describe("AuthenticationRepositoryPostgres", () => {
  afterEach(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addRefreshToken function", () => {
    it("should add token correctly", async () => {
      const authenticationRepositoryPostgres =
        new AuthenticationRepositoryPostgres(pool);
      const refreshToken = "refresh_token";

      await authenticationRepositoryPostgres.addRefreshToken(refreshToken);

      const token = await AuthenticationsTableTestHelper.findToken(
        refreshToken
      );
      expect(token).toHaveLength(1);
    });
  });

  describe("verifyRefreshToken function", () => {
    it("should throw InvariantError when token is not valid", async () => {
      await AuthenticationsTableTestHelper.addToken("token");

      const authenticationRepositoryPostgres =
        new AuthenticationRepositoryPostgres(pool);

      await expect(
        authenticationRepositoryPostgres.verifyRefreshToken("refresh_token")
      ).rejects.toThrow(InvariantError);
    });

    it("should not throw InvariantError when token is valid", async () => {
      await AuthenticationsTableTestHelper.addToken("refresh_token");

      const authenticationRepositoryPostgres =
        new AuthenticationRepositoryPostgres(pool);

      await expect(
        authenticationRepositoryPostgres.verifyRefreshToken("refresh_token")
      ).resolves.not.toThrow(InvariantError);
    });
  });

  describe("deleteRefreshToken function", () => {
    it("should delete token correctly", async () => {
      const authenticationRepositoryPostgres =
        new AuthenticationRepositoryPostgres(pool);

      const refresh_token = "refresh_token";

      await AuthenticationsTableTestHelper.addToken(refresh_token);

      await authenticationRepositoryPostgres.deleteRefreshToken(refresh_token);

      const token = await AuthenticationsTableTestHelper.findToken(
        refresh_token
      );

      expect(token).toHaveLength(0);
    });
  });
});
