const { errorResponseFormat } = require("../utils/response");

function errorMiddleware(app) {
  const errorHandler = async (err, _, res, __) => {
    const responseError = errorResponseFormat(err.code, err.message);
    res.status(responseError.error.code).json(responseError);
  };
  app.use(errorHandler);
}

module.exports = { errorMiddleware };
