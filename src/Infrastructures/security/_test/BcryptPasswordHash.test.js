const bcrypt = require("bcrypt");
const AuthenticationError = require("../../../Commons/exceptions/AuthenticationError");
const BcryptPasswordHash = require("../BcryptPasswordHash");

describe("BcryptPasswordHash", () => {
  describe("hash function", () => {
    it("should encrypt password correctly", async () => {
      // Arrange
      const spyHash = jest.spyOn(bcrypt, "hash");
      const bcryptPasswordHash = new BcryptPasswordHash(bcrypt);

      // Action
      const encryptedPassword = await bcryptPasswordHash.hash("plain_password");

      // Assert
      expect(typeof encryptedPassword).toEqual("string");
      expect(encryptedPassword).not.toEqual("plain_password");
      expect(spyHash).toHaveBeenCalledWith("plain_password", 10);
    });
  });

  describe("compare function", () => {
    it("should throw AuthenticationError when password did not match", async () => {
      const bcryptPasswordHash = new BcryptPasswordHash(bcrypt);

      await expect(
        bcryptPasswordHash.compare("secret", "hashedPassword")
      ).rejects.toThrow(AuthenticationError);
    });

    it("should not throw AuthenticationError when password match", async () => {
      const spyCompare = jest.spyOn(bcrypt, "compare");
      const bcryptPasswordHash = new BcryptPasswordHash(bcrypt);

      const plainPassword = "secret";
      const encryptedPassword = await bcryptPasswordHash.hash(plainPassword);

      await expect(
        bcryptPasswordHash.compare(plainPassword, encryptedPassword)
      ).resolves.not.toThrow(AuthenticationError);
      expect(spyCompare).toHaveBeenCalledWith(plainPassword, encryptedPassword);
    });
  });
});
