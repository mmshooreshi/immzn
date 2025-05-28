import type { Logger } from '~/utils/createLogger'

declare global {
  var $log: Logger
  interface Window { $log: Logger }
}

declare module '#app' {
  interface NuxtApp { $log: Logger }
}

export { }