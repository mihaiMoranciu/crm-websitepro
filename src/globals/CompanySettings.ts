import type { GlobalAfterChangeHook, GlobalConfig } from 'payload'
import { revalidateTag } from 'next/cache'

import { isAdmin, isStaff } from '../access/roles'

/**
 * The site footer prints the legal name, CUI and contact details from here
 * through a cached read, so an edit has to drop that cache to show up.
 */
const revalidateSite: GlobalAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) revalidateTag('global_setari-firma', 'max')
  return doc
}

/**
 * The issuer's own details, kept in one place because every invoice, offer and
 * contract prints them. A global rather than a collection: there is exactly
 * one company, and a collection would invite a second row that must never exist.
 */
export const CompanySettings: GlobalConfig = {
  slug: 'setari-firma',
  label: 'Setări firmă',
  access: {
    read: isStaff,
    update: isAdmin,
  },
  admin: {
    group: 'Administrare',
    description: 'Datele care apar pe facturi și pe celelalte documente.',
  },
  hooks: {
    afterChange: [revalidateSite],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identitate',
          fields: [
            {
              name: 'denumire',
              type: 'text',
              label: 'Denumire',
              required: true,
              defaultValue: 'WebsitePro SRL',
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo',
              admin: { description: 'Apare în antetul facturii.' },
            },
            {
              type: 'row',
              fields: [
                { name: 'email', type: 'email', label: 'Email' },
                { name: 'telefon', type: 'text', label: 'Telefon' },
                { name: 'website', type: 'text', label: 'Website' },
              ],
            },
          ],
        },
        {
          label: 'Date fiscale',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'cui', type: 'text', label: 'CUI', required: true },
                { name: 'regCom', type: 'text', label: 'Reg. Comerț' },
              ],
            },
            {
              name: 'adresa',
              type: 'textarea',
              label: 'Sediu social',
              admin: { description: 'Cum apare tipărit pe factură.' },
            },
            {
              // e-Factura wants the address broken apart: UBL has a field per
              // component and the ANAF validator rejects a single free-text
              // line. Kept beside `adresa` rather than replacing it, because
              // what gets printed and what gets transmitted are different
              // renderings of the same thing.
              type: 'row',
              fields: [
                {
                  name: 'strada',
                  type: 'text',
                  label: 'Stradă și număr',
                  admin: { description: 'Pentru e-Factura.' },
                },
                { name: 'oras', type: 'text', label: 'Oraș' },
                {
                  name: 'judet',
                  type: 'text',
                  label: 'Județ',
                  admin: { description: 'Numele sau codul ISO: Cluj / RO-CJ.' },
                },
                { name: 'codPostal', type: 'text', label: 'Cod poștal' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'capitalSocial', type: 'text', label: 'Capital social' },
                {
                  name: 'platitorTva',
                  type: 'checkbox',
                  label: 'Plătitor de TVA',
                  defaultValue: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Bancă',
          fields: [
            {
              name: 'conturi',
              type: 'array',
              label: 'Conturi bancare',
              labels: { singular: 'Cont', plural: 'Conturi' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'iban', type: 'text', label: 'IBAN', required: true },
                    { name: 'banca', type: 'text', label: 'Bancă', required: true },
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
              ],
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
                  name: 'serieImplicita',
                  type: 'text',
                  label: 'Serie facturi',
                  defaultValue: 'WP',
                },
                {
                  name: 'serieProforma',
                  type: 'text',
                  label: 'Serie proforme',
                  defaultValue: 'PRO',
                  admin: {
                    description: 'Separată, ca numerotarea fiscală să rămână un șir curat.',
                  },
                },
                {
                  name: 'cotaTvaImplicita',
                  type: 'number',
                  label: 'Cotă TVA implicită (%)',
                  defaultValue: 21,
                  min: 0,
                  max: 100,
                },
              ],
            },
            {
              name: 'mentiuniImplicite',
              type: 'textarea',
              label: 'Mențiuni pe factură',
              admin: { description: 'Text tipărit la finalul fiecărei facturi.' },
            },
            {
              name: 'mesajEmailImplicit',
              type: 'textarea',
              label: 'Mesaj implicit la trimiterea pe email',
              admin: {
                description:
                  'Textul propus în corpul emailului. Se poate rescrie la fiecare trimitere.',
              },
            },
          ],
        },
      ],
    },
  ],
}
