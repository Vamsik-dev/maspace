// Shared-password access for hosted demos (e.g. Vercel).
// Set SITE_PASSWORD in the hosting environment; when it is unset the site is open,
// which keeps local development and the single-file share build unchanged.

export const ACCESS_COOKIE = 'atlas_access';
export const ACCESS_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/** The cookie stores a hash of the password, never the password itself. */
export async function accessToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`atlas-demo-access:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Length-independent comparison so response timing does not reveal how much matched. */
export function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

/** Only allow same-site relative paths as the post-login destination. */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/access')) return '/';
  return next;
}
