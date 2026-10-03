import { NextResponse, type NextRequest } from 'next/server';
import { ACCESS_COOKIE, accessToken, safeEqual } from '@/lib/access';

// Gate every page behind the shared demo password when SITE_PASSWORD is set.
export async function proxy(request: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return NextResponse.next();

  const cookie = request.cookies.get(ACCESS_COOKIE)?.value ?? '';
  if (cookie && safeEqual(cookie, await accessToken(password))) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = '/access';
  url.search = `?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Everything except the access page itself, Next.js assets and public files.
  matcher: ['/((?!access|_next/static|_next/image|fonts/|favicon.ico|robots.txt).*)'],
};
