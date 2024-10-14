const AuthenticationRepository = require("../AuthenticationRepository");

describe("AuthenticationRepository interface", () => {
  it("should throw error when invoke abstract behavior", async () => {
    const authenticationRepository = new AuthenticationRepository();

    await expect(authenticationRepository.addRefreshToken("")).rejects.toThrow(
      "AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(
      authenticationRepository.verifyRefreshToken("")
    ).rejects.toThrow("AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    await expect(
      authenticationRepository.deleteRefreshToken("")
    ).rejects.toThrow("AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  });
});
