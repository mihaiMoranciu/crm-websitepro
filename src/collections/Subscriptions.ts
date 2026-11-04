import type { CollectionBeforeChangeHook, CollectionConfig, FieldAccess } from 'payload'

import { isAdminOrManager, isStaff } from '../access/roles'
import { generateSubscriptionNow } from '../endpoints/generateSubscriptionInvoice'
import { periodKey, firstIssueDate, type Frequency } from '../utilities/recurrence'

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

const sameDay = (a: unknown, b: unknown) =>
  Boolean(a) && Boolean(b) && new Date(String(a)).getTime() === new Date(String(b)).getTime()

/**
 * Where the billing has got to is written by the generator alone. Greyed-out
 * fields are still submitted by the form, so without this a screen left open
 * across a generation would save its old schedule back over the new one.
 */
const deny: FieldAccess = () => false
const serverOnly = { create: deny, update: deny }

/**
 * Keeps the schedule consistent with the settings it is derived from.
 *
 * Recomputed only while nothing has been billed yet. Once invoices exist, the
 * schedule is a record of where the billing actually got to, and silently
 * rewinding it because someone corrected the billing day would re-bill months
 * that are already out the door.
 */
const syncSchedule: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const generated = Number(data.facturiGenerate ?? originalDoc?.facturiGenerate) || 0

  const start = data.dataStart ?? originalDoc?.dataStart
  const day = Number(data.ziuaEmiterii ?? originalDoc?.ziuaEmiterii) || 1

  if (!start) return data

  // `data` holds only what this request sent: a save that merely switches the
  // subscription off carries no schedule at all, and must not be read as one
  // that has none.
  const scheduled = data.urmatoareaEmitere ?? originalDoc?.urmatoareaEmitere

  // A genuine change, not a form resubmitting the values it loaded.
  const startChanged =
    data.dataStart !== undefined && !sameDay(data.dataStart, originalDoc?.dataStart)
  const dayChanged =
    data.ziuaEmiterii !== undefined &&
    Number(data.ziuaEmiterii) !== Number(originalDoc?.ziuaEmiterii)

  if (!scheduled || (generated === 0 && (startChanged || dayChanged))) {
    data.urmatoareaEmitere = firstIssueDate(new Date(String(start)), day).toISOString()
  }

  return data
}

/**
 * Totals are recomputed server-side, exactly as on an invoice: the figure a
 * subscription advertises has to be the figure its invoices will carry.
 */
const computeValue: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const source = data.linii ?? originalDoc?.linii
  const lines = Array.isArray(source) ? source : []

  let subtotal = 0
  for (const line of lines) {
    const quantity = Number(line?.cantitate) || 0
    const price = Number(line?.pretUnitar) || 0
    line.total = round2(quantity * price)
    subtotal += line.total
  }

  if (data.linii) data.linii = lines
  data.valoare = round2(subtotal)

  return data
}

/**
 * Builds the label every list row and dropdown shows.
 *
 * `useAsTitle` reads one stored field, so the document has to carry its own
 * description: a subscription named only by its client is impossible to tell
 * from the client's other subscription.
 */
const buildLabel: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const name = data.nume ?? originalDoc?.nume
  const frequency = data.frecventa ?? originalDoc?.frecventa
  const value = Number(data.valoare ?? originalDoc?.valoare)
  const currency = data.moneda ?? originalDoc?.moneda

  const parts: string[] = [String(name ?? 'Abonament')]

  const clientId =
    typeof data.client === 'object' ? data.client?.id : (data.client ?? originalDoc?.client)

  if (clientId) {
    try {
      const client = await req.payload.findByID({
        collection: 'clienti',
        id: clientId,
        depth: 0,
        req,
      })
      if (client?.nume) parts.push(String(client.nume))
    } catch {
      // A missing client must not stop the subscription from saving.
    }
  }

  const perFrequency: Record<string, string> = {
    lunar: '/lună',
    trimestrial: '/trimestru',
    anual: '/an',
  }

  if (Number.isFinite(value)) {
    parts.push(
      `${value.toFixed(2)} ${currency ?? ''}${perFrequency[String(frequency)] ?? ''}`.trim(),
    )
  }

  data.eticheta = parts.join(' · ')

  return data
}

