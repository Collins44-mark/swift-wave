"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CurrentAdmin } from "@/lib/auth/types";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

type AdminShellContextValue = {
  navOpen: boolean;
  closeNav: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
};

const AdminShellContext = createContext<AdminShellContextValue | null>(null);

export function useAdminShell() {
  const ctx = useContext(AdminShellContext);
  if (!ctx) throw new Error("useAdminShell must be used within AdminShell");
  return ctx;
}

const COLLAPSE_KEY = "sw-admin-sidebar-collapsed";

export function AdminShell({
  admin,
  children,
  companyCount,
}: {
  admin: CurrentAdmin;
  children: React.ReactNode;
  companyCount?: number;
}) {
  const [navOpen, setNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COLLAPSE_KEY);
      if (stored === "1") setSidebarCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  const closeNav = useCallback(() => setNavOpen(false), []);

  const toggleSidebar = useCallback(() => {
    const isDesktop = window.matchMedia("(min-width: 961px)").matches;
    if (isDesktop) {
      setSidebarCollapsed((prev) => {
        const next = !prev;
        try {
          window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
        } catch {
          /* ignore */
        }
        return next;
      });
      return;
    }
    setNavOpen((v) => !v);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", navOpen);
    return () => document.body.classList.remove("menu-open");
  }, [navOpen]);

  const value = useMemo(
    () => ({ navOpen, closeNav, sidebarCollapsed, toggleSidebar }),
    [navOpen, closeNav, sidebarCollapsed, toggleSidebar]
  );

  return (
    <AdminShellContext.Provider value={value}>
      <div
        className={`sw-admin-shell${navOpen ? " is-nav-open" : ""}${
          sidebarCollapsed ? " is-collapsed" : ""
        }`}
      >
        <button
          type="button"
          className="sw-admin-backdrop"
          aria-label="Close navigation"
          onClick={closeNav}
        />
        <AdminSidebar
          admin={admin}
          onNavigate={closeNav}
          companyCount={companyCount}
        />
        <div className="sw-admin-main">
          <AdminTopbar admin={admin} />
          <div className="sw-admin-content">{children}</div>
        </div>
      </div>
    </AdminShellContext.Provider>
  );
}
