/**
 * Logger utility using Winston
 * Provides structured logging for the Maximo MCP Server
 */

import winston from 'winston';

/**
 * Custom log format that includes timestamp, level, and message
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.printf((info: winston.Logform.TransformableInfo) => {
    const { timestamp, level, message, ...metadata } = info;
    let msg = `${String(timestamp)} [${level.toUpperCase()}]: ${String(message)}`;

    // Add metadata if present (excluding sensitive fields)
    const filteredMetadata: Record<string, unknown> = { ...metadata };
    delete filteredMetadata['password'];
    delete filteredMetadata['apiKey'];
    delete filteredMetadata['token'];
    delete filteredMetadata['credentials'];

    if (Object.keys(filteredMetadata).length > 0) {
      msg += ` ${JSON.stringify(filteredMetadata)}`;
    }

    return msg;
  })
);

/**
 * Winston logger instance
 * Logs to console and optionally to file
 */
export const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] || 'info',
  format: logFormat,
  transports: [
    // Console transport for all logs — write to stderr to avoid corrupting MCP stdio protocol
    new winston.transports.Console({
      stderrLevels: ['error', 'warn', 'info', 'debug', 'verbose', 'silly'],
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // Don't exit on handled exceptions
  exitOnError: false,
});

/**
 * Create a child logger with a specific context
 * @param context - The context/module name for the logger
 * @returns A child logger instance
 */
export function createLogger(context: string): winston.Logger {
  return logger.child({ context });
}

/**
 * Sanitize sensitive data from objects before logging
 * @param data - The data object to sanitize
 * @returns Sanitized data object
 */
export function sanitizeLogData(data: Record<string, unknown>): Record<string, unknown>;
export function sanitizeLogData(data: unknown): unknown;
export function sanitizeLogData(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveKeys = [
    'password',
    'apiKey',
    'api_key',
    'token',
    'secret',
    'credentials',
    'authorization',
    'auth',
  ];

  const record = data as Record<string, unknown>;
  const sanitized: Record<string, unknown> = { ...record };

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeLogData(sanitized[key] as Record<string, unknown>);
    }
  }

  return sanitized;
}

export default logger;