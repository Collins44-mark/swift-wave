"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CurrentAdmin } from "@/lib/auth/types";
import { signOutAction } from "@/lib/auth/actions";
import { useAdminShell } from "@/components/admin/AdminShell";
import { userInitials, roleLabel } from "@/lib/admin/labels";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  superOnly?: boolean;
};

function Icon({ path }: { path: string }) {
  return (
    <svg className="sw-admin-nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SidebarCloseIcon() {
  return (
    <span className="sw-admin-hamburger" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

const MAIN_NAV: NavItem[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: <Icon path="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />,
  },
  {
    href: "/admin/companies",
    label: "Companies",
    icon: <Icon path="M4 20V8.5L12 4l8 4.5V20M9 20v-6h6v6" />,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: <Icon path="M6 8h12M6 12h12M6 16h8M4 4h16v16H4V4Z" />,
  },
  {
    href: "/admin/website-content",
    label: "Website Content",
    icon: <Icon path="M5 5.5h14v13H5V5.5Zm0 4h14M9 13.5h6" />,
  },
  {
    href: "/admin/whatsapp",
    label: "WhatsApp",
    icon: <Icon path="M8 10.5c1.2 2.4 3.1 4.3 5.5 5.5l1.8-1.8c.3-.3.8-.4 1.2-.2 1 .4 2.1.7 3.2.7.7 0 1.2.5 1.2 1.2V20c0 .7-.5 1.2-1.2 1.2C10.9 21.2 2.8 13.1 2.8 3.2 2.8 2.5 3.3 2 4 2h2.8c.7 0 1.2.5 1.2 1.2 0 1.1.3 2.2.7 3.2.1.4 0 .9-.2 1.2L8 10.5Z" />,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: <Icon path="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm8.5 3.5a8.4 8.4 0 0 1-.2 1.8l2 1.5-1.9 3.3-2.4-1a8.6 8.6 0 0 1-1.6.9l-.4 2.6H9l-.4-2.6a8.6 8.6 0 0 1-1.6-.9l-2.4 1-1.9-3.3 2-1.5a8.4 8.4 0 0 1-.2-1.8c0-.6.1-1.2.2-1.8l-2-1.5 1.9-3.3 2.4 1c.5-.4 1-.7 1.6-.9l.4-2.6h3.8l.4 2.6c.6.2 1.1.5 1.6.9l2.4-1 1.9 3.3-2 1.5c.1.6.2 1.2.2 1.8Z" />,
  },
];

const ADMIN_NAV: NavItem[] = [
  {
    href: "/admin/settings/users",
    label: "Administrators",
    icon: <Icon path="M16 11.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0ZM5 19.5a6 6 0 0 1 12 0" />,
    superOnly: true,
  },
  {
    href: "/admin/settings",
    label: "Roles & Permissions",
    icon: <Icon path="M12 3.5l7.5 4.3v8.4L12 20.5 4.5 16.2V7.8L12 3.5Zm0 4.2v8.6" />,
    superOnly: true,
  },
];

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active =
    pathname === item.href ||
    (item.href !== "/admin/dashboard" && pathname.startsWith(`${item.href}/`));

  return (
    <Link
      href={item.href}
      className={active ? "is-active" : undefined}
      aria-current={active ? "page" : undefined}
      title={item.label}
      onClick={onNavigate}
    >
      {item.icon}
      <span className="sw-admin-nav-label">{item.label}</span>
    </Link>
  );
}

export function AdminSidebar({
  admin,
  onNavigate,
}: {
  admin: CurrentAdmin;
  onNavigate?: () => void;
  companyCount?: number;
}) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useAdminShell();
  const isSuper = admin.profile.role === "super_admin";
  const displayName =
    admin.profile.full_name?.trim() ||
    (isSuper ? "Super Admin" : roleLabel(admin.profile.role));
  const orgSubtitle = isSuper ? "Swift Wave Group" : roleLabel(admin.profile.role);

  return (
    <aside
      className="sw-admin-sidebar sw-admin-sidebar--dark"
      aria-label="Admin sidebar"
      data-collapsed={sidebarCollapsed ? "true" : "false"}
    >
      <div className="sw-admin-brand sw-admin-brand--horizontal">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/images/logo.png" alt="" className="sw-admin-brand-logo" />
        <div className="sw-admin-brand-copy">
          <span className="sw-admin-brand-title">Swift Wave Group</span>
          <span className="sw-admin-brand-console">Admin Console</span>
        </div>
        <button
          type="button"
          className="sw-admin-sidebar-collapse"
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
          onClick={toggleSidebar}
        >
          <SidebarCloseIcon />
        </button>
      </div>

      <nav className="sw-admin-nav" aria-label="Primary">
        {MAIN_NAV.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {isSuper ? (
        <>
          <div className="sw-admin-nav-divider" aria-hidden="true" />
          <p className="sw-admin-nav-section-label">Administration</p>
          <nav className="sw-admin-nav sw-admin-nav--secondary" aria-label="Administration">
            {ADMIN_NAV.map((item) => (
              <NavLink
                key={item.label}
                item={item}
                pathname={pathname}
                onNavigate={onNavigate}
              />
            ))}
          </nav>
        </>
      ) : null}

      <div className="sw-admin-sidebar-profile">
        <div className="sw-admin-sidebar-profile-main">
          <span className="sw-admin-avatar sw-admin-avatar-sidebar" aria-hidden="true">
            {userInitials(admin.profile.full_name, admin.user.email)}
          </span>
          <div className="sw-admin-user-meta">
            <strong>{displayName}</strong>
            <span>{orgSubtitle}</span>
          </div>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="sw-admin-sidebar-logout-icon"
            aria-label="Logout"
            title="Logout"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M10 7V5.8A1.8 1.8 0 0 1 11.8 4h6.4A1.8 1.8 0 0 1 20 5.8v12.4a1.8 1.8 0 0 1-1.8 1.8h-6.4A1.8 1.8 0 0 1 10 18.2V17M14 12H4m0 0 2.5-2.5M4 12l2.5 2.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
      </div>
    </aside>
  );
}
