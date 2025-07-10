const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const { DEVELOPMENT } = require('../types/app-mode.types');
const { errorLogConfig } = require('../config/app.config');

const dailyRotateFileTransport = new transports.DailyRotateFile(errorLogConfig);

const logger = createLogger({
    level: 'error',
    format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message, stack }) => {
            return `[${timestamp}] ${level.toUpperCase()} - ${message}\n${stack || ''}\n`;
        })
    ),
    transports: [
        dailyRotateFileTransport,
        ...(process.env.NODE_ENV === DEVELOPMENT ? [new transports.Console()] : [])
    ],
});

module.exports = logger;
