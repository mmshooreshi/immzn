// server/utils/sms.ts

import { useRuntimeConfig } from '#imports'
import { scoped } from '~/server/utils/log'

const logger = scoped('sms')

export interface SmsParameter {
  Name: string
  Value: string
}

/**
 * Sends an SMS using Melipayamak's shared endpoint and a bodyId.
 *
 * @param phone E.164 formatted phone number (e.g. +989123456789)
 * @param bodyId Template ID defined on Melipayamak
 * @param args Ordered string array of arguments replacing placeholders in the template
 */
export async function sendSms(phone: string, bodyId: number, args: string[]) {
  const cfg = useRuntimeConfig()
  const mock = cfg.smsMock === 'true'

  if (mock) {
    logger.info('(mock) SMS →', { phone, bodyId, args })
    return
  }

  const url = `https://aisland.co/melipayamak/api/send/shared/${cfg.melipayamakApiKey}`

  const payload = {
    bodyId,
    to: phone,
    args,
  }

  const res = await $fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
  })

  logger.success(`Melipayamak SMS sent → ${phone}`, res)
}


/**
 * Sends a custom message using Melipayamak with fixed message parts.
 * Example use case: event invitation, notification with multiple values.
 */
export async function sendCustomMelipayamakSMS(
  phone: string,
  teamName: string,
  fullname: string,
  code: string
) {
  const cfg = useRuntimeConfig()
  const mock = cfg.smsMock === 'true'

  const payload = {
    bodyId: cfg.melipayamakInviteMsgId,  // e.g. 334464
    to: phone,
    args: [teamName, fullname, code],
  }

  if (mock) {
    logger.info('(mock) Custom SMS →', payload)
    return
  }

  const url = `https://console.melipayamak.com/api/send/shared/${cfg.melipayamakApiKey}`

  const res = await $fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
  })

  logger.success(`Melipayamak custom SMS sent → ${phone}`, res)
}
