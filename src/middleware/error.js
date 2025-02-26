const { HttpStatus } = require("../error");
const { getI18Message } = require("../utils/i18n");

function errorMiddleware(app) {
  const errorHandler = async (err, _, res, __) => {
    let code = err.code || HttpStatus.InternalServerError;
    const responseError = {
      status: "error",
      error: {
        code: code,
        message: err.code ? err.message : getI18Message("somethingWentWrong"),
      },
    };
    res.status(code).json(responseError);
  };
  app.use(errorHandler);
}

module.exports = { errorMiddleware };
