// utils/digits.ts  – replace the two helpers with null‑safe versions
const en = '0123456789'
const fa = '۰۱۲۳۴۵۶۷۸۹'

export const toPersianDigits = (val: string | number | null | undefined): string =>
  val == null ? '' : String(val).replace(/[0-9]/g, d => fa[+d])

export const toEnglishDigits = (val: string | number | null | undefined): string =>
  val == null ? '' : String(val).replace(/[۰-۹]/g, d => en[fa.indexOf(d)])
