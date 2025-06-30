const { appEnv } = require("../config/app.config");
const logger = require("../utils/logger.utils");
function errorHandler(err, req, res, next) {

  const status = err.status || 500;

  console.log(err);

  logger.error({
    message: err.message,
    stack: err.stack,
  });

  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(appEnv === 'development' && { stack: err.stack }),
  });
}

module.exports = {
  errorHandler,
};
