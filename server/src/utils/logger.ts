/**
 * Minimal structured logger. Emits single-line JSON so log output stays
 * greppable and can later be piped into a hosted logging provider without
 * changing call sites.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMeta {
  [key: string]: unknown;
}

function write(level: LogLevel, message: string, meta?: LogMeta): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta } : {}),
  };

  const line = JSON.stringify(entry);

  if (level === 'error') {
    // eslint-disable-next-line no-console
    console.error(line);
  } else if (level === 'warn') {
    // eslint-disable-next-line no-console
    console.warn(line);
  } else {
    // eslint-disable-next-line no-console
    console.log(line);
  }
}

export const logger = {
  debug: (message: string, meta?: LogMeta) => write('debug', message, meta),
  info: (message: string, meta?: LogMeta) => write('info', message, meta),
  warn: (message: string, meta?: LogMeta) => write('warn', message, meta),
  error: (message: string, meta?: LogMeta) => write('error', message, meta),
};
