// Encrypts the single-file share build behind a password for static hosting
// (GitHub Pages or any static host). The published page holds only ciphertext;
// the browser decrypts it with the password (PBKDF2-SHA256 → AES-256-GCM).
//
//   SITE_PASSWORD='…' node scripts/encrypt-share.mjs [input] [outputDir]
//
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';

const input = process.argv[2] ?? 'share-dist/share/index.html';
const outDir = process.argv[3] ?? 'site-dist';
const password = process.env.SITE_PASSWORD;
if (!password) {
  console.error('Set SITE_PASSWORD');
  process.exit(1);
}
const ITER = 600000;
const enc = new TextEncoder();
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const plain = enc.encode(readFileSync(input, 'utf8'));
const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain));
const b64 = (u) => Buffer.from(u).toString('base64');
const font = readFileSync('public/fonts/mona-sans.woff2').toString('base64');

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Atlas · Private preview</title>
<style>
  @font-face { font-family: 'Mona Sans'; src: url(data:font/woff2;base64,${font}) format('woff2'); font-weight: 200 900; font-stretch: 75% 125%; font-display: swap; }
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 16px;
    font-family: 'Mona Sans', 'Helvetica Neue', Arial, sans-serif; color: #eef1f6; -webkit-font-smoothing: antialiased;
    background: radial-gradient(ellipse 60% 45% at 50% 0%, rgba(110,130,230,.22), transparent 70%), radial-gradient(ellipse 40% 30% at 85% 20%, rgba(160,130,255,.12), transparent 70%), #070b14; }
  .grid { position: fixed; inset: 0; pointer-events: none;
    background: linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px) 0 0/72px 72px, linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px) 0 0/72px 72px;
    mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%); -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%); }
  .card { position: relative; width: 100%; max-width: 400px; padding: 32px; border-radius: 16px; border: 1px solid rgba(255,255,255,.12);
    background: linear-gradient(180deg, rgba(20,28,48,.9), rgba(10,15,30,.95)); box-shadow: 0 40px 100px -24px rgba(0,0,0,.9); animation: rise .6s cubic-bezier(.2,.7,.2,1) both; }
  @keyframes rise { from { opacity: 0; transform: translateY(12px); } }
  .brand { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 16px; }
  h1 { margin: 22px 0 0; font-size: 24px; font-weight: 600; letter-spacing: -0.02em; }
  p { margin: 8px 0 0; font-size: 14px; line-height: 1.55; color: #98a3b8; }
  label { display: block; margin: 22px 0 8px; font-size: 12.5px; font-weight: 500; color: #c7cfdc; }
  input { width: 100%; height: 44px; padding: 0 14px; border-radius: 9px; border: 1px solid rgba(255,255,255,.14); background: rgba(255,255,255,.04); color: #eef1f6; font: inherit; font-size: 15px; outline: none; }
  input:focus { border-color: #8ea6ff; box-shadow: 0 0 0 4px rgba(142,166,255,.18); }
  button { width: 100%; height: 46px; margin-top: 16px; border: 0; border-radius: 9px; cursor: pointer; color: #fff; font: inherit; font-weight: 500; font-size: 15px;
    background: linear-gradient(180deg, #6a88f5, #4766dc); box-shadow: 0 0 0 1px rgba(120,150,255,.55) inset, 0 10px 28px -10px rgba(80,115,240,.75); }
  button[disabled] { opacity: .7; cursor: progress; }
  .error { display: none; margin-top: 14px; padding: 10px 12px; border-radius: 8px; font-size: 13px; color: #ffb4b4; background: rgba(239,128,128,.1); border: 1px solid rgba(239,128,128,.3); }
  .fine { margin-top: 18px; font-size: 12px; color: #69758c; text-align: center; }
</style>
</head>
<body>
<div class="grid"></div>
<form class="card" id="f">
  <div class="brand">
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><rect x=".75" y=".75" width="30.5" height="30.5" rx="8" fill="#0f1830" stroke="#33415f" stroke-width="1.5"/><circle cx="16" cy="16" r="8.5" fill="none" stroke="#8ea6ff" stroke-width="1.6"/><ellipse cx="16" cy="16" rx="3.6" ry="8.5" fill="none" stroke="#8ea6ff" stroke-width="1.3"/><path d="M7.8 13.2h16.4M7.8 18.8h16.4" stroke="#8ea6ff" stroke-width="1.1" opacity=".7"/></svg>
    Atlas
  </div>
  <h1>Private preview</h1>
  <p>This prototype is shared for expert review. Enter the access password you were given.</p>
  <label for="pw">Access password</label>
  <input id="pw" type="password" autocomplete="current-password" required autofocus />
  <div class="error" id="err" role="alert">That password is not correct. Please try again.</div>
  <button id="go" type="submit">Continue</button>
  <div class="fine">Synthetic data only. Access is remembered on this device for 30 days.</div>
</form>
<script>
(function () {
  var DATA = { salt: '${b64(salt)}', iv: '${b64(iv)}', iter: ${ITER}, ct: '${b64(cipher)}' };
  var STORE = 'atlas-preview-key:' + DATA.salt;
  var dec = function (s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); };
  function open(key) {
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv: dec(DATA.iv) }, key, dec(DATA.ct)).then(function (buf) {
      var html = new TextDecoder().decode(buf);
      document.open(); document.write(html); document.close();
    });
  }
  function remember(key) {
    return crypto.subtle.exportKey('raw', key).then(function (raw) {
      try { localStorage.setItem(STORE, JSON.stringify({ k: btoa(String.fromCharCode.apply(null, new Uint8Array(raw))), exp: Date.now() + 30 * 864e5 })); } catch (e) {}
    });
  }
  function importRaw(b64, extractable) { return crypto.subtle.importKey('raw', dec(b64), 'AES-GCM', extractable, ['decrypt']); }
  // Returning visitor: reuse the stored key.
  try {
    var saved = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (saved && saved.exp > Date.now()) { importRaw(saved.k, false).then(open).catch(function () { localStorage.removeItem(STORE); }); }
  } catch (e) {}
  document.getElementById('f').addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = document.getElementById('go'), err = document.getElementById('err');
    btn.disabled = true; btn.textContent = 'Opening…'; err.style.display = 'none';
    var pw = new TextEncoder().encode(document.getElementById('pw').value);
    crypto.subtle.importKey('raw', pw, 'PBKDF2', false, ['deriveKey'])
      .then(function (base) { return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: dec(DATA.salt), iterations: DATA.iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, true, ['decrypt']); })
      .then(function (key) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: dec(DATA.iv) }, key, dec(DATA.ct)).then(function () { return remember(key).then(function () { return open(key); }); }); })
      .catch(function () { err.style.display = 'block'; btn.disabled = false; btn.textContent = 'Continue'; });
  });
})();
</script>
</body>
</html>
`;
mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/index.html`, page);
writeFileSync(`${outDir}/.nojekyll`, '');
writeFileSync(`${outDir}/robots.txt`, 'User-agent: *\nDisallow: /\n');
console.log(`Encrypted ${input} (${plain.length} bytes) → ${outDir}/index.html`);
