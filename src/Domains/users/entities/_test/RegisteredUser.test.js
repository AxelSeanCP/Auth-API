const RegisteredUser = require("../RegisteredUser");

describe("a RegisteredUser entitites", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      username: "dicoding",
      fullname: "Dicoding Indonesia",
    };

    // Action and Assert
    expect(() => new RegisteredUser(payload)).toThrow(
      "REGISTERED_USER.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      id: 123,
      username: "dicoding",
      fullname: "Dicoding Indonesia",
    };

    // Action and Assert
    expect(() => new RegisteredUser(payload)).toThrow(
      "REGISTERED_USER.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create registeredUser object correctly", () => {
    const payload = {
      id: "user-123",
      username: "dicoding",
      fullname: "Dicoding Indonesia",
    };

    const registeredUser = new RegisteredUser(payload);

    expect(registeredUser.id).toEqual(payload.id);
    expect(registeredUser.username).toEqual(payload.username);
    expect(registeredUser.fullname).toEqual(payload.fullname);
  });
});
