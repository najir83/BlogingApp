const { validateToken } = require("../services/auth");

function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    const cookieValue = req.cookies[cookieName];
    if (!cookieValue) return next();
    try {
      const userPlayLoad = validateToken(cookieValue);
      req.user = userPlayLoad;
      return next();
    } catch (e) {
      return next();
    }
  };
}

module.exports = checkForAuthenticationCookie;
