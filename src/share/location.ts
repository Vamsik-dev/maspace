// Hash-based location store used by the shareable single-file build, where the
// app runs inside a sandboxed frame without a server to resolve real paths.
type Listener = () => void;
const listeners = new Set<Listener>();

export function readLocation() {
  const raw = (typeof window === 'undefined' ? '' : window.location.hash.replace(/^#/, '')) || '/';
  const [pathAndQuery, frag] = raw.split('#');
  const [pathname, query = ''] = pathAndQuery.split('?');
  return { pathname: pathname || '/', query, frag: frag ?? '', full: raw };
}

let snapshot = readLocation();
const emit = () => {
  snapshot = readLocation();
  listeners.forEach((l) => l());
};
if (typeof window !== 'undefined') window.addEventListener('hashchange', emit);

export const subscribe = (l: Listener) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const getSnapshot = () => snapshot;

function scrollTop() {
  document.querySelector('#workspace-scroll .mantine-ScrollArea-viewport')?.scrollTo({ top: 0 });
  window.scrollTo({ top: 0 });
}

export function navigate(href: string, opts: { replace?: boolean; scroll?: boolean } = {}) {
  const target = href.startsWith('#') ? href.slice(1) : href;
  const prevPath = snapshot.pathname;
  if (opts.replace) {
    history.replaceState(null, '', `#${target}`);
  } else {
    history.pushState(null, '', `#${target}`);
  }
  emit();
  if (opts.scroll !== false && snapshot.pathname !== prevPath) scrollTop();
  if (snapshot.frag) setTimeout(() => document.getElementById(snapshot.frag)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
}

if (typeof window !== 'undefined') window.addEventListener('popstate', emit);
