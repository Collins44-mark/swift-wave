"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { CurrentAdmin } from "@/lib/auth/types";
import { UserMenu } from "@/components/admin/UserMenu";
import { CompanySwitcher } from "@/components/admin/CompanySwitcher";
import { AdminGlobalSearch } from "@/components/admin/AdminGlobalSearch";
import { useAdminShell } from "@/components/admin/AdminShell";

function titleFromPath(pathname: string): { title: string; breadcrumb: string } {
  if (pathname.match(/^\/admin\/companies\/[^/]+/)) {
    return { title: "Company Workspace", breadcrumb: "Admin / Companies / Detail" };
  }
  if (pathname.startsWith("/admin/companies")) {
    return { title: "Companies", breadcrumb: "Admin / Companies" };
  }
  if (pathname.startsWith("/admin/dashboard")) {
    return { title: "Dashboard", breadcrumb: "Admin / Dashboard" };
  }
  if (pathname.startsWith("/admin/products")) {
    return { title: "Products", breadcrumb: "Admin / Products" };
  }
  if (pathname.startsWith("/admin/categories")) {
    return { title: "Categories", breadcrumb: "Admin / Categories" };
  }
  if (pathname.startsWith("/admin/orders")) {
    return { title: "Orders", breadcrumb: "Admin / Orders" };
  }
  if (pathname.startsWith("/admin/website-content")) {
    return { title: "Website Content", breadcrumb: "Admin / Website Content" };
  }
  if (pathname.startsWith("/admin/media")) {
    return { title: "Media", breadcrumb: "Admin / Media" };
  }
  if (pathname.startsWith("/admin/whatsapp")) {
    return { title: "WhatsApp", breadcrumb: "Admin / WhatsApp" };
  }
  if (pathname.startsWith("/admin/settings/users")) {
    return { title: "Administrators", breadcrumb: "Admin / Settings / Users" };
  }
  if (pathname.startsWith("/admin/settings")) {
    return { title: "Settings", breadcrumb: "Admin / Settings" };
  }
  return { title: "Admin Console", breadcrumb: "Admin" };
}

function HamburgerIcon() {
  return (
    <span className="sw-admin-hamburger" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

export function AdminTopbar({ admin }: { admin: CurrentAdmin }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/admin/dashboard");
  const inCompanyWorkspace = Boolean(pathname.match(/^\/admin\/companies\/[^/]+/));
  const { title, breadcrumb } = titleFromPath(pathname);
  const { sidebarCollapsed, toggleSidebar, navOpen } = useAdminShell();
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 961px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const toggleLabel = isDesktop
    ? sidebarCollapsed
      ? "Expand sidebar"
      : "Collapse sidebar"
    : navOpen
      ? "Close navigation"
      : "Open navigation";

  return (
    <header
      className={`sw-admin-topbar${isDashboard ? " sw-admin-topbar--dashboard" : ""}`}
    >
      <div className="sw-admin-topbar-left">
        <button
          type="button"
          className="sw-admin-menu-btn"
          aria-label={toggleLabel}
          title={toggleLabel}
          onClick={toggleSidebar}
        >
          <HamburgerIcon />
        </button>

        {isDashboard ? (
          <AdminGlobalSearch />
        ) : (
          <div className="sw-admin-topbar-titles">
            <h1 className="sw-admin-page-title">{title}</h1>
            <p className="sw-admin-breadcrumb">{breadcrumb}</p>
          </div>
        )}
      </div>

      <div className="sw-admin-topbar-right">
        {!isDashboard && inCompanyWorkspace ? (
          <CompanySwitcher admin={admin} />
        ) : null}
        <UserMenu admin={admin} variant={isDashboard ? "dashboard" : "default"} />
      </div>
    </header>
  );
}
