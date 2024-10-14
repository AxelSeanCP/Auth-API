const jwt = require("@hapi/jwt");
const JwtTokenManager = require("../JwtTokenManager");
const InvariantError = require("../../../Commons/exceptions/InvariantError");

describe("JwtTokenManager", () => {
  describe("generateAccessToken function", () => {
    it("should generate accessToken correctly", () => {
      const spyGenerate = jest.spyOn(jwt.token, "generate");
      const jwtTokenManager = new JwtTokenManager(jwt.token);
      const username = "user";

      const accessToken = jwtTokenManager.generateAccessToken({ username });

      expect(typeof accessToken).toEqual("string");
      expect(spyGenerate).toHaveBeenCalledWith(
        { username },
        process.env.ACCESS_TOKEN_KEY
      );
    });
  });

  describe("generateRefreshToken function", () => {
    it("should generate refreshToken correctly", () => {
      const spyGenerate = jest.spyOn(jwt.token, "generate");
      const jwtTokenManager = new JwtTokenManager(jwt.token);
      const username = "user";

      const refreshToken = jwtTokenManager.generateRefreshToken({ username });

      expect(typeof refreshToken).toEqual("string");
      expect(spyGenerate).toHaveBeenCalledWith(
        { username },
        process.env.REFRESH_TOKEN_KEY
      );
    });
  });

  describe("verifyRefreshToken", () => {
    it("should throw InvariantError when token is not valid", () => {
      const jwtTokenManager = new JwtTokenManager(jwt.token);

      expect(() => jwtTokenManager.verifyRefreshToken("dummy_token")).toThrow(
        InvariantError
      );
      expect(() => jwtTokenManager.verifyRefreshToken("")).toThrow(
        InvariantError
      );
    });

    it("should not throw InvariantError when token is valid", () => {
      const spyDecode = jest.spyOn(jwt.token, "decode");
      const jwtTokenManager = new JwtTokenManager(jwt.token);
      const username = "user";

      const refreshToken = jwtTokenManager.generateRefreshToken({ username });

      expect(() =>
        jwtTokenManager.verifyRefreshToken(refreshToken)
      ).not.toThrow(InvariantError);
      expect(spyDecode).toHaveBeenCalledWith(refreshToken);
    });
  });
});
