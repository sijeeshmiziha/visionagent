/**
 * Simple logger with optional prefix and progress support
 */

import type { Logger } from '../types/common';

/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Logger configuration
 */
export interface LoggerConfig {
  /** Prefix for all log messages */
  prefix?: string;
  /** Minimum log level to output */
  level?: LogLevel;
  /** Whether to output timestamps */
  timestamps?: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Create a logger with the given configuration
 */
export function createLogger(config: LoggerConfig = {}): Logger {
  const { prefix = '', level = 'info', timestamps = false } = config;
  const minLevel = LOG_LEVELS[level];

  function formatMessage(logLevel: LogLevel, message: string): string {
    const parts: string[] = [];
    if (timestamps) {
      parts.push(`[${new Date().toISOString()}]`);
    }
    parts.push(`[${logLevel.toUpperCase()}]`);
    if (prefix) {
      parts.push(`[${prefix}]`);
    }
    parts.push(message);
    return parts.join(' ');
  }

  function shouldLog(logLevel: LogLevel): boolean {
    return LOG_LEVELS[logLevel] >= minLevel;
  }

  return {
    debug(message: string, data?: Record<string, unknown>): void {
      if (shouldLog('debug')) {
        console.debug(formatMessage('debug', message), data ?? '');
      }
    },

    info(message: string, data?: Record<string, unknown>): void {
      if (shouldLog('info')) {
        console.info(formatMessage('info', message), data ?? '');
      }
    },

    warn(message: string, data?: Record<string, unknown>): void {
      if (shouldLog('warn')) {
        console.warn(formatMessage('warn', message), data ?? '');
      }
    },

    error(message: string, error?: Error | Record<string, unknown>): void {
      if (shouldLog('error')) {
        console.error(formatMessage('error', message), error ?? '');
      }
    },
  };
}
