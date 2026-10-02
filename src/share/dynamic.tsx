import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';

// Minimal next/dynamic replacement for the shareable build.
export default function dynamic<P extends object>(loader: () => Promise<{ default: ComponentType<P> } | ComponentType<P>>, opts?: { loading?: () => ReactNode; ssr?: boolean }) {
  const L = lazy(async () => {
    const m = await loader();
    return { default: ((m as { default?: ComponentType<P> }).default ?? m) as ComponentType<P> };
  });
  return function Dynamic(props: P) {
    return (
      <Suspense fallback={opts?.loading?.() ?? null}>
        <L {...props} />
      </Suspense>
    );
  };
}
