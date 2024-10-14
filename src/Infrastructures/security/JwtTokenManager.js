const TokenManager = require("../../Applications/security/TokenManager");
const InvariantError = require("../../Commons/exceptions/InvariantError");

class JwtTokenManager extends TokenManager {
  constructor(jwt) {
    super();
    this._jwt = jwt;
  }

  generateAccessToken(payload) {
    return this._jwt.generate(payload, process.env.ACCESS_TOKEN_KEY);
  }

  generateRefreshToken(payload) {
    return this._jwt.generate(payload, process.env.REFRESH_TOKEN_KEY);
  }

  verifyRefreshToken(refreshToken) {
    if (!refreshToken || typeof refreshToken !== "string") {
      throw new InvariantError("validasi refresh token tidak valid");
    }

    try {
      const artifacts = this._jwt.decode(refreshToken);
      this._jwt.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY);
      const payload = artifacts.decoded;
      return payload;
    } catch (error) {
      throw new InvariantError("refresh token tidak valid");
    }
  }
}

module.exports = JwtTokenManager;
