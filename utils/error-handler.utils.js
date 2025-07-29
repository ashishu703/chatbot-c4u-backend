const { appEnv } = require("../config/app.config");
const CustomException = require("../exceptions/CustomException");
const logger = require("../utils/logger.utils");
function errorHandler(err, req, res, next) {

  logger.error({
    message: err.message,
    stack: err.stack,
  });

  if (err instanceof CustomException) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
    });
  }
  else {
    es.status(400).json({
      success: false,
      message: err.message || 'Internal Server Error',
      ...(appEnv === 'development' && { stack: err.stack }),
    });
  }

  r
}

module.exports = {
  errorHandler,
};
