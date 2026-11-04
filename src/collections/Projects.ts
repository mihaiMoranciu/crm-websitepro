import type { CollectionConfig } from 'payload'

import { isAdminOrManager, isStaff } from '../access/roles'

export const Projects: CollectionConfig = {
  slug: 'proiecte',
  labels: {
    singular: 'Proiect',
    plural: 'Proiecte',
  },
  // Projects get referenced by contracts, invoices and time entries, so they
  // must never vanish from the database.
  trash: true,
  access: {
    read: isStaff,
    create: isStaff,
    update: isStaff,
    delete: isAdminOrManager,
  },
  admin: {
    useAsTitle: 'nume',
    defaultColumns: ['nume', 'client', 'tip', 'status', 'deadline'],
    group: 'CRM',
    description: 'Lucrările în desfășurare și cele închise.',
  },
  fields: [
    {
      name: 'nume',
      type: 'text',
      label: 'Nume proiect',
      required: true,
      index: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Detalii',
          fields: [
            {
              name: 'descriere',
              type: 'textarea',
              label: 'Descriere',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'dataStart',
                  type: 'date',
                  label: 'Data început',
                },
                {
                  name: 'deadline',
                  type: 'date',
                  label: 'Termen livrare',
                  index: true,
                },
              ],
            },
            {
              name: 'dataFinalizare',
              type: 'date',
              label: 'Data finalizării',
              admin: {
                condition: (data) => data.status === 'finalizat',
              },
            },
            {
              name: 'echipa',
              type: 'relationship',
              relationTo: 'users',
              hasMany: true,
              label: 'Echipă',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'urlLive',
                  type: 'text',
                  label: 'URL live',
                },
                {
                  name: 'urlRepo',
                  type: 'text',
                  label: 'Repository',
                },
              ],
            },
          ],
        },
        {
          label: 'Comercial',
          fields: [
            {
              name: 'tipFacturare',
              type: 'select',
              label: 'Mod de facturare',
              required: true,
              defaultValue: 'fix',
              options: [
                { label: 'Preț fix', value: 'fix' },
                { label: 'Pe oră', value: 'ora' },
                { label: 'Abonament lunar', value: 'abonament' },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'valoare',
                  type: 'number',
                  label: 'Valoare contractată',
                  min: 0,
                  admin: {
                    condition: (data) => data.tipFacturare !== 'ora',
                    description: 'Fără TVA.',
                  },
                },
                {
                  name: 'tarifOrar',
                  type: 'number',
                  label: 'Tarif orar',
                  min: 0,
                  admin: {
                    condition: (data) => data.tipFacturare === 'ora',
                    description: 'Fără TVA.',
                  },
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
              name: 'oreEstimate',
              type: 'number',
              label: 'Ore estimate',
              min: 0,
              admin: {
                description: 'Reper pentru comparația cu pontajul real.',
              },
            },
          ],
        },
        {
          label: 'Taskuri',
          fields: [
            {
              name: 'taskuri',
              type: 'join',
              collection: 'taskuri',
              on: 'proiect',
              label: 'Taskuri',
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
    // Sidebar: what you filter and scan by every day.
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
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'ofertat',
      index: true,
      options: [
        { label: 'Ofertat', value: 'ofertat' },
        { label: 'În lucru', value: 'in_lucru' },
        { label: 'În așteptare', value: 'in_asteptare' },
        { label: 'Finalizat', value: 'finalizat' },
        { label: 'Anulat', value: 'anulat' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'tip',
      type: 'select',
      label: 'Tip lucrare',
      required: true,
      defaultValue: 'website',
      options: [
        { label: 'Website', value: 'website' },
        { label: 'Aplicație web', value: 'aplicatie' },
        { label: 'Brand & print', value: 'brand' },
        { label: 'Mentenanță', value: 'mentenanta' },
        { label: 'Altul', value: 'altul' },
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
