"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { CurrentAdmin } from "@/lib/auth/types";
import { useNavigationProgress } from "@/components/navigation/NavigationProgress";

export function CompanySwitcher({ admin }: { admin: CurrentAdmin }) {
  const pathname = usePathname();
  const router = useRouter();
  const progress = useNavigationProgress();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const companies = admin.companies;
  const currentSlug = useMemo(() => {
    const m = pathname.match(/^\/admin\/companies\/([^/]+)/);
    return m?.[1] ?? null;
  }, [pathname]);

  const current =
    companies.find((c) => c.slug === currentSlug) ??
    admin.company ??
    companies[0] ??
    null;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (companies.length <= 1 && admin.profile.role !== "super_admin") {
    return current ? (
      <span className="sw-admin-company-switcher is-static" title={current.name}>
        {current.name}
      </span>
    ) : null;
  }

  if (!companies.length) return null;

  function goToCompany(slug: string) {
    setOpen(false);
    if (slug === currentSlug) return;
    const rest = pathname.replace(/^\/admin\/companies\/[^/]+/, "");
    const next = `/admin/companies/${slug}${rest || ""}`;
    progress?.markStart(next);
    router.push(next);
  }

  return (
    <div className="sw-admin-company-switcher" ref={rootRef}>
      <button
        type="button"
        className="sw-admin-company-switcher-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{current?.name ?? "Select company"}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open ? (
        <ul className="sw-admin-company-switcher-menu" role="listbox">
          {companies.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                role="option"
                aria-selected={c.slug === current?.slug}
                className={c.slug === current?.slug ? "is-active" : undefined}
                onClick={() => goToCompany(c.slug)}
              >
                {c.name}
              </button>
            </li>
          ))}
          <li className="sw-admin-company-switcher-all">
            <Link href="/admin/companies" onClick={() => setOpen(false)}>
              All companies
            </Link>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
