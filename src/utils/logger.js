const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;

// Custom log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', // Set log level based on environment
  format: combine(
    colorize(), // Enable colors for better readability in the console
    timestamp(), // Add timestamps to the logs
    logFormat // Use custom log format
  ),
  transports: [
    new transports.Console(), // Log to the console
    new transports.File({ filename: 'logs/error.log', level: 'error' }), // Log errors to a separate file
    new transports.File({ filename: 'logs/combined.log' }) // Log all levels to a combined file
  ]
});

// If in production, handle only 'uncaughtException' and 'unhandledRejection'
if (process.env.NODE_ENV === 'production') {
  logger.exceptions.handle(
    new transports.File({ filename: 'logs/exceptions.log' })
  );
}

module.exports = logger;
