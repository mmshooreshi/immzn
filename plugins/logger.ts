// plugins/logger.ts
import { createLogger } from '~/utils/createLogger'

export default defineNuxtPlugin((nuxtApp) => {
  const logger = createLogger()
  nuxtApp.provide('log', logger)

  // Only define global $log once
  if (!globalThis.$log) {
    Object.defineProperty(globalThis, '$log', {
      value: logger,
      writable: false,
      configurable: false,
      enumerable: false,
    })
    logger.info('✨ $log defined on globalThis')
  } else {
    globalThis.$log?.debug?.('⚠️ $log already defined, skipping')
  }
})
