/**
 * Date arithmetic for recurring billing.
 *
 * Kept free of Payload so the rules that decide when a client gets charged can
 * be read, and checked, without booting a CMS.
 *
 * Everything works in UTC. Billing dates are calendar facts, not moments: the
 * invoice for September is the invoice for September whether the server sits
 * in Bucharest or on a runner set to UTC, and doing the arithmetic in local
 * time is how a schedule silently slips a day every time the clocks change.
 */

export type Frequency = 'lunar' | 'trimestrial' | 'anual'

export const MONTHS_PER_FREQUENCY: Record<Frequency, number> = {
  lunar: 1,
  trimestrial: 3,
  anual: 12,
}

const MONTHS_RO = [
  'ianuarie',
  'februarie',
  'martie',
  'aprilie',
  'mai',
  'iunie',
  'iulie',
  'august',
  'septembrie',
  'octombrie',
  'noiembrie',
  'decembrie',
]

/** Strips the time, so two billing dates compare as the days they represent. */
export const toDay = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))

/**
 * The issue date inside a given month, with the day clamped to what that month
 * actually has.
 *
 * A subscription billed on the 31st has to charge on the 28th in February.
 * Passing the month unnormalised is deliberate: JavaScript rolls month 12 into
 * January of the next year on its own, which is exactly the behaviour wanted.
 */
export const issueDateInMonth = (year: number, month: number, day: number): Date => {
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  return new Date(Date.UTC(year, month, Math.min(Math.max(day, 1), lastDay)))
}

/** The first charge on or after the start date. */
export const firstIssueDate = (start: Date, day: number): Date => {
  const begin = toDay(start)
  const candidate = issueDateInMonth(begin.getUTCFullYear(), begin.getUTCMonth(), day)
  if (candidate >= begin) return candidate
  return issueDateInMonth(begin.getUTCFullYear(), begin.getUTCMonth() + 1, day)
}

/**
 * The charge after this one.
 *
 * The day is rebuilt from the subscription's own setting rather than carried
 * over from the previous date. Carrying it over makes a February clamp
 * permanent: the 31st becomes the 28th, and every month after that stays on
 * the 28th.
 */
export const nextIssueDate = (current: Date, frequency: Frequency, day: number): Date => {
  const step = MONTHS_PER_FREQUENCY[frequency] ?? 1
  const base = toDay(current)
  return issueDateInMonth(base.getUTCFullYear(), base.getUTCMonth() + step, day)
}

/**
 * The machine-readable name of the period being billed.
 *
 * This is the key that stops the same month being invoiced twice, so it has to
 * be stable: derived from the date and the frequency alone, never from a
 * counter or the time of generation.
 */
export const periodKey = (date: Date, frequency: Frequency): string => {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()

  if (frequency === 'anual') return String(year)
  if (frequency === 'trimestrial') return `${year}-T${Math.floor(month / 3) + 1}`
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

/** The same period, written the way it should read on the invoice line. */
export const periodName = (date: Date, frequency: Frequency): string => {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()

  if (frequency === 'anual') return String(year)
  if (frequency === 'trimestrial') return `T${Math.floor(month / 3) + 1} ${year}`
  return `${MONTHS_RO[month]} ${year}`
}

/** Adds whole days, for the due date. */
export const addDays = (date: Date, days: number): Date =>
  new Date(toDay(date).getTime() + days * 86400000)
