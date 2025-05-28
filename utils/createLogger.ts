type Level = 'info' | 'warn' | 'error' | 'debug'

const ansi: Record<Level, string> = {
  info : '\x1b[32m',
  warn : '\x1b[33m',
  error: '\x1b[31m',
  debug: '\x1b[36m'
}

const css: Record<Level, string> = {
  info : 'background:#16a34a;color:#fff;padding:2px 6px;border-radius:4px',
  warn : 'background:#ca8a04;color:#fff;padding:2px 6px;border-radius:4px',
  error: 'background:#dc2626;color:#fff;padding:2px 6px;border-radius:4px',
  debug: 'background:#0ea5e9;color:#fff;padding:2px 6px;border-radius:4px'
}

const ts = () => new Date().toISOString().split('T')[1].replace('Z', '')

export interface Logger {
  info (...args: any[]): void
  warn (...args: any[]): void
  error(...args: any[]): void
  debug(...args: any[]): void
}

export function createLogger (): Logger {
  const print = (lvl: Level, args: any[]) => {
    if (process.client) {
      console.log(`%c${lvl.toUpperCase()}%c ${ts()}`, css[lvl], 'color:#888', ...args)
    } else {
      console.log(`${ansi[lvl]}${lvl.toUpperCase()}\x1b[0m ${ts()}`, ...args)
    }
  }
  return {
    info : (...a) => print('info',  a),
    warn : (...a) => print('warn',  a),
    error: (...a) => print('error', a),
    debug: (...a) => print('debug', a)
  }
}