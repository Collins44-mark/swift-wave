"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useNavigationProgress } from "@/components/navigation/NavigationProgress";

const GLOBE_SRC = "https://unpkg.com/globe.gl@2.33.1/dist/globe.gl.min.js";
const LUCIDE_SRC = "https://unpkg.com/lucide@0.460.0/dist/umd/lucide.min.js";

declare global {
  interface Window {
    lucide?: { createIcons: () => void };
    tailwind?: { refresh?: () => void };
    SwiftWaveGlobe?: { mount: () => void; remount: () => void };
    __swiftWaveLegacyCleanup?: () => void;
  }
}

const loadedLibraries = new Set<string>();

function loadLibraryOnce(src: string): Promise<void> {
  if (loadedLibraries.has(src)) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-sw-lib="${src}"]`
    );
    if (existing) {
      existing.addEventListener(
        "load",
        () => {
          loadedLibraries.add(src);
          resolve();
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.dataset.swLib = src;
    script.onload = () => {
      loadedLibraries.add(src);
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
}

async function runSiteScript(src: string): Promise<void> {
  const response = await fetch(src, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to fetch script: ${src}`);
  const code = await response.text();
  const script = document.createElement("script");
  script.text = code;
  document.body.appendChild(script);
  script.remove();
}

function resolveScriptSrc(src: string): string {
  if (src === "globe.gl") return GLOBE_SRC;
  return src;
}

function internalNavigationPath(anchor: HTMLAnchorElement): string | null {
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;
  if (anchor.hasAttribute("data-coming-soon")) return null;
  const href = anchor.getAttribute("href");
  if (!href) return null;
  if (
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("javascript:")
  ) {
    return null;
  }
  if (href.startsWith("#")) return null;
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return null;
    const next = `${url.pathname}${url.search}`;
    const current = `${window.location.pathname}${window.location.search}`;
    if (next === current) return null;
    return next;
  } catch {
    return null;
  }
}

type HtmlIslandProps = {
  html: string;
  scripts?: string[];
  bodyClassName?: string;
  bodyStyle?: string;
  bodyAttrs?: Record<string, string>;
};

export function HtmlIsland({
  html,
  scripts = [],
  bodyClassName,
  bodyStyle,
  bodyAttrs = {},
}: HtmlIslandProps) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const progress = useNavigationProgress();
  const attrsKey = JSON.stringify(bodyAttrs);
  const scriptsKey = scripts.join("|");

  useEffect(() => {
    const previousClass = document.body.className;
    const previousStyle = document.body.getAttribute("style");
    const previousAttrs = new Map<string, string | null>();
    const parsedAttrs = JSON.parse(attrsKey) as Record<string, string>;

    if (bodyClassName) document.body.className = bodyClassName;
    if (bodyStyle) document.body.setAttribute("style", bodyStyle);
    else document.body.removeAttribute("style");

    Object.entries(parsedAttrs).forEach(([key, value]) => {
      previousAttrs.set(key, document.body.getAttribute(key));
      document.body.setAttribute(key, value);
    });

    let cancelled = false;

    async function boot() {
      try {
        window.__swiftWaveLegacyCleanup?.();
        window.__swiftWaveLegacyCleanup = undefined;
        await loadLibraryOnce(LUCIDE_SRC);
        if (cancelled) return;

        for (const src of scriptsKey.split("|").filter(Boolean)) {
          const resolved = resolveScriptSrc(src);
          if (src === "globe.gl" || resolved.startsWith("http")) {
            await loadLibraryOnce(resolved);
          } else {
            await runSiteScript(resolved);
          }
          if (cancelled) return;
        }

        window.lucide?.createIcons();
        window.tailwind?.refresh?.();
        window.SwiftWaveGlobe?.mount?.();
      } catch (error) {
        console.error(error);
      }
    }

    void boot();

    return () => {
      cancelled = true;
      window.__swiftWaveLegacyCleanup?.();
      window.__swiftWaveLegacyCleanup = undefined;
      document.body.className = previousClass;
      if (previousStyle === null) document.body.removeAttribute("style");
      else document.body.setAttribute("style", previousStyle);

      previousAttrs.forEach((value, key) => {
        if (value === null) document.body.removeAttribute(key);
        else document.body.setAttribute(key, value);
      });

      Object.keys(parsedAttrs).forEach((key) => {
        if (!previousAttrs.has(key)) document.body.removeAttribute(key);
      });
    };
  }, [attrsKey, scriptsKey, bodyClassName, bodyStyle]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

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
      const next = internalNavigationPath(anchor);
      if (!next) return;
      event.preventDefault();
      progress?.markStart(next);
      router.push(next);
    };

    const onPointerOver = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const next = internalNavigationPath(anchor);
      if (!next) return;
      router.prefetch(next);
    };

    root.addEventListener("click", onClick);
    root.addEventListener("pointerover", onPointerOver);
    return () => {
      root.removeEventListener("click", onClick);
      root.removeEventListener("pointerover", onPointerOver);
    };
  }, [html, progress, router]);

  return (
    <div
      ref={ref}
      className="legacy-site-root"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
