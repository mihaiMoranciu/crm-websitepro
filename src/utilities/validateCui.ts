/**
 * Romanian fiscal code (CUI/CIF) validation.
 *
 * The last digit is a checksum over the preceding ones, weighted by a fixed
 * control key and right-aligned to nine positions.
 */
const CONTROL_KEY = '753217532'

/** Strips the optional RO prefix, spaces and separators. */
export const normalizeCui = (value: string): string => value.replace(/^ro/i, '').replace(/\D/g, '')

export const isValidCui = (value: string): boolean => {
  const digits = normalizeCui(value)

  // Romanian fiscal codes run from 2 up to 10 digits.
  if (digits.length < 2 || digits.length > 10) return false

  const checkDigit = Number(digits.at(-1))
  const body = digits.slice(0, -1).padStart(CONTROL_KEY.length, '0')

  const sum = body
    .split('')
    .reduce((acc, digit, index) => acc + Number(digit) * Number(CONTROL_KEY[index]), 0)

  const computed = (sum * 10) % 11

  return (computed === 10 ? 0 : computed) === checkDigit
}
