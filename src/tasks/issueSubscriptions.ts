import type { TaskConfig } from 'payload'

import { generateFromSubscription } from '../endpoints/generateSubscriptionInvoice'

/**
 * How many periods one subscription may catch up on in a single sweep.
 *
 * A schedule that has not run for a while genuinely owes several invoices, so
 * catching up is right. A cap is still needed: a subscription created with a
 * start date years in the past would otherwise fill the panel with drafts
 * before anyone noticed the typo.
 */
const MAX_CATCH_UP = 12

/** Its own queue, so the sweep's schedule is not tied to other background work. */
export const SUBSCRIPTIONS_QUEUE = 'abonamente'

/**
 * Sweeps every subscription that has come due and drafts its invoice.
 *
 * Runs as a job rather than a hook because nothing a user does triggers it:
 * the passage of time does. Queued daily by its own `schedule` and run by
 * `jobs.autoRun`; an external scheduler can also call
 * `/api/payload-jobs/run` with the CRON_SECRET, or it can be run by hand from the
 * subscription screen.
 */
export const issueSubscriptions = {
  slug: 'emiteAbonamente',
  label: 'Emite facturi din abonamente',
  inputSchema: [
    {
      name: 'panaLa',
      type: 'date',
      // Billing "as of" a date makes the sweep reproducible, which is what
      // lets it be tested and re-run after a failure.
      admin: { description: 'Facturează tot ce e scadent până la această dată. Gol = azi.' },
    },
  ],
  outputSchema: [
    { name: 'generate', type: 'number' },
    { name: 'sarite', type: 'number' },
    { name: 'jurnal', type: 'textarea' },
  ],
  retries: 1,
  // Queued once a day; `jobs.autoRun` in the config is what then runs it.
  // Six fields, seconds first: 06:00:00 every day.
  schedule: [{ cron: '0 0 6 * * *', queue: SUBSCRIPTIONS_QUEUE }],
  handler: async ({ input, req }: { input: { panaLa?: string }; req: any }) => {
    const until = input?.panaLa ? new Date(String(input.panaLa)) : new Date()

    const { docs } = await req.payload.find({
      collection: 'abonamente',
      where: {
        and: [
          { activ: { equals: true } },
          { urmatoareaEmitere: { less_than_equal: until.toISOString() } },
        ],
      },
      limit: 200,
      depth: 0,
      req,
    })

    let generated = 0
    let skipped = 0
    const log: string[] = []

    for (const subscription of docs) {
      for (let step = 0; step < MAX_CATCH_UP; step++) {
        // Re-read each time: the generator moves the schedule forward, and the
        // loop has to see that move to know whether anything is still due.
        const current = (await req.payload.findByID({
          collection: 'abonamente',
          id: subscription.id,
          depth: 0,
          req,
        })) as Record<string, any>

        const due =
          current.activ &&
          current.urmatoareaEmitere &&
          new Date(String(current.urmatoareaEmitere)) <= until

        if (!due) break

        const result = await generateFromSubscription({
          payload: req.payload,
          req,
          id: subscription.id,
        })

        if (!result.created) {
          log.push(`${current.eticheta ?? current.id}: ${result.reason}`)

          // The period already had its invoice and the schedule stepped over
          // it, so the next turn of the loop has something new to look at.
          if (result.advanced) continue

          // Any other refusal: retrying would hit the same wall and spin
          // until the cap.
          skipped++
          break
        }

        generated++
        log.push(`${current.eticheta ?? current.id}: ciornă pentru ${result.period}`)
      }
    }

    return { output: { generate: generated, sarite: skipped, jurnal: log.join('\n') } }
  },
} as TaskConfig<'emiteAbonamente'>
