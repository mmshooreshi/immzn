// server/utils/log.ts
import type { Logger } from '~/utils/createLogger'

// Fallback to console if plugin not yet run
export const $log: Logger = (globalThis as any).$log || console





import {consola} from 'consola'
export const log = consola.withTag('edge')
export const scoped = (tag: string) => consola.withTag(`edge:${tag}`)
