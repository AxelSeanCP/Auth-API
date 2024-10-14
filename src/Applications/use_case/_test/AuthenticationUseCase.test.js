const UserRepository = require("../../../Domains/users/UserRepository");
const AuthenticationRepository = require("../../../Domains/authentications/AuthenticationRepository");
const PasswordHash = require("../../security/PasswordHash");
const TokenManager = require("../../security/TokenManager");
const AuthenticationUseCase = require("../AuthenticationUseCase");

describe("AuthenticationUseCase", () => {
  describe("loginUser function", () => {
    it("should orchestrating the login function correctly", async () => {
      const useCasePayload = {
        username: "dicoding",
        password: "secret",
      };

      // creating dependencies of use case
      const mockUserRepository = new UserRepository();
      const mockPasswordHash = new PasswordHash();
      const mockTokenManager = new TokenManager();
      const mockAuthenticationRepository = new AuthenticationRepository();

      // mocking needed function
      mockUserRepository.getUserPassword = jest
        .fn()
        .mockImplementation(() => Promise.resolve("encrypted_password"));

      mockPasswordHash.compare = jest
        .fn()
        .mockImplementation(() => Promise.resolve());

      mockTokenManager.generateAccessToken = jest
        .fn()
        .mockImplementation(() => Promise.resolve("access_token"));

      mockTokenManager.generateRefreshToken = jest
        .fn()
        .mockImplementation(() => Promise.resolve("refresh_token"));

      mockAuthenticationRepository.addRefreshToken = jest
        .fn()
        .mockImplementation(() => Promise.resolve());

      // creating use case instance
      const authenticationUseCase = new AuthenticationUseCase({
        userRepository: mockUserRepository,
        passwordHash: mockPasswordHash,
        tokenManager: mockTokenManager,
        authenticationRepository: mockAuthenticationRepository,
      });

      // Action
      const loginUser = await authenticationUseCase.loginUser(useCasePayload);

      // Assert
      expect(loginUser).toEqual({
        accessToken: "access_token",
        refreshToken: "refresh_token",
      });

      expect(mockUserRepository.getUserPassword).toHaveBeenCalledWith(
        useCasePayload.username
      );

      expect(mockPasswordHash.compare).toHaveBeenCalledWith(
        useCasePayload.password,
        "encrypted_password"
      );

      expect(mockTokenManager.generateAccessToken).toHaveBeenCalledWith({
        username: useCasePayload.username,
      });

      expect(mockTokenManager.generateRefreshToken).toHaveBeenCalledWith({
        username: useCasePayload.username,
      });

      expect(mockAuthenticationRepository.addRefreshToken).toHaveBeenCalledWith(
        "refresh_token"
      );
    });
  });

  describe("relogUser function", () => {
    it("should throw error when payload not contain refresh token", () => {
      const useCasePayload = {};
      const authenticationUseCase = new AuthenticationUseCase({});

      expect(authenticationUseCase.relogUser(useCasePayload)).rejects.toThrow(
        "REFRESH_TOKEN.NOT_CONTAIN_NEEDED_SPECIFICATION"
      );
    });

    it("should throw error when payload did not meet data type specification", () => {
      const useCasePayload = {
        refreshToken: 123,
      };
      const authenticationUseCase = new AuthenticationUseCase({});

      expect(authenticationUseCase.relogUser(useCasePayload)).rejects.toThrow(
        "REFRESH_TOKEN.NOT_MEET_DATA_TYPE_SPECIFICATION"
      );
    });

    it("should orchestrate the relog function correctly", async () => {
      const useCasePayload = {
        refreshToken: "refresh_token",
      };

      // creating dependencies of use case
      const mockTokenManager = new TokenManager();
      const mockAuthenticationRepository = new AuthenticationRepository();

      // mocking needed function
      mockAuthenticationRepository.verifyRefreshToken = jest
        .fn()
        .mockImplementation(() => Promise.resolve());

      mockTokenManager.verifyRefreshToken = jest
        .fn()
        .mockImplementation(() => Promise.resolve("dummy_username"));

      mockTokenManager.generateAccessToken = jest
        .fn()
        .mockImplementation(() => Promise.resolve("access_token"));

      // creating use case instance
      const authenticationUseCase = new AuthenticationUseCase({
        tokenManager: mockTokenManager,
        authenticationRepository: mockAuthenticationRepository,
      });

      const relogUser = await authenticationUseCase.relogUser(useCasePayload);

      expect(relogUser).toEqual("access_token");

      expect(
        mockAuthenticationRepository.verifyRefreshToken
      ).toHaveBeenCalledWith(useCasePayload.refreshToken);

      expect(mockTokenManager.verifyRefreshToken).toHaveBeenCalledWith(
        useCasePayload.refreshToken
      );

      expect(mockTokenManager.generateAccessToken).toHaveBeenCalledWith({
        username: "dummy_username",
      });
    });
  });

  describe("logoutUser function", () => {
    it("should throw error when payload not contain refresh token", () => {
      const useCasePayload = {};
      const authenticationUseCase = new AuthenticationUseCase({});

      expect(authenticationUseCase.relogUser(useCasePayload)).rejects.toThrow(
        "REFRESH_TOKEN.NOT_CONTAIN_NEEDED_SPECIFICATION"
      );
    });

    it("should throw error when payload did not meet data type specification", () => {
      const useCasePayload = {
        refreshToken: 123,
      };
      const authenticationUseCase = new AuthenticationUseCase({});

      expect(authenticationUseCase.relogUser(useCasePayload)).rejects.toThrow(
        "REFRESH_TOKEN.NOT_MEET_DATA_TYPE_SPECIFICATION"
      );
    });

    it("should orchestrate the logout function correctly", async () => {
      const useCasePayload = {
        refreshToken: "refresh_token",
      };

      // creating dependencies of use case
      const mockAuthenticationRepository = new AuthenticationRepository();

      // mocking needed function
      mockAuthenticationRepository.verifyRefreshToken = jest
        .fn()
        .mockImplementation(() => Promise.resolve());

      mockAuthenticationRepository.deleteRefreshToken = jest
        .fn()
        .mockImplementation(() => Promise.resolve());

      // creating use case instance
      const authenticationUseCase = new AuthenticationUseCase({
        userRepository: {},
        passwordHash: {},
        tokenManager: {},
        authenticationRepository: mockAuthenticationRepository,
      });

      await authenticationUseCase.logoutUser(useCasePayload);

      expect(
        mockAuthenticationRepository.verifyRefreshToken
      ).toHaveBeenCalledWith(useCasePayload.refreshToken);

      expect(
        mockAuthenticationRepository.deleteRefreshToken
      ).toHaveBeenCalledWith(useCasePayload.refreshToken);
    });
  });
});
