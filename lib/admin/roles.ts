// Client-side mirror of the server's section segregation (adminSectionAccess.middleware.ts).
// The server enforces access; this only decides what to show and where to land a user.

export type Role = 'sales' | 'marketing' | 'finance' | 'admin' | 'superAdmin';

// General operators see everything.
const SEES_ALL: Role[] = ['admin', 'superAdmin'];

// Which roles may open each admin path. Anything not listed is general-operator only.
// Paths use startsWith matching so sub-routes inherit their section's access.
const ACCESS: { prefix: string; roles: Role[] }[] = [
  { prefix: '/admin/quotations', roles: ['sales'] },
  { prefix: '/admin/enquiries', roles: ['sales'] }, // includes the "merch enquiries" tab
  { prefix: '/admin/clients', roles: ['marketing'] },
  { prefix: '/admin/case-studies', roles: ['marketing'] },
  { prefix: '/admin/blogs', roles: ['marketing'] },
  { prefix: '/admin/marketing', roles: ['marketing'] },
  { prefix: '/admin/users', roles: [] }, // superAdmin only
  { prefix: '/admin/assignments', roles: [] }, // superAdmin only — Q&E assignment
  { prefix: '/admin/careers', roles: [] }, // superAdmin only
  { prefix: '/admin/settings', roles: ['sales', 'marketing', 'finance'] }, // own profile — everyone
];

export function canAccess(role: Role | undefined, path: string): boolean {
  if (!role) return false;
  if (SEES_ALL.includes(role)) return true;
  const match = ACCESS.find((a) => path === a.prefix || path.startsWith(a.prefix + '/'));
  // Unmatched section (orders, catalog, sellers, dashboard, …) is general-operator only.
  return match ? match.roles.includes(role) : false;
}

// First page a role should land on after login.
export function homeFor(role: Role | undefined): string {
  switch (role) {
    case 'sales': return '/admin/quotations';
    case 'marketing': return '/admin/clients';
    case 'finance': return '/admin/settings';
    default: return '/admin'; // admin / superAdmin
  }
}

export const ROLE_LABEL: Record<Role, string> = {
  sales: 'Sales',
  marketing: 'Marketing',
  finance: 'Finance',
  admin: 'Admin',
  superAdmin: 'Super Admin',
};
