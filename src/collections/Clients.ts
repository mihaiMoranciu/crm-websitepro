import type { CollectionConfig } from 'payload'

import { isAdminOrManager, isStaff } from '../access/roles'
import { isValidCui, normalizeCui } from '../utilities/validateCui'

export const Clients: CollectionConfig = {
  slug: 'clienti',
  labels: {
    singular: 'Client',
    plural: 'Clienti',
  },
  // Soft delete. Accounting needs an audit trail, so a client that has ever
  // been invoiced must never disappear from the database.
  trash: true,
  access: {
    read: isStaff,
    create: isStaff,
    update: isStaff,
    delete: isAdminOrManager,
  },
  admin: {
    useAsTitle: 'nume',
    defaultColumns: ['nume', 'tip', 'email', 'responsabil', 'status'],
    group: 'CRM',
    description: 'Firme și persoane fizice cu care lucrăm.',
  },
  fields: [
    {
      name: 'nume',
      type: 'text',
      label: 'Nume / Firmă',
      required: true,
      index: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Date fiscale',
          fields: [
            {
              name: 'tara',
              type: 'text',
              label: 'Țara',
              defaultValue: 'RO',
              admin: {
                description: 'Cod ISO din două litere: RO, DE, NL, US.',
              },
            },
            {
              name: 'cui',
              type: 'text',
              label: 'CUI',
              unique: true,
              admin: {
                condition: (data) => data.tip === 'pj',
                description: 'Se acceptă cu sau fără prefixul RO.',
              },
              hooks: {
                // One canonical shape, so lookups and the unique index cannot
                // be defeated by "RO1234" vs "1234".
                //
                // Empty becomes null, never an empty string: the unique index
                // treats every '' as the same value, so a second client without
                // a fiscal code would be rejected with a constraint error.
                beforeValidate: [
                  ({ value }) => {
                    const cleaned = value ? normalizeCui(String(value)) : ''
                    return cleaned === '' ? null : cleaned
                  },
                ],
              },
              validate: (value: string | null | undefined, { data }: { data: any }) => {
                if (data?.tip !== 'pj') return true
                if (!value) return true
                // The checksum only applies to Romanian fiscal codes.
                if (data?.tara && data.tara !== 'RO') return true
                return isValidCui(value) || 'CUI invalid: cifra de control nu corespunde.'
              },
            },
            {
              name: 'codTvaIntracomunitar',
              type: 'text',
              label: 'Cod TVA intracomunitar',
              admin: {
                condition: (data) => data.tip === 'pj',
                placeholder: 'DE123456789',
                description: 'Codul verificabil în VIES. Necesar pentru taxare inversă.',
              },
              validate: (value: string | null | undefined) => {
                if (!value) return true
                return (
                  /^[A-Z]{2}[0-9A-Z]{2,13}$/.test(value.toUpperCase()) ||
                  'Format invalid: două litere pentru țară, apoi codul.'
                )
              },
            },
            {
              name: 'regCom',
              type: 'text',
              label: 'Reg. Comerț',
              admin: {
                condition: (data) => data.tip === 'pj',
                placeholder: 'J40/1234/2020',
              },
            },
            {
              name: 'platitorTva',
              type: 'checkbox',
              label: 'Plătitor de TVA',
              defaultValue: true,
              admin: {
                condition: (data) => data.tip === 'pj',
              },
            },
            {
              name: 'regimFiscal',
              type: 'select',
              label: 'Regim fiscal',
              required: true,
              defaultValue: 'intern',
              options: [
                { label: 'Intern (TVA normal)', value: 'intern' },
                { label: 'UE, taxare inversă', value: 'ue_taxare_inversa' },
                { label: 'UE, persoană fizică', value: 'ue_persoana_fizica' },
                { label: 'Export servicii (extra-UE)', value: 'extra_ue' },
              ],
              admin: {
                description:
                  'Decide cum se calculează TVA-ul pe facturile acestui client. Se stabilește explicit, nu se deduce automat din țară.',
              },
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              name: 'persoanaContact',
              type: 'text',
              label: 'Persoană de contact',
              admin: {
                condition: (data) => data.tip === 'pj',
                description: 'Provizoriu. Se va înlocui cu relația către Contacte.',
              },
            },
            {
              type: 'row',
              fields: [
                { name: 'email', type: 'email', label: 'Email' },
                { name: 'telefon', type: 'text', label: 'Telefon' },
              ],
            },
            {
              name: 'website',
              type: 'text',
              label: 'Website',
            },
            {
              type: 'row',
              fields: [
                { name: 'oras', type: 'text', label: 'Oraș' },
                { name: 'judet', type: 'text', label: 'Județ / Regiune' },
              ],
            },
            {
              name: 'adresa',
              type: 'textarea',
              label: 'Adresă',
            },
          ],
        },
        {
          label: 'Facturare',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'moneda',
                  type: 'select',
                  label: 'Monedă implicită',
                  required: true,
                  defaultValue: 'RON',
                  options: [
                    { label: 'RON', value: 'RON' },
                    { label: 'EUR', value: 'EUR' },
                    { label: 'USD', value: 'USD' },
                  ],
                },
                {
                  name: 'termenPlata',
                  type: 'number',
                  label: 'Termen de plată (zile)',
                  required: true,
                  defaultValue: 15,
                  min: 0,
                  max: 180,
                  admin: {
                    description: 'Din el se calculează scadența facturii.',
                  },
                },
              ],
            },
            {
              name: 'adresaFacturare',
              type: 'textarea',
              label: 'Adresă de facturare',
              admin: {
                description: 'Doar dacă diferă de adresa de mai sus.',
              },
            },
            {
              type: 'row',
              fields: [
                { name: 'iban', type: 'text', label: 'IBAN' },
                { name: 'banca', type: 'text', label: 'Bancă' },
              ],
            },
          ],
        },
        {
          label: 'Proiecte',
          fields: [
            {
              name: 'proiecte',
              type: 'join',
              collection: 'proiecte',
              on: 'client',
              label: 'Proiectele clientului',
              admin: {
                description: 'Se completează singur din proiectele legate de acest client.',
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
              admin: {
                description: 'Vizibile doar echipei, niciodată clientului.',
              },
            },
          ],
        },
      ],
    },
    // Sidebar: what you filter and sort by every day.
    {
      name: 'tip',
      type: 'select',
      label: 'Tip client',
      required: true,
      defaultValue: 'pj',
      options: [
        { label: 'Persoană juridică', value: 'pj' },
        { label: 'Persoană fizică', value: 'pf' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'prospect',
      index: true,
      options: [
        { label: 'Activ', value: 'activ' },
        { label: 'Prospect', value: 'prospect' },
        { label: 'Inactiv', value: 'inactiv' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'responsabil',
      type: 'relationship',
      relationTo: 'users',
      label: 'Responsabil cont',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Cine din echipă ține legătura cu acest client.',
      },
    },
    {
      name: 'sursa',
      type: 'select',
      label: 'Sursă',
      options: [
        { label: 'Recomandare', value: 'recomandare' },
        { label: 'Site propriu', value: 'site' },
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'Platformă freelancing', value: 'freelancing' },
        { label: 'Contact la rece', value: 'rece' },
        { label: 'Eveniment', value: 'eveniment' },
        { label: 'Altă sursă', value: 'alta' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Ce canal ți-a adus clientul.',
      },
    },
  ],
  timestamps: true,
}
