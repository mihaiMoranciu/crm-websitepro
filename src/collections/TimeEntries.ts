import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { APIError } from 'payload'

import { isAdminOrManager, isStaff } from '../access/roles'

/**
 * The invoice lines own the link, so nothing else may write it.
 *
 * Setting `factura` by hand would mark hours as billed on a document whose
 * lines do not contain them: the money is never charged, and the hours vanish
 * from the billable pool without a trace. Only the reconcile hook on Facturi
 * may set it, and it announces itself through the request context.
 */
const onlyViaReconcile: CollectionBeforeChangeHook = ({ context, data, originalDoc }) => {
  if (context?.reconciling) return data

  const previous = originalDoc?.factura ?? null
  const current = data.factura ?? null
  const previousId = typeof previous === 'object' ? previous?.id : previous
  const currentId = typeof current === 'object' ? current?.id : current

  if ((currentId ?? null) !== (previousId ?? null)) {
    throw new APIError(
      'Legătura cu factura se face din liniile facturii, nu direct de pe pontaj.',
      400,
    )
  }

  return data
}

/**
 * Time entries, kept separate from tasks on purpose.
 *
 * A task is *what* has to be done and carries no money. A time entry is *how
 * long it took*, and it is the only thing that can be billed. Keeping them
 * apart is what lets three hours on one bug be split into two billable and
 * one written off, which a single flag on the task cannot express.
 */
export const TimeEntries: CollectionConfig = {
  slug: 'pontaj',
  labels: {
    singular: 'Pontaj',
    plural: 'Pontaj',
  },
  trash: true,
  access: {
    read: isStaff,
    create: isStaff,
    update: isStaff,
    delete: isAdminOrManager,
  },
  admin: {
    useAsTitle: 'descriere',
    defaultColumns: ['data', 'proiect', 'descriere', 'ore', 'facturabil', 'factura'],
    group: 'CRM',
    description: 'Orele lucrate. Singura sursă a liniilor de factură.',
  },
  hooks: {
    beforeChange: [onlyViaReconcile],
  },
  fields: [
    {
      name: 'descriere',
      type: 'text',
      label: 'Ce s-a lucrat',
      required: true,
      admin: {
        description: 'Textul poate ajunge pe factură, deci scrie-l pentru client.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'data',
          type: 'date',
          label: 'Data',
          required: true,
          index: true,
          defaultValue: () => new Date().toISOString(),
        },
        {
          name: 'ore',
          type: 'number',
          label: 'Ore',
          required: true,
          min: 0.25,
          max: 24,
        },
      ],
    },
    {
      name: 'proiect',
      type: 'relationship',
      relationTo: 'proiecte',
      label: 'Proiect',
      required: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'task',
      type: 'relationship',
      relationTo: 'taskuri',
      label: 'Task',
      index: true,
      // Only tasks from the project already chosen.
      filterOptions: ({ data }) => (data?.proiect ? { proiect: { equals: data.proiect } } : false),
      admin: {
        position: 'sidebar',
        description: 'Opțional. Ședințele și analiza se ponteză direct pe proiect.',
      },
    },
    {
      name: 'utilizator',
      type: 'relationship',
      relationTo: 'users',
      label: 'Cine a lucrat',
      required: true,
      index: true,
      defaultValue: ({ user }) => user?.id,
      admin: { position: 'sidebar' },
    },
    {
      name: 'facturabil',
      type: 'checkbox',
      label: 'Facturabil',
      defaultValue: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Debifează pentru garanție sau refaceri din vina noastră.',
      },
    },
    {
      // A link, not a flag: "billed" alone cannot answer "on which invoice?"
      // when the client questions a line months later.
      name: 'factura',
      type: 'relationship',
      relationTo: 'facturi',
      label: 'Facturat pe',
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Se completează automat la generarea liniilor.',
      },
    },
  ],
  timestamps: true,
}
