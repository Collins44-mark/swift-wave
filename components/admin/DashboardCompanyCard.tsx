"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { CompanyRecord } from "@/lib/admin/company-types";
import { CompanyMark } from "@/components/admin/CompanyMark";
import { LinkPendingFlag } from "@/components/navigation/LinkPendingFlag";

export function DashboardCompanyCard({ company }: { company: CompanyRecord }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <article className="sw-dash-company-card">
      <div className="sw-dash-company-card-head">
        <span className="sw-dash-company-icon" aria-hidden="true">
          <CompanyMark slug={company.slug} />
        </span>
        <span
          className={`sw-dash-active-badge${company.is_active ? "" : " is-inactive"}`}
        >
          <span className="sw-dash-active-dot" aria-hidden="true" />
          {company.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      <h3 className="sw-dash-company-name">{company.name}</h3>

      <div className="sw-dash-company-actions">
        <Link
          className="sw-dash-manage-btn"
          href={`/admin/companies/${company.slug}`}
        >
          <LinkPendingFlag />
          Manage Company
          <span aria-hidden="true">→</span>
        </Link>

        <div className="sw-dash-overflow" ref={rootRef}>
          <button
            type="button"
            className="sw-dash-overflow-btn"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={`More actions for ${company.name}`}
            onClick={() => setOpen((v) => !v)}
          >
            ···
          </button>
          {open ? (
            <div className="sw-dash-overflow-menu" id={menuId} role="menu">
              <Link
                href={`/admin/companies/${company.slug}`}
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                Manage Company
              </Link>
              <Link
                href={`/admin/companies/${company.slug}/website-content`}
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                Website Content
              </Link>
              <Link
                href={`/admin/companies/${company.slug}/settings`}
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                Settings
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
