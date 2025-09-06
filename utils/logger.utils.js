const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const path = require('path');
const { DEVELOPMENT } = require('../types/app-mode.types');
const { errorLogConfig } = require('../config/app.config');

// Enhanced config for ALL logs (not just errors)
const allLogsConfig = {
    filename: 'app-%DATE%.log',
    dirname: path.join(__dirname, '../logs'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true, // Compress old logs
    maxSize: '50m',      // 50MB per file
    maxFiles: '30d',     // Keep for 30 days
    level: 'debug',      // Log everything from debug level up
};

// Error logs config (keep existing)
const errorLogsConfig = {
    filename: 'error-%DATE%.log',
    dirname: path.join(__dirname, '../logs'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
};

// Create transports
const allLogsTransport = new transports.DailyRotateFile(allLogsConfig);
const errorLogsTransport = new transports.DailyRotateFile(errorLogsConfig);

const logger = createLogger({
    level: 'debug', // Changed from 'error' to 'debug' to capture ALL logs
    format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message, stack, ...meta }) => {
            const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
            return `[${timestamp}] ${level.toUpperCase()} - ${message}${metaStr}\n${stack || ''}`;
        })
    ),
    transports: [
        allLogsTransport,    // Save ALL logs
        errorLogsTransport,  // Save ERROR logs separately
        ...(process.env.NODE_ENV === DEVELOPMENT ? [new transports.Console()] : [])
    ],
    // Handle uncaught exceptions
    exceptionHandlers: [
        new transports.DailyRotateFile({
            filename: 'exceptions-%DATE%.log',
            dirname: path.join(__dirname, '../logs'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
        })
    ],
    // Handle unhandled promise rejections
    rejectionHandlers: [
        new transports.DailyRotateFile({
            filename: 'rejections-%DATE%.log',
            dirname: path.join(__dirname, '../logs'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
        })
    ]
});

// Helper functions for different types of logs
logger.api = (message, meta = {}) => {
    logger.info(`[API] ${message}`, { type: 'api', ...meta });
};

logger.database = (message, meta = {}) => {
    logger.info(`[DATABASE] ${message}`, { type: 'database', ...meta });
};

logger.socket = (message, meta = {}) => {
    logger.info(`[SOCKET] ${message}`, { type: 'socket', ...meta });
};

logger.webhook = (message, meta = {}) => {
    logger.info(`[WEBHOOK] ${message}`, { type: 'webhook', ...meta });
};

logger.auth = (message, meta = {}) => {
    logger.info(`[AUTH] ${message}`, { type: 'auth', ...meta });
};

logger.flow = (message, meta = {}) => {
    logger.info(`[FLOW] ${message}`, { type: 'flow', ...meta });
};

logger.chatbot = (message, meta = {}) => {
    logger.info(`[CHATBOT] ${message}`, { type: 'chatbot', ...meta });
};

logger.broadcast = (message, meta = {}) => {
    logger.info(`[BROADCAST] ${message}`, { type: 'broadcast', ...meta });
};

// Override console.log to use Winston logger
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

console.log = (...args) => {
    const message = args.join(' ');
    logger.info(message);
    originalConsoleLog(...args);
};

console.error = (...args) => {
    const message = args.join(' ');
    logger.error(message);
    originalConsoleError(...args);
};

console.warn = (...args) => {
    const message = args.join(' ');
    logger.warn(message);
    originalConsoleWarn(...args);
};

console.info = (...args) => {
    const message = args.join(' ');
    logger.info(message);
    originalConsoleInfo(...args);
};

module.exports = logger;
