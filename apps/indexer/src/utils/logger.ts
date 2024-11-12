// src/logger.ts
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'debug', // Default logging level
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [
    new transports.Console(), // Logs to console
    new transports.File({ filename: 'logs/error.log', level: 'error' }), // Error logs to file
    new transports.File({ filename: 'logs/combined.log' }) // Combined logs to file
  ]
});

export default logger;
