import type { Payload, PayloadHandler, PayloadRequest } from 'payload'
import { commitTransaction, initTransaction, killTransaction } from 'payload'

import {
  addDays,
  periodKey,
  periodName,
  nextIssueDate,
  type Frequency,
} from '../utilities/recurrence'

const respond = (body: unknown, status = 200) =>
  Response.json(body as Record<string, unknown>, { status })

export type GenerationResult = {
  created: boolean
  reason?: string
  invoiceId?: number | string
  period?: string
  /** Nothing was drafted, but the schedule moved on, so asking again is useful. */
  advanced?: boolean
}

/**
 * Draws up the invoice a subscription owes for one period.
 *
 * Always a draft. Numbering is irreversible and gapless, so a scheduled job
 * must never be the thing that consumes a fiscal number: a cron that fires
 * twice, or fires against a half-configured subscription, would leave a hole
 * in the series that no amount of editing can close. The job proposes, a
 * person issues.
 *
 * Idempotency is carried by the period label stored on the invoice. Asked
 * twice for September, this returns the September invoice it already made
 * rather than a second one.
 */
export const generateFromSubscription = async (args: {
  payload: Payload
  req?: PayloadRequest
  id: string | number
  /** Which period to bill. Defaults to the subscription's next due date. */
  onDate?: Date
}): Promise<GenerationResult> => {
  const { payload, req, id, onDate } = args

  const subscription = (await payload.findByID({
    collection: 'abonamente',
    id,
    depth: 0,
    req,
  })) as unknown as Record<string, any>

  if (!subscription.activ) return { created: false, reason: 'Abonamentul este oprit.' }

  const lines = Array.isArray(subscription.linii) ? subscription.linii : []
  if (lines.length === 0) return { created: false, reason: 'Abonamentul nu are nicio linie.' }

  const date = onDate ?? new Date(String(subscription.urmatoareaEmitere))
  if (Number.isNaN(date.getTime())) {
    return { created: false, reason: 'Abonamentul nu are o dată de emitere calculată.' }
  }

  // Past the end date there is nothing left to bill. Switching it off here,
  // rather than only after a successful generation, matters: the stop date is
  // usually set once the schedule has already moved beyond it, so the branch
  // that advances the schedule never runs again. Without this, an expired
  // subscription stays flagged active and gets swept every night for ever.
  if (subscription.dataStop && date > new Date(String(subscription.dataStop))) {
    await payload.update({
      collection: 'abonamente',
      id: subscription.id,
      data: { activ: false } as never,
      req,
      context: { scheduling: true },
    })
    return { created: false, reason: 'Abonamentul s-a încheiat la data de stop.' }
  }

  const frequency = (subscription.frecventa ?? 'lunar') as Frequency
  const period = periodKey(date, frequency)

  /**
   * Moves the schedule past the period in hand. Never backwards: generating an
   * early draft by hand should not rewind a schedule that is already ahead.
   */
  const advance = async (invoice: boolean): Promise<boolean> => {
    const nextDate = nextIssueDate(date, frequency, Number(subscription.ziuaEmiterii) || 1)
    const scheduled = new Date(String(subscription.urmatoareaEmitere))

    const changes: Record<string, unknown> = invoice
      ? {
          ultimaEmitere: date.toISOString(),
          facturiGenerate: (Number(subscription.facturiGenerate) || 0) + 1,
        }
      : {}

    if (Number.isNaN(scheduled.getTime()) || nextDate > scheduled) {
      changes.urmatoareaEmitere = nextDate.toISOString()
    }

    // Past its end date there is nothing left to bill, so the subscription
    // stops showing up as due instead of being swept every night for ever.
    if (subscription.dataStop && nextDate > new Date(String(subscription.dataStop))) {
      changes.activ = false
    }

    if (Object.keys(changes).length === 0) return false

    await payload.update({
      collection: 'abonamente',
      id: subscription.id,
      data: changes as never,
      req,
      context: { scheduling: true },
    })

    return true
  }

  // Soft-deleted invoices are deliberately not counted: a draft thrown away on
  // purpose should be reproducible, otherwise a mistyped line locks the period
  // out for good.
  const existing = await payload.find({
    collection: 'facturi',
    where: {
      and: [{ abonament: { equals: subscription.id } }, { perioada: { equals: period } }],
    },
    limit: 1,
    depth: 0,
    req,
  })

  if (existing.totalDocs > 0) {
    // Step over it. A schedule left pointing at a period that already has its
    // invoice would be refused here every night and never bill again.
    const advanced = await advance(false)

    return {
      created: false,
      reason: advanced
        ? `Perioada ${period} era deja facturată; programul a trecut la următoarea.`
        : `Perioada ${period} este deja facturată.`,
      invoiceId: existing.docs[0]?.id,
      period,
      advanced,
    }
  }

  // Payment terms belong to the client, not to the subscription, so they are
  // read fresh at issue time rather than frozen when the subscription was set up.
  let paymentTerm = 15
  try {
    const client = (await payload.findByID({
      collection: 'clienti',
      id: subscription.client,
      depth: 0,
      req,
    })) as unknown as Record<string, any>
    paymentTerm = Number(client?.termenPlata) || 15
  } catch {
    // A missing client is caught by the invoice's own validation.
  }

  const suffix = subscription.adaugaPerioadaInDescriere ? ` - ${periodName(date, frequency)}` : ''

  const invoice = await payload.create({
    collection: 'facturi',
    data: {
      tip: 'fiscala',
      status: 'ciorna',
      serie: subscription.serie,
      client: subscription.client,
      ...(subscription.proiect ? { proiect: subscription.proiect } : {}),
      moneda: subscription.moneda,
      cotaTva: subscription.cotaTva,
      taxareInversa: subscription.taxareInversa,
      dataEmitere: date.toISOString(),
      dataScadenta: addDays(date, paymentTerm).toISOString(),
      mentiuni: subscription.mentiuni,
      abonament: subscription.id,
      perioada: period,
      linii: lines.map((l: any) => ({
        descriere: `${l.descriere}${suffix}`,
        cantitate: l.cantitate,
        unitate: l.unitate,
        pretUnitar: l.pretUnitar,
        // A subscription bills an agreed amount, never logged hours.
        pontajIds: [],
      })),
    } as never,
    req,
  })

  await advance(true)

  return { created: true, invoiceId: invoice.id, period }
}

/** The "generate now" action on the subscription screen. */
export const generateSubscriptionNow: PayloadHandler = async (req) => {
  const { payload, user, routeParams } = req

  if (!user) return respond({ error: 'Neautentificat.' }, 401)

  const id = routeParams?.id as string | undefined
  if (!id) return respond({ error: 'Lipsește id-ul.' }, 400)

  // The draft and the schedule move together or not at all: a draft left
  // behind by a failed schedule update is how a period gets billed twice.
  const ownsTransaction = await initTransaction(req)
  let result: GenerationResult
  try {
    result = await generateFromSubscription({ payload, req, id })
    if (ownsTransaction) await commitTransaction(req)
  } catch (e) {
    if (ownsTransaction) await killTransaction(req)
    throw e
  }

  if (!result.created) {
    return respond({ error: result.reason, invoiceId: result.invoiceId }, 400)
  }

  return respond(result)
}
