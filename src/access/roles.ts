import type { Access, FieldAccess } from 'payload'

import type { User } from '@/payload-types'

export const ROLES = ['admin', 'manager', 'developer', 'contabil'] as const

export type Role = (typeof ROLES)[number]

export const ROLE_OPTIONS: { label: string; value: Role }[] = [
  { label: 'Administrator', value: 'admin' },
  { label: 'Manager', value: 'manager' },
  { label: 'Developer', value: 'developer' },
  { label: 'Contabil', value: 'contabil' },
]

export const hasRole = (user: User | null, ...roles: Role[]): boolean => {
  if (!user) return false
  return roles.some((role) => user.roles?.includes(role))
}

/** Any signed-in staff member. The baseline for reading CRM data. */
export const isStaff: Access<User> = ({ req: { user } }) => Boolean(user)

export const isAdmin: Access<User> = ({ req: { user } }) => hasRole(user, 'admin')

/** Destructive or commercially sensitive operations. */
export const isAdminOrManager: Access<User> = ({ req: { user } }) =>
  hasRole(user, 'admin', 'manager')

export const isAdminOrAccountant: Access<User> = ({ req: { user } }) =>
  hasRole(user, 'admin', 'contabil')

export const isAdminFieldLevel: FieldAccess<User> = ({ req: { user } }) => hasRole(user, 'admin')

/** Admins manage everyone; everybody else may only touch their own record. */
export const isAdminOrSelf: Access<User> = ({ req: { user } }) => {
  if (!user) return false
  if (hasRole(user, 'admin')) return true
  return { id: { equals: user.id } }
}
