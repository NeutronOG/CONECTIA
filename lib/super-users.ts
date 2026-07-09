export const SUPER_USER_EMAILS = ['admin@conectia.mx', 'lizzie@conectia.mx']

export function isSuperUser(user?: { email?: string; role?: string } | null): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  return !!user.email && SUPER_USER_EMAILS.includes(user.email.toLowerCase())
}
