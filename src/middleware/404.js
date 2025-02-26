const { ApiError } = require("../error");

function _404Middleware(app) {
  app.use(() => {
    throw ApiError.endPointNotFound();
  });
}

module.exports = _404Middleware;
