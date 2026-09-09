"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { signOutAction } from "@/lib/auth/actions";
import type { CurrentAdmin } from "@/lib/auth/types";
import { roleLabel, userInitials } from "@/lib/admin/labels";

export function UserMenu({
  admin,
  variant = "default",
}: {
  admin: CurrentAdmin;
  variant?: "default" | "dashboard";
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const isSuper = admin.profile.role === "super_admin";
  const displayName =
    admin.profile.full_name?.trim() ||
    (variant === "dashboard" && isSuper
      ? "Super Admin"
      : admin.user.email || "Administrator");
  const role = roleLabel(admin.profile.role);
  const subtitle =
    variant === "dashboard" && isSuper ? "Swift Wave Group" : role;

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
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

  return (
    <div className="sw-admin-profile" ref={rootRef}>
      <button
        type="button"
        className="sw-admin-profile-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sw-admin-avatar sw-admin-avatar-sm" aria-hidden="true">
          {userInitials(admin.profile.full_name, admin.user.email)}
        </span>
        <span className="sw-admin-profile-copy">
          <strong>{displayName}</strong>
          <span>{subtitle}</span>
        </span>
        <svg
          className={`sw-admin-profile-chevron${open ? " is-open" : ""}`}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
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
        <div className="sw-admin-profile-menu" id={menuId} role="menu">
          <Link
            href="/admin/settings"
            className="sw-admin-profile-menu-item is-action"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          <form action={signOutAction} role="none">
            <button
              className="sw-admin-profile-menu-item is-action"
              type="submit"
              role="menuitem"
            >
              Logout
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
