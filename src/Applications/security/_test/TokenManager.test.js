const TokenManager = require("../TokenManager");

describe("a TokenManager interface", () => {
  it("should throw error when invoke abstract behavior", async () => {
    const tokenManager = new TokenManager();

    await expect(tokenManager.generateAccessToken("dummy_id")).rejects.toThrow(
      "TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED"
    );
    await expect(tokenManager.generateRefreshToken("dummy_id")).rejects.toThrow(
      "TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED"
    );
    await expect(
      tokenManager.verifyRefreshToken("dummy_refresh_token")
    ).rejects.toThrow("TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED");
  });
});
