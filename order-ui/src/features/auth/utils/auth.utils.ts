import type { Role, User } from '@/types/auth';

function normalizeRole(roleStr: string): Role | null {
  const clean = roleStr.replace(/^ROLE_/i, '').toUpperCase();
  if (clean === 'SUPER_ADMIN' || clean === 'ADMIN' || clean === 'USER') {
    return clean as Role;
  }
  return null;
}

export function parseJwt(token: string): Record<string, any> | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function extractUserFromStorage(): User | null {
  const token = localStorage.getItem('accessToken');
  const storedRole = localStorage.getItem('role');

  if (!token) return null;

  const payload = parseJwt(token) || {};

  let roles: Role[] = [];

  // 1. From payload.roles array
  if (Array.isArray(payload.roles)) {
    roles = payload.roles.map(normalizeRole).filter((r): r is Role => r !== null);
  }
  // 2. From payload.role string
  else if (typeof payload.role === 'string') {
    const r = normalizeRole(payload.role);
    if (r) roles.push(r);
  }
  // 3. From payload.authorities array
  else if (Array.isArray(payload.authorities)) {
    roles = payload.authorities
      .map((a: any) => (typeof a === 'string' ? a : a?.authority))
      .filter((a: any) => typeof a === 'string')
      .map(normalizeRole)
      .filter((r): r is Role => r !== null);
  }

  // 4. Fallback to storedRole in localStorage
  if (roles.length === 0 && storedRole) {
    const r = normalizeRole(storedRole);
    if (r) roles.push(r);
  }

  // Default to USER if authenticated but no explicit role is found
  if (roles.length === 0) {
    roles = ['USER'];
  }

  return {
    id: payload.sub || payload.id || payload.userId || 'user-1',
    email: payload.email || payload.sub || '',
    firstName: payload.firstName || payload.given_name || '',
    lastName: payload.lastName || payload.family_name || '',
    roles,
  };
}
