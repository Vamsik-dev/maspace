import { NextResponse, type NextRequest } from 'next/server';
import { ACCESS_COOKIE, ACCESS_MAX_AGE, accessToken, safeEqual, safeNext } from '@/lib/access';

// Branded password page for the hosted demo. Rendered as plain HTML so it sits
// outside the app shell and the demo sign-in.

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function page(next: string, error: boolean) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Atlas · Private preview</title>
<style>
  @font-face { font-family: 'Mona Sans'; src: url('/fonts/mona-sans.woff2') format('woff2'); font-weight: 200 900; font-stretch: 75% 125%; font-display: swap; }
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 16px;
    font-family: 'Mona Sans', 'Helvetica Neue', Arial, sans-serif; color: #eef1f6; -webkit-font-smoothing: antialiased;
    background:
      radial-gradient(ellipse 60% 45% at 50% 0%, rgba(110, 130, 230, 0.22), transparent 70%),
      radial-gradient(ellipse 40% 30% at 85% 20%, rgba(160, 130, 255, 0.12), transparent 70%),
      #070b14; }
  .grid { position: fixed; inset: 0; pointer-events: none;
    background: linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px) 0 0/72px 72px, linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px) 0 0/72px 72px;
    mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%); -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%); }
  .card { position: relative; width: 100%; max-width: 400px; padding: 32px; border-radius: 16px; border: 1px solid rgba(255,255,255,.12);
    background: linear-gradient(180deg, rgba(20,28,48,.9), rgba(10,15,30,.95)); box-shadow: 0 40px 100px -24px rgba(0,0,0,.9);
    animation: rise .6s cubic-bezier(.2,.7,.2,1) both; }
  @keyframes rise { from { opacity: 0; transform: translateY(12px); } }
  .brand { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 16px; }
  h1 { margin: 22px 0 0; font-size: 24px; font-weight: 600; letter-spacing: -0.02em; }
  p { margin: 8px 0 0; font-size: 14px; line-height: 1.55; color: #98a3b8; }
  label { display: block; margin: 22px 0 8px; font-size: 12.5px; font-weight: 500; color: #c7cfdc; }
  input { width: 100%; height: 44px; padding: 0 14px; border-radius: 9px; border: 1px solid rgba(255,255,255,.14); background: rgba(255,255,255,.04);
    color: #eef1f6; font: inherit; font-size: 15px; outline: none; transition: border-color .2s, box-shadow .2s; }
  input:focus { border-color: #8ea6ff; box-shadow: 0 0 0 4px rgba(142,166,255,.18); }
  button { width: 100%; height: 46px; margin-top: 16px; border: 0; border-radius: 9px; cursor: pointer; color: #fff; font: inherit; font-weight: 500; font-size: 15px;
    background: linear-gradient(180deg, #6a88f5, #4766dc); box-shadow: 0 0 0 1px rgba(120,150,255,.55) inset, 0 10px 28px -10px rgba(80,115,240,.75); }
  button:hover { filter: brightness(1.06); }
  .error { margin-top: 14px; padding: 10px 12px; border-radius: 8px; font-size: 13px; color: #ffb4b4; background: rgba(239,128,128,.1); border: 1px solid rgba(239,128,128,.3); }
  .fine { margin-top: 18px; font-size: 12px; color: #69758c; text-align: center; }
</style>
</head>
<body>
<div class="grid"></div>
<form class="card" method="post" action="/access">
  <div class="brand">
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><rect x=".75" y=".75" width="30.5" height="30.5" rx="8" fill="#0f1830" stroke="#33415f" stroke-width="1.5"/><circle cx="16" cy="16" r="8.5" fill="none" stroke="#8ea6ff" stroke-width="1.6"/><ellipse cx="16" cy="16" rx="3.6" ry="8.5" fill="none" stroke="#8ea6ff" stroke-width="1.3"/><path d="M7.8 13.2h16.4M7.8 18.8h16.4" stroke="#8ea6ff" stroke-width="1.1" opacity=".7"/></svg>
    Atlas
  </div>
  <h1>Private preview</h1>
  <p>This prototype is shared for expert review. Enter the access password you were given.</p>
  <input type="hidden" name="next" value="${esc(next)}" />
  <label for="password">Access password</label>
  <input id="password" name="password" type="password" autocomplete="current-password" required autofocus />
  ${error ? '<div class="error" role="alert">That password is not correct. Please try again.</div>' : ''}
  <button type="submit">Continue</button>
  <div class="fine">Synthetic data only. Access is remembered on this device for 30 days.</div>
</form>
</body>
</html>`;
}

const html = (body: string, status = 200) =>
  new NextResponse(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' } });

export async function GET(request: NextRequest) {
  if (!process.env.SITE_PASSWORD) return NextResponse.redirect(new URL('/', request.url));
  const sp = request.nextUrl.searchParams;
  return html(page(safeNext(sp.get('next')), sp.get('error') === '1'));
}

export async function POST(request: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return NextResponse.redirect(new URL('/', request.url), 303);

  const form = await request.formData();
  const given = String(form.get('password') ?? '');
  const next = safeNext(String(form.get('next') ?? '/'));

  const expected = await accessToken(password);
  if (!safeEqual(await accessToken(given), expected)) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return NextResponse.redirect(new URL(`/access?error=1&next=${encodeURIComponent(next)}`, request.url), 303);
  }

  const res = NextResponse.redirect(new URL(next, request.url), 303);
  res.cookies.set(ACCESS_COOKIE, expected, {
    httpOnly: true,
    secure: request.nextUrl.protocol === 'https:',
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_MAX_AGE,
  });
  return res;
}
