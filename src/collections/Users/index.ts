import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { isAdmin, isAdminFieldLevel, isAdminOrSelf, ROLE_OPTIONS } from '../../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    // Any signed-in account may open the panel, so a fresh install can never
    // lock itself out. Sensitive operations are gated by role below.
    admin: authenticated,
    create: isAdmin,
    delete: isAdmin,
    read: authenticated,
    update: isAdminOrSelf,
  },
  admin: {
    defaultColumns: ['name', 'email', 'roles'],
    useAsTitle: 'name',
    group: 'Administrare',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nume',
    },
    {
      name: 'roles',
      type: 'select',
      label: 'Roluri',
      hasMany: true,
      required: true,
      defaultValue: ['developer'],
      options: ROLE_OPTIONS,
      access: {
        // Without this, anyone editing their own profile could promote
        // themselves to administrator.
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
      admin: {
        description: 'Determină ce poate face utilizatorul în CRM.',
      },
    },
  ],
  timestamps: true,
}
