export const PERMISSIONS = [
  'stores.view',
  'stores.manage',
  'products.view',
  'products.manage',
  'products.bulk',
  'orders.view',
  'orders.manage',
  'customers.view',
  'customers.manage',
  'partnerships.view',
  'partnerships.manage',
  'promotions.manage',
  'analytics.view',
  'settings.manage',
  'audit_logs.view',
  'content.manage',
  'reviews.manage',
] as const

export type Permission = typeof PERMISSIONS[number]

// Named presets offered when a Super Admin invites a sub-admin. Sub-admins
// can have their permissions edited freely afterward — these are starting points.
export const ROLE_TEMPLATES: Record<string, Permission[]> = {
  'Inventory Manager':        ['stores.view', 'products.view', 'products.manage', 'products.bulk'],
  'Order Manager':            ['orders.view', 'orders.manage', 'customers.view'],
  'Operations Manager':       ['stores.view', 'stores.manage', 'products.view', 'products.manage', 'orders.view', 'orders.manage'],
  'Content Manager':          ['content.manage', 'promotions.manage', 'products.view'],
  'Customer Support':         ['orders.view', 'customers.view', 'customers.manage'],
  'Vendor Relations Officer': ['stores.view', 'stores.manage', 'partnerships.view', 'partnerships.manage'],
  'Marketing Manager':        ['promotions.manage', 'content.manage', 'analytics.view'],
  'Finance':                  ['orders.view', 'analytics.view'],
  'Support':                  ['orders.view', 'customers.view'],
}

export const ROLE_TEMPLATE_NAMES = Object.keys(ROLE_TEMPLATES)
