const JWT = require("jsonwebtoken");
const secret = "hjssu^fhghg$kso";

function createTokenForUSer(user) {
  const playload = {
    name: user.fullName,
    _id: user._id,
    email: user.email,
    profileImg: user.profileImg,
    role: user.role,
  };
  const token = JWT.sign(playload, secret);
  return token;
}

function validateToken(token) {
  const playload = JWT.verify(token, secret);
  return playload;
}

module.exports = {
  createTokenForUSer,
  validateToken,
};
