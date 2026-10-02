import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from 'react';
import { navigate } from './location';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string | { pathname: string }; scroll?: boolean; prefetch?: boolean; replace?: boolean };

// Drop-in replacement for next/link in the shareable build.
const Link = forwardRef<HTMLAnchorElement, Props>(function Link({ href, scroll, prefetch: _p, replace, onClick, ...rest }, ref) {
  const to = typeof href === 'string' ? href : href.pathname;
  const external = /^https?:/.test(to);
  return (
    <a
      ref={ref}
      href={external ? to : `#${to}`}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (e.defaultPrevented || external || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(to, { scroll, replace });
      }}
      {...rest}
    />
  );
});

export default Link;
