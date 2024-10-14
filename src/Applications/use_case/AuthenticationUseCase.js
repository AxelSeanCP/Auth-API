const UserLogin = require("../../Domains/users/entities/UserLogin");

class AuthenticationUseCase {
  constructor({
    userRepository,
    passwordHash,
    tokenManager,
    authenticationRepository,
  }) {
    this._userRepository = userRepository;
    this._passwordHash = passwordHash;
    this._tokenManager = tokenManager;
    this._authenticationRepository = authenticationRepository;
  }

  async loginUser(useCasePayload) {
    const { username, password } = new UserLogin(useCasePayload);

    const hashedPassword = await this._userRepository.getUserPassword(username);

    await this._passwordHash.compare(password, hashedPassword);

    const accessToken = await this._tokenManager.generateAccessToken({
      username,
    });
    const refreshToken = await this._tokenManager.generateRefreshToken({
      username,
    });

    await this._authenticationRepository.addRefreshToken(refreshToken);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async relogUser(useCasePayload) {
    this._verifyPayload(useCasePayload);
    const { refreshToken } = useCasePayload;

    await this._authenticationRepository.verifyRefreshToken(refreshToken);
    const username = await this._tokenManager.verifyRefreshToken(refreshToken);

    const accessToken = await this._tokenManager.generateAccessToken({
      username,
    });

    return accessToken;
  }

  async logoutUser(useCasePayload) {
    this._verifyPayload(useCasePayload);

    const { refreshToken } = useCasePayload;

    await this._authenticationRepository.verifyRefreshToken(refreshToken);
    await this._authenticationRepository.deleteRefreshToken(refreshToken);
  }

  _verifyPayload(useCasePayload) {
    const { refreshToken } = useCasePayload;

    if (!refreshToken) {
      throw new Error("REFRESH_TOKEN.NOT_CONTAIN_NEEDED_SPECIFICATION");
    }

    if (typeof refreshToken !== "string") {
      throw new Error("REFRESH_TOKEN.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

module.exports = AuthenticationUseCase;
