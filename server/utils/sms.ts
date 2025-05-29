import { useRuntimeConfig } from '#imports'
import { scoped } from '~/server/utils/log'

const logger = scoped('sms')

export interface SmsParameter { Name: string; Value: string }

/**
 * Sends an SMS via SMS.ir or prints a mock message to the server console when smsMock='true'.
 *
 * @param phone E.164 formatted phone number (e.g. +989123456789)
 * @param templateId Numeric template ID configured on the SMS.ir panel
 * @param parameters Array of { Name, Value } matching placeholders in the template
 */
export async function sendSms (phone: string, templateId: number, parameters: SmsParameter[]) {
  const cfg = useRuntimeConfig()
  const mock = cfg.smsMock === 'true' || cfg.smsMock === 'true'

  if (mock) {
    logger.info('(mock) SMS →', { phone, templateId, parameters })
    return
  }

  await $fetch('https://api.sms.ir/v1/send/verify', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'X-API-KEY':     cfg.smsIrApiKey,
      'X-SECRET-KEY':  cfg.smsIrSecretKey
    },
    body: {
      Mobile: phone,
      TemplateId: templateId,
      Parameters: parameters
    }
  })

  logger.success(`SMS.ir accepted → ${phone}`)
}