export const Subscriptions: CollectionConfig = {
  slug: 'abonamente',
  labels: {
    singular: 'Abonament',
    plural: 'Abonamente',
  },
  // The invoices generated from a subscription point back at it, so it has to
  // survive being switched off.
  trash: true,
  access: {
    read: isStaff,
    create: isStaff,
    update: isStaff,
    delete: isAdminOrManager,
  },
  admin: {
    useAsTitle: 'eticheta',
    defaultColumns: ['eticheta', 'frecventa', 'urmatoareaEmitere', 'activ'],
    group: 'CRM',
    description: 'Facturare recurentă. Generează ciorne, nu facturi emise.',
  },
  hooks: {
    beforeChange: [syncSchedule, computeValue, buildLabel],
  },
  endpoints: [
    {
      path: '/:id/genereaza',
      method: 'post',
      handler: generateSubscriptionNow,
    },
  ],
  fields: [
    {
      name: 'eticheta',
      type: 'text',
      label: 'Abonament',
      index: true,
      admin: { readOnly: true, hidden: true },
    },
    {
      name: 'nume',
      type: 'text',
      label: 'Denumire',
      required: true,
      admin: { description: 'Cum îl recunoști tu: „Mentenanță lunară", „Găzduire + SSL".' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Linii',
          fields: [
            {
              name: 'linii',
              type: 'array',
              label: 'Linii facturate',
              minRows: 1,
              labels: { singular: 'Linie', plural: 'Linii' },
              admin: {
                description: 'Se copiază pe fiecare factură generată.',
              },
              fields: [
                {
                  name: 'descriere',
                  type: 'text',
                  label: 'Descriere',
                  required: true,
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'cantitate',
                      type: 'number',
                      label: 'Cantitate',
                      required: true,
                      defaultValue: 1,
                      min: 0,
                    },
                    {
                      name: 'unitate',
                      type: 'select',
                      label: 'U.M.',
                      required: true,
                      defaultValue: 'luni',
                      options: [
                        { label: 'ore', value: 'ore' },
                        { label: 'buc', value: 'buc' },
                        { label: 'zile', value: 'zile' },
                        { label: 'luni', value: 'luni' },
                      ],
                    },
                    {
                      name: 'pretUnitar',
                      type: 'number',
                      label: 'Preț unitar',
                      required: true,
                      min: 0,
                    },
                    {
                      name: 'total',
                      type: 'number',
                      label: 'Total linie',
                      admin: { readOnly: true, hidden: true },
                    },
                  ],
                },
              ],
            },
            {
              name: 'valoare',
              type: 'number',
              label: 'Valoare per factură',
              admin: {
                readOnly: true,
                description: 'Fără TVA. Se recalculează la salvare.',
              },
            },
            {
              name: 'adaugaPerioadaInDescriere',
              type: 'checkbox',
              label: 'Adaugă perioada în descrierea liniilor',
              defaultValue: true,
              admin: {
                description: '„Mentenanță lunară” devine „Mentenanță lunară - septembrie 2026”.',
              },
            },
          ],
        },
        {
          label: 'Program',
          fields: [
            {
              name: 'genereazaAcum',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/components/admin/GenerateSubscriptionButton#GenerateSubscriptionButton',
                },
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'frecventa',
                  type: 'select',
                  label: 'Frecvență',
                  required: true,
                  defaultValue: 'lunar',
                  index: true,
                  options: [
                    { label: 'Lunar', value: 'lunar' },
                    { label: 'Trimestrial', value: 'trimestrial' },
                    { label: 'Anual', value: 'anual' },
                  ],
                },
                {
                  name: 'ziuaEmiterii',
                  type: 'number',
                  label: 'Ziua emiterii',
                  required: true,
                  defaultValue: 1,
                  min: 1,
                  max: 31,
                  admin: {
                    description: 'În lunile mai scurte se coboară automat la ultima zi.',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'dataStart',
                  type: 'date',
                  label: 'Începe la',
                  required: true,
                  defaultValue: () => new Date().toISOString(),
                },
                {
                  name: 'dataStop',
                  type: 'date',
                  label: 'Se oprește la',
                  admin: {
                    description: 'Gol = pe termen nedeterminat.',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'urmatoareaEmitere',
                  access: serverOnly,
                  type: 'date',
                  label: 'Următoarea emitere',
                  index: true,
                  admin: {
                    readOnly: true,
                    description: 'Se recalculează cât timp nu s-a facturat încă nimic.',
                  },
                },
                {
                  name: 'ultimaEmitere',
                  access: serverOnly,
                  type: 'date',
                  label: 'Ultima emitere',
                  admin: { readOnly: true },
                },
              ],
            },
            {
              name: 'facturiGenerate',
              access: serverOnly,
              type: 'number',
              label: 'Facturi generate',
              defaultValue: 0,
              admin: { readOnly: true, hidden: true },
            },
          ],
        },
        {
          label: 'Date fiscale',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'serie',
                  type: 'text',
                  label: 'Serie',
                  required: true,
                  defaultValue: 'WP',
                },
                {
                  name: 'cotaTva',
                  type: 'number',
                  label: 'Cotă TVA (%)',
                  required: true,
                  defaultValue: 21,
                  min: 0,
                  max: 100,
                },
                {
                  name: 'moneda',
                  type: 'select',
                  label: 'Monedă',
                  required: true,
                  defaultValue: 'RON',
                  options: [
                    { label: 'RON', value: 'RON' },
                    { label: 'EUR', value: 'EUR' },
                    { label: 'USD', value: 'USD' },
                  ],
                },
              ],
            },
            {
              name: 'taxareInversa',
              type: 'checkbox',
              label: 'Taxare inversă',
              admin: { description: 'Client UE cu cod TVA valid sau export extra-UE.' },
            },
            {
              name: 'mentiuni',
              type: 'textarea',
              label: 'Mențiuni pe factură',
            },
          ],
        },
        {
          label: 'Facturi',
          fields: [
            {
              name: 'facturi',
              type: 'join',
              collection: 'facturi',
              on: 'abonament',
              label: 'Facturi generate',
              admin: {
                description: 'Tot ce a ieșit din acest abonament.',
              },
            },
          ],
        },
        {
          label: 'Note interne',
          fields: [
            {
              name: 'nota',
              type: 'textarea',
              label: 'Note',
            },
          ],
        },
      ],
    },
    // Sidebar
    {
      name: 'activ',
      type: 'checkbox',
      label: 'Activ',
      defaultValue: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Debifat, nu se mai generează nimic.',
      },
    },
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clienti',
      label: 'Client',
      required: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'proiect',
      type: 'relationship',
      relationTo: 'proiecte',
      label: 'Proiect',
      index: true,
      filterOptions: ({ data }) => (data?.client ? { client: { equals: data.client } } : false),
      admin: {
        position: 'sidebar',
        description: 'Opțional. Se alege întâi clientul.',
      },
    },
  ],
  timestamps: true,
}

/** Re-exported so the period label has one definition across the codebase. */
export { periodKey as etichetaPerioada }
export type { Frequency as Frecventa }
