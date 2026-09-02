/**
 * Centralized logging utility.
 * Development: verbose. Production: minimal, never logs secrets.
 */

const IS_DEV = process.env.EXPO_PUBLIC_APP_ENV !== 'production';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function log(level: LogLevel, message: string, ...args: unknown[]) {
  // Never log in production except errors
  if (!IS_DEV && level !== 'error') return;

  const prefix = `[FoodieApp:${level.toUpperCase()}]`;
  switch (level) {
    case 'error':
      console.error(prefix, message, ...args);
      break;
    case 'warn':
      console.warn(prefix, message, ...args);
      break;
    default:
      if (IS_DEV) {
        // intentionally not console.log
        console.warn(prefix, message, ...args);
      }
  }
}

export const logger = {
  info: (message: string, ...args: unknown[]) => log('info', message, ...args),
  warn: (message: string, ...args: unknown[]) => log('warn', message, ...args),
  error: (message: string, ...args: unknown[]) => log('error', message, ...args),
  debug: (message: string, ...args: unknown[]) => log('debug', message, ...args),
};
