export const ROLES = {
  ADMIN: 'ADMIN',
  SALES_MANAGER: 'SALES_MANAGER',
  SALES_EXECUTIVE: 'SALES_EXECUTIVE',
}

export function isElevated(user) {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.SALES_MANAGER
}

export function formatRole(role) {
  return role ? role.replaceAll('_', ' ') : ''
}
