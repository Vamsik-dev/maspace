import { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import { getSnapshot, navigate, subscribe } from './location';

// Drop-in replacements for the next/navigation hooks used by the app.
export const ParamsContext = createContext<Record<string, string>>({});

const useLoc = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

export function usePathname() {
  return useLoc().pathname;
}

export function useSearchParams() {
  const q = useLoc().query;
  return useMemo(() => new URLSearchParams(q), [q]);
}

export function useParams<T extends Record<string, string>>(): T {
  return useContext(ParamsContext) as T;
}

export function useRouter() {
  return useMemo(
    () => ({
      push: (href: string, opts?: { scroll?: boolean }) => navigate(href, opts),
      replace: (href: string, opts?: { scroll?: boolean }) => navigate(href, { ...opts, replace: true }),
      back: () => history.back(),
      refresh: () => {},
      prefetch: () => {},
    }),
    [],
  );
}

export function notFound(): never {
  throw new Error('Not found');
}
