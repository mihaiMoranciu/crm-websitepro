import type { CollectionConfig } from 'payload'

import { isAdminOrManager, isStaff } from '../access/roles'

export const Tasks: CollectionConfig = {
  slug: 'taskuri',
  labels: {
    singular: 'Task',
    plural: 'Taskuri',
  },
  trash: true,
  access: {
    read: isStaff,
    create: isStaff,
    update: isStaff,
    delete: isAdminOrManager,
  },
  admin: {
    useAsTitle: 'titlu',
    defaultColumns: ['titlu', 'proiect', 'status', 'responsabil', 'estimareOre', 'deadline'],
    group: 'CRM',
    description: 'Lucrările concrete de pe fiecare proiect.',
  },
  fields: [
    {
      name: 'titlu',
      type: 'text',
      label: 'Titlu',
      required: true,
      index: true,
    },
    {
      name: 'descriere',
      type: 'textarea',
      label: 'Descriere',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'estimareOre',
          type: 'number',
          label: 'Estimare (ore)',
          min: 0,
          admin: {
            description: 'Reper pentru comparația cu orele pontate.',
          },
        },
        {
          name: 'deadline',
          type: 'date',
          label: 'Termen',
        },
      ],
    },
    {
      // Hours live on time entries, never here: a task is work to be done,
      // not a billable quantity.
      name: 'pontaj',
      type: 'join',
      collection: 'pontaj',
      on: 'task',
      label: 'Ore pontate',
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
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'de_facut',
      index: true,
      options: [
        { label: 'De făcut', value: 'de_facut' },
        { label: 'În lucru', value: 'in_lucru' },
        { label: 'Blocat', value: 'blocat' },
        { label: 'Gata', value: 'gata' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'responsabil',
      type: 'relationship',
      relationTo: 'users',
      label: 'Responsabil',
      index: true,
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
}
