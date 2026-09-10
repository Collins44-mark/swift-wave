"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

type NavigationProgressContextValue = {
  pending: boolean;
  markStart: (href?: string) => void;
};

const NavigationProgressContext =
  createContext<NavigationProgressContextValue | null>(null);

export function useNavigationProgress() {
  return useContext(NavigationProgressContext);
}

function destinationOf(href: string): string | null {
  if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return null;
  }
  if (href.startsWith("#")) return null;
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return null;
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);

  const markStart = useCallback((href?: string) => {
    if (href) {
      const next = destinationOf(href);
      const current = `${window.location.pathname}${window.location.search}`;
      if (!next || next === current) return;
    }
    setPending(true);
  }, []);

  useEffect(() => {
    setPending(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      markStart(anchor.getAttribute("href") || undefined);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [markStart]);

  const value = useMemo(
    () => ({ pending, markStart }),
    [pending, markStart]
  );

  return (
    <NavigationProgressContext.Provider value={value}>
      <div
        className={`sw-nav-progress${pending ? " is-active" : ""}`}
        role="progressbar"
        aria-hidden={!pending}
        aria-valuetext={pending ? "Loading page" : undefined}
      />
    </NavigationProgressContext.Provider>
  );
}
